import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  TTSParams, 
  TTSResponse, 
  FishAudioAPIRequest,
  FishAudioError,
  ErrorCode 
} from '../types/index.js';
import { loadConfig } from '../utils/config.js';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

export class FishAudioService {
  private client: AxiosInstance;
  private apiKey: string;
  private modelId: string;

  constructor() {
    const config = loadConfig();
    this.apiKey = config.apiKey;
    this.modelId = config.modelId;
    
    this.client = axios.create({
      baseURL: 'https://api.fish.audio/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000, // 60 seconds
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
  }

  async generateSpeech(params: TTSParams): Promise<TTSResponse> {
    try {
      const requestData: FishAudioAPIRequest = {
        text: params.text,
        reference_id: params.referenceId,
        format: params.format || 'mp3',
        mp3_bitrate: params.mp3Bitrate,
        normalize: params.normalize !== false,
        latency: params.latency || 'balanced',
        streaming: false
      };

      const response = await this.client.post('/tts', requestData, {
        responseType: 'arraybuffer'
      });

      const audioBuffer = Buffer.from(response.data);

      return {
        audio: audioBuffer,
        format: params.format || 'mp3'
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async *generateSpeechStream(params: TTSParams, outputPath: string): AsyncGenerator<number> {
    try {
      const requestData: FishAudioAPIRequest = {
        text: params.text,
        reference_id: params.referenceId,
        format: params.format || 'mp3',
        mp3_bitrate: params.mp3Bitrate,
        normalize: params.normalize !== false,
        latency: params.latency || 'balanced',
        streaming: true
      };

      const response = await this.client.post('/tts', requestData, {
        responseType: 'stream'
      });

      const writeStream = createWriteStream(outputPath);
      let totalBytes = 0;

      // Create a pass-through stream to track progress
      const stream = response.data as Readable;
      
      stream.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        writeStream.write(chunk);
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('end', () => {
          writeStream.end();
          resolve();
        });
        stream.on('error', reject);
        writeStream.on('error', reject);
      });

      yield totalBytes;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): FishAudioError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;
        
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
      } else if (axiosError.request) {
        return new FishAudioError(
          'Network error: Unable to reach Fish Audio API',
          ErrorCode.NETWORK_ERROR,
          { message: axiosError.message }
        );
      }
    }
    
    return new FishAudioError(
      'Unknown error occurred',
      ErrorCode.UNKNOWN_ERROR,
      { message: error.message }
    );
  }
}