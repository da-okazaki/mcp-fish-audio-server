import { config as dotenvConfig } from 'dotenv';
import { Config, AudioFormat, Mp3Bitrate } from '../types/index.js';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

dotenvConfig();

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseAudioFormat(value: string | undefined, defaultValue: AudioFormat): AudioFormat {
  if (!value) return defaultValue;
  const validFormats: AudioFormat[] = ['mp3', 'wav', 'pcm', 'opus'];
  const format = value.toLowerCase() as AudioFormat;
  return validFormats.includes(format) ? format : defaultValue;
}

function parseMp3Bitrate(value: string | undefined, defaultValue: Mp3Bitrate): Mp3Bitrate {
  if (!value) return defaultValue;
  const bitrate = parseInt(value);
  const validBitrates: Mp3Bitrate[] = [64, 128, 192];
  return validBitrates.includes(bitrate as Mp3Bitrate) ? (bitrate as Mp3Bitrate) : defaultValue;
}

let configCache: Config | null = null;

export function loadConfig(): Config {
  if (configCache) {
    return configCache;
  }

  const apiKey = process.env.FISH_API_KEY;
  if (!apiKey) {
    throw new Error('FISH_API_KEY environment variable is required');
  }

  // Default to user's home directory for audio output
  const defaultOutputDir = join(homedir(), '.fish-audio-mcp', 'audio_output');
  const audioOutputDir = process.env.AUDIO_OUTPUT_DIR || defaultOutputDir;
  const resolvedOutputDir = resolve(audioOutputDir);
  
  // Create output directory if it doesn't exist
  try {
    if (!existsSync(resolvedOutputDir)) {
      mkdirSync(resolvedOutputDir, { recursive: true });
    }
  } catch (error) {
    console.error(`Warning: Could not create audio output directory at ${resolvedOutputDir}. Audio files will be saved to memory only.`);
  }

  const streaming = parseBoolean(process.env.FISH_STREAMING, false);
  const autoPlay = parseBoolean(process.env.FISH_AUTO_PLAY, false);
  
  const config: Config = {
    apiKey,
    modelId: process.env.FISH_MODEL_ID || 's1',
    referenceId: process.env.FISH_REFERENCE_ID,
    outputFormat: parseAudioFormat(process.env.FISH_OUTPUT_FORMAT, 'mp3'),
    streaming: streaming,
    mp3Bitrate: parseMp3Bitrate(process.env.FISH_MP3_BITRATE, 128),
    audioOutputDir: resolvedOutputDir,
    autoPlay: autoPlay,
    // Map FISH_STREAMING to websocketStreaming if FISH_WEBSOCKET_STREAMING is not set
    websocketStreaming: parseBoolean(process.env.FISH_WEBSOCKET_STREAMING, streaming),
    // Map FISH_AUTO_PLAY to realtimePlay if FISH_REALTIME_PLAY is not set
    realtimePlay: parseBoolean(process.env.FISH_REALTIME_PLAY, autoPlay)
  };

  configCache = config;
  return config;
}

export function getOutputPath(format: string): string {
  const config = loadConfig();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `tts_${timestamp}.${format}`;
  return join(config.audioOutputDir, filename);
}