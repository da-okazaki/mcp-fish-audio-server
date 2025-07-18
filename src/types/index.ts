export interface ReferenceConfig {
  id: string;
  name?: string;
  tags?: string[];
}

export interface Config {
  apiKey: string;
  modelId: string;
  referenceId?: string;
  references?: ReferenceConfig[];
  defaultReference?: string;
  outputFormat: AudioFormat;
  streaming: boolean;
  mp3Bitrate: Mp3Bitrate;
  audioOutputDir: string;
  autoPlay?: boolean;
  websocketStreaming?: boolean;
  realtimePlay?: boolean;
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
  websocketStreaming?: boolean;
}

export interface TTSResponse {
  audio: Buffer;
  format: string;
  duration?: number;
}

export interface TTSToolParams {
  text: string;
  reference_id?: string;
  reference_name?: string;
  reference_tag?: string;
  streaming?: boolean;
  websocket_streaming?: boolean;
  realtime_play?: boolean;
  format?: AudioFormat;
  mp3_bitrate?: Mp3Bitrate;
  normalize?: boolean;
  latency?: LatencyMode;
  output_path?: string;
  auto_play?: boolean;
}

export interface TTSToolResponse {
  success: boolean;
  audio_data?: string; // Base64 encoded
  file_path?: string;
  format?: string;
  played?: boolean;
  streaming_mode?: 'http' | 'websocket';
  total_bytes?: number;
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