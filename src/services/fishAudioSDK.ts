import { Session, WebSocketSession, TTSRequest, ReferenceAudio } from 'fish-audio-sdk';
import { 
  TTSParams, 
  TTSResponse, 
  FishAudioError,
  ErrorCode 
} from '../types/index.js';
import { loadConfig } from '../utils/config.js';
import { createWriteStream } from 'fs';
import { Writable } from 'stream';

export class FishAudioSDKService {
  private apiKey: string;
  private modelId: string;

  constructor() {
    const config = loadConfig();
    this.apiKey = config.apiKey;
    this.modelId = config.modelId;
  }

  /**
   * Generate speech using standard HTTP API
   */
  async generateSpeech(params: TTSParams): Promise<TTSResponse> {
    try {
      const session = new Session(this.apiKey);
      const chunks: Buffer[] = [];

      const request = new TTSRequest(params.text, {
        referenceId: params.referenceId,
        format: params.format || 'mp3',
        mp3Bitrate: params.mp3Bitrate,
        normalize: params.normalize !== false,
        latency: params.latency || 'balanced',
      });

      // Use the specified model
      const headers = { model: this.modelId };

      for await (const chunk of session.tts(request, headers)) {
        chunks.push(Buffer.from(chunk));
      }

      const audioBuffer = Buffer.concat(chunks);

      return {
        audio: audioBuffer,
        format: params.format || 'mp3'
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate speech with streaming to file
   */
  async generateSpeechStream(params: TTSParams, outputPath: string): Promise<number> {
    try {
      const session = new Session(this.apiKey);
      const writeStream = createWriteStream(outputPath);
      let totalBytes = 0;

      const request = new TTSRequest(params.text, {
        referenceId: params.referenceId,
        format: params.format || 'mp3',
        mp3Bitrate: params.mp3Bitrate,
        normalize: params.normalize !== false,
        latency: params.latency || 'balanced',
      });

      const headers = { model: this.modelId };

      for await (const chunk of session.tts(request, headers)) {
        const buffer = Buffer.from(chunk);
        totalBytes += buffer.length;
        writeStream.write(buffer);
      }

      writeStream.end();

      return totalBytes;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate speech using WebSocket for real-time streaming
   */
  async *generateSpeechWebSocket(
    params: TTSParams,
    textChunks: string[] | AsyncGenerator<string>
  ): AsyncGenerator<Buffer> {
    try {
      const ws = new WebSocketSession(this.apiKey);

      const request = new TTSRequest('', {
        referenceId: params.referenceId,
        format: params.format || 'opus', // Opus is better for streaming
        mp3Bitrate: params.mp3Bitrate,
        normalize: params.normalize !== false,
        latency: params.latency || 'balanced',
      });

      const headers = { model: this.modelId };

      // Convert array to async generator if needed
      const textGenerator = Array.isArray(textChunks) 
        ? this.arrayToAsyncGenerator(textChunks)
        : textChunks;

      for await (const audioChunk of ws.tts(request, textGenerator)) {
        yield Buffer.from(audioChunk);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream speech to a writable stream (for real-time playback)
   */
  async streamToPlayer(
    params: TTSParams,
    textChunks: string[] | AsyncGenerator<string>,
    playerStream: Writable
  ): Promise<number> {
    try {
      let totalBytes = 0;

      const audioStream = this.generateSpeechWebSocket(params, textChunks);

      for await (const chunk of audioStream) {
        totalBytes += chunk.length;
        playerStream.write(chunk);
      }

      playerStream.end();
      return totalBytes;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Helper to convert array to async generator
   */
  private async *arrayToAsyncGenerator(array: string[]): AsyncGenerator<string> {
    for (const item of array) {
      yield item;
    }
  }

  private handleError(error: any): FishAudioError {
    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return new FishAudioError(
            'Invalid API key',
            ErrorCode.INVALID_API_KEY,
            data
          );
        case 400:
          return new FishAudioError(
            'Invalid request parameters',
            ErrorCode.INVALID_PARAMS,
            data
          );
        case 429:
          return new FishAudioError(
            'API quota exceeded',
            ErrorCode.QUOTA_EXCEEDED,
            data
          );
        case 500:
        case 502:
        case 503:
          return new FishAudioError(
            'Fish Audio server error',
            ErrorCode.SERVER_ERROR,
            data
          );
        default:
          return new FishAudioError(
            `API error: ${status}`,
            ErrorCode.UNKNOWN_ERROR,
            data
          );
      }
    }
    
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return new FishAudioError(
        'Network error: Unable to reach Fish Audio API',
        ErrorCode.NETWORK_ERROR,
        { message: error.message }
      );
    }
    
    return new FishAudioError(
      error?.message || 'Unknown error occurred',
      ErrorCode.UNKNOWN_ERROR,
      { message: error?.message }
    );
  }
}