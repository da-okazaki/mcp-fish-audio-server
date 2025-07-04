import { config as dotenvConfig } from 'dotenv';
import { Config, AudioFormat, Mp3Bitrate, ReferenceConfig } from '../types/index.js';
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

function parseReferences(): ReferenceConfig[] {
  const references: ReferenceConfig[] = [];
  
  // Parse FISH_REFERENCES as JSON array
  const referencesStr = process.env.FISH_REFERENCES;
  if (referencesStr) {
    try {
      const parsedRefs = JSON.parse(referencesStr);
      if (Array.isArray(parsedRefs)) {
        for (const ref of parsedRefs) {
          if (ref.reference_id || ref.id) {
            references.push({
              id: ref.reference_id || ref.id,
              name: ref.name,
              tags: ref.tags
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse FISH_REFERENCES as JSON:', error);
      console.error('Please use JSON array format: [{"reference_id":"id1","name":"Alice","tags":["female","english"]}]');
    }
  }
  
  // Fallback: support individual reference configs for backward compatibility
  if (references.length === 0) {
    for (let i = 1; i <= 10; i++) {
      const id = process.env[`FISH_REFERENCE_${i}_ID`];
      if (id) {
        references.push({
          id,
          name: process.env[`FISH_REFERENCE_${i}_NAME`],
          tags: process.env[`FISH_REFERENCE_${i}_TAGS`]?.split(',').map(t => t.trim())
        });
      }
    }
  }
  
  return references;
}

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
  let audioOutputDir = process.env.AUDIO_OUTPUT_DIR || defaultOutputDir;
  
  // Expand ~ to home directory if present
  if (audioOutputDir.startsWith('~/')) {
    audioOutputDir = join(homedir(), audioOutputDir.slice(2));
  }
  
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
  
  // Parse references
  const references = parseReferences();
  const defaultReference = process.env.FISH_DEFAULT_REFERENCE || process.env.FISH_REFERENCE_ID;
  
  const config: Config = {
    apiKey,
    modelId: process.env.FISH_MODEL_ID || 's1',
    referenceId: process.env.FISH_REFERENCE_ID, // Keep for backward compatibility
    references,
    defaultReference,
    outputFormat: parseAudioFormat(process.env.FISH_OUTPUT_FORMAT, 'mp3'),
    streaming: streaming,
    mp3Bitrate: parseMp3Bitrate(process.env.FISH_MP3_BITRATE, 128),
    audioOutputDir: resolvedOutputDir,
    autoPlay: autoPlay,
    websocketStreaming: false,  // Default to false for HTTP streaming
    realtimePlay: false  // Default to false for standard playback
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