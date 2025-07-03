import { FishAudioSDKService } from '../services/fishAudioSDK.js';
import { 
  TTSToolParams, 
  TTSToolResponse,
  TTSParams,
  AudioFormat,
  Mp3Bitrate,
  LatencyMode,
  FishAudioError
} from '../types/index.js';
import { loadConfig, getOutputPath } from '../utils/config.js';
import { writeFileSync, createWriteStream } from 'fs';
import { playAudio, isAudioPlaybackSupported } from '../utils/audioPlayer.js';
import { RealTimeAudioPlayer } from '../utils/realTimePlayer.js';

export class TTSTool {
  name = 'fish_audio_tts';
  description = 'Generate speech from text using Fish Audio TTS API';
  
  inputSchema = {
    type: 'object' as const,
    properties: {
      text: {
        type: 'string',
        description: 'Text to convert to speech',
        maxLength: 10000
      },
      reference_id: {
        type: 'string',
        description: 'Voice model reference ID (optional)'
      },
      streaming: {
        type: 'boolean',
        description: 'Enable HTTP streaming mode (optional)',
        default: false
      },
      websocket_streaming: {
        type: 'boolean',
        description: 'Enable WebSocket streaming mode (optional)',
        default: false
      },
      realtime_play: {
        type: 'boolean',
        description: 'Enable real-time audio playback during streaming (optional)',
        default: false
      },
      format: {
        type: 'string',
        enum: ['mp3', 'wav', 'pcm', 'opus'],
        description: 'Output audio format (optional)',
        default: 'mp3'
      },
      mp3_bitrate: {
        type: 'number',
        enum: [64, 128, 192],
        description: 'MP3 bitrate in kbps (optional)',
        default: 128
      },
      normalize: {
        type: 'boolean',
        description: 'Enable text normalization (optional)',
        default: true
      },
      latency: {
        type: 'string',
        enum: ['normal', 'balanced'],
        description: 'Latency mode (optional)',
        default: 'balanced'
      },
      output_path: {
        type: 'string',
        description: 'Custom output file path (optional)'
      },
      auto_play: {
        type: 'boolean',
        description: 'Automatically play the generated audio (optional)',
        default: false
      }
    },
    required: ['text']
  };

  private service: FishAudioSDKService;

  constructor() {
    this.service = new FishAudioSDKService();
  }

  async run(input: TTSToolParams): Promise<TTSToolResponse> {
    try {
      // Validate input
      if (!input.text || input.text.trim().length === 0) {
        return {
          success: false,
          error: 'Text input is required'
        };
      }

      if (input.text.length > 10000) {
        return {
          success: false,
          error: 'Text length exceeds maximum limit of 10,000 characters'
        };
      }

      const config = loadConfig();
      
      // Prepare parameters
      const ttsParams = {
        text: input.text,
        referenceId: input.reference_id || config.referenceId,
        format: (input.format || config.outputFormat) as AudioFormat,
        mp3Bitrate: (input.mp3_bitrate || config.mp3Bitrate) as Mp3Bitrate,
        normalize: input.normalize !== false,
        latency: (input.latency || 'balanced') as LatencyMode,
        streaming: input.streaming ?? config.streaming
      };

      // Determine output path
      const outputPath = input.output_path || getOutputPath(ttsParams.format || 'mp3');
      
      // Determine if auto-play is enabled
      const shouldAutoPlay = input.auto_play ?? config.autoPlay;
      
      // Determine if WebSocket streaming is enabled
      const useWebSocketStreaming = input.websocket_streaming ?? config.websocketStreaming;

      // WebSocket streaming mode with real-time playback
      if (useWebSocketStreaming) {
        return await this.handleWebSocketStreaming(input, ttsParams, outputPath, shouldAutoPlay || false);
      }
      
      if (ttsParams.streaming) {
        // HTTP Streaming mode
        const totalBytes = await this.service.generateSpeechStream(ttsParams, outputPath);

        // Auto-play if requested
        if (shouldAutoPlay && isAudioPlaybackSupported()) {
          try {
            await playAudio(outputPath);
          } catch (playError) {
            console.error('Audio playback failed:', playError);
          }
        }

        return {
          success: true,
          file_path: outputPath,
          format: ttsParams.format,
          played: shouldAutoPlay || false
        };
      } else {
        // Non-streaming mode
        const response = await this.service.generateSpeech(ttsParams);
        
        // Save to file if output path is specified
        if (outputPath) {
          writeFileSync(outputPath, response.audio);
          
          // Auto-play if requested
          if (shouldAutoPlay && isAudioPlaybackSupported()) {
            try {
              await playAudio(outputPath);
            } catch (playError) {
              console.error('Audio playback failed:', playError);
            }
          }
          
          return {
            success: true,
            file_path: outputPath,
            format: response.format,
            played: shouldAutoPlay || false
          };
        } else {
          // Return base64 encoded audio
          return {
            success: true,
            audio_data: response.audio.toString('base64'),
            format: response.format
          };
        }
      }
    } catch (error) {
      if (error instanceof FishAudioError) {
        return {
          success: false,
          error: `${error.message} (${error.code})`
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async handleWebSocketStreaming(
    input: TTSToolParams,
    ttsParams: TTSParams,
    outputPath: string,
    shouldAutoPlay: boolean
  ): Promise<TTSToolResponse> {
    const writeStream = outputPath ? createWriteStream(outputPath) : null;
    let realTimePlayer: RealTimeAudioPlayer | null = null;
    let totalBytes = 0;
    const audioChunks: Buffer[] = [];

    try {
      // Set up real-time player if requested
      const config = loadConfig();
      const shouldRealtimePlay = input.realtime_play ?? config.realtimePlay;
      
      if (shouldRealtimePlay && isAudioPlaybackSupported()) {
        realTimePlayer = new RealTimeAudioPlayer();
        realTimePlayer.start(ttsParams.format || 'opus');
      }

      // Split text into chunks for streaming
      const textChunks = this.splitTextIntoChunks(input.text);

      // Stream via WebSocket
      const audioStream = this.service.generateSpeechWebSocket(ttsParams, textChunks);

      for await (const audioChunk of audioStream) {
        totalBytes += audioChunk.length;
        
        // Write to file if output path specified
        if (writeStream) {
          writeStream.write(audioChunk);
        }
        
        // Play in real-time if requested
        if (realTimePlayer) {
          realTimePlayer.write(audioChunk);
        }
        
        // Collect chunks for post-playback if auto-play is enabled
        if (shouldAutoPlay && !shouldRealtimePlay) {
          audioChunks.push(audioChunk);
        }
      }

      // Close write stream
      if (writeStream) {
        writeStream.end();
      }

      // Stop real-time player
      if (realTimePlayer) {
        realTimePlayer.stop();
      }

      // Auto-play collected audio if requested (and not already played in real-time)
      let played = false;
      if (shouldAutoPlay && !shouldRealtimePlay && outputPath && isAudioPlaybackSupported()) {
        try {
          await playAudio(outputPath);
          played = true;
        } catch (playError) {
          console.error('Audio playback failed:', playError);
        }
      } else if (shouldRealtimePlay) {
        played = true;
      }

      return {
        success: true,
        file_path: outputPath || undefined,
        format: ttsParams.format,
        played,
        streaming_mode: 'websocket',
        total_bytes: totalBytes
      };
    } catch (error) {
      // Clean up on error
      if (writeStream) {
        writeStream.end();
      }
      if (realTimePlayer) {
        realTimePlayer.stop();
      }
      throw error;
    }
  }

  private splitTextIntoChunks(text: string, chunkSize: number = 100): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}