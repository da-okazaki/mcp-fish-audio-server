import { config as dotenvConfig } from 'dotenv';
import { Config, AudioFormat, Mp3Bitrate } from '../types/index.js';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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

export function loadConfig(): Config {
  const apiKey = process.env.FISH_API_KEY;
  if (!apiKey) {
    throw new Error('FISH_API_KEY environment variable is required');
  }

  const audioOutputDir = process.env.AUDIO_OUTPUT_DIR || './audio_output';
  
  // Create output directory if it doesn't exist
  if (!existsSync(audioOutputDir)) {
    mkdirSync(audioOutputDir, { recursive: true });
  }

  const config: Config = {
    apiKey,
    modelId: process.env.FISH_MODEL_ID || 's1',
    referenceId: process.env.FISH_REFERENCE_ID,
    outputFormat: parseAudioFormat(process.env.FISH_OUTPUT_FORMAT, 'mp3'),
    streaming: parseBoolean(process.env.FISH_STREAMING, false),
    mp3Bitrate: parseMp3Bitrate(process.env.FISH_MP3_BITRATE, 128),
    audioOutputDir
  };

  return config;
}

export function getOutputPath(format: string): string {
  const config = loadConfig();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `tts_${timestamp}.${format}`;
  return join(config.audioOutputDir, filename);
}