import { FishAudioService } from '../services/fishAudio.js';
import { 
  TTSToolParams, 
  TTSToolResponse,
  AudioFormat,
  Mp3Bitrate,
  LatencyMode,
  FishAudioError
} from '../types/index.js';
import { loadConfig, getOutputPath } from '../utils/config.js';
import { writeFileSync } from 'fs';

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
        description: 'Enable streaming mode (optional)',
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
      }
    },
    required: ['text']
  };

  private service: FishAudioService;

  constructor() {
    this.service = new FishAudioService();
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

      if (ttsParams.streaming) {
        // Streaming mode
        const generator = this.service.generateSpeechStream(ttsParams, outputPath);
        let totalBytes = 0;
        
        for await (const bytes of generator) {
          totalBytes = bytes;
        }

        return {
          success: true,
          file_path: outputPath,
          format: ttsParams.format
        };
      } else {
        // Non-streaming mode
        const response = await this.service.generateSpeech(ttsParams);
        
        // Save to file if output path is specified
        if (outputPath) {
          writeFileSync(outputPath, response.audio);
          return {
            success: true,
            file_path: outputPath,
            format: response.format
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
}