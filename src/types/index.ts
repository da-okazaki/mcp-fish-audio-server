export interface Config {
  apiKey: string;
  modelId: string;
  referenceId?: string;
  outputFormat: AudioFormat;
  streaming: boolean;
  mp3Bitrate: Mp3Bitrate;
  audioOutputDir: string;
}

export type AudioFormat = 'mp3' | 'wav' | 'pcm' | 'opus';
export type Mp3Bitrate = 64 | 128 | 192;
export type LatencyMode = 'normal' | 'balanced';

export interface TTSParams {
  text: string;
  referenceId?: string;
  format?: AudioFormat;
  mp3Bitrate?: Mp3Bitrate;
  normalize?: boolean;
  latency?: LatencyMode;
  chunkLength?: number;
  streaming?: boolean;
}

export interface TTSResponse {
  audio: Buffer;
  format: string;
  duration?: number;
}

export interface TTSToolParams {
  text: string;
  reference_id?: string;
  streaming?: boolean;
  format?: AudioFormat;
  mp3_bitrate?: Mp3Bitrate;
  normalize?: boolean;
  latency?: LatencyMode;
  output_path?: string;
}

export interface TTSToolResponse {
  success: boolean;
  audio_data?: string; // Base64 encoded
  file_path?: string;
  format?: string;
  error?: string;
}

export interface FishAudioAPIRequest {
  text: string;
  reference_id?: string;
  chunk_length?: number;
  format?: string;
  mp3_bitrate?: number;
  normalize?: boolean;
  latency?: string;
  streaming?: boolean;
}

export interface FishAudioAPIResponse {
  status: string;
  data?: any;
  error?: string;
}

export enum ErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class FishAudioError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'FishAudioError';
  }
}