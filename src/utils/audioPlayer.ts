import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import { logger } from './logger.js';

const execAsync = promisify(exec);

export async function playAudio(filePath: string): Promise<void> {
  const os = platform();
  let command: string;

  switch (os) {
    case 'darwin': // macOS
      command = `afplay "${filePath}"`;
      break;
    case 'win32': // Windows
      command = `powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
      break;
    case 'linux':
      // Try multiple players in order of preference
      command = `which aplay >/dev/null 2>&1 && aplay "${filePath}" || which mpg123 >/dev/null 2>&1 && mpg123 "${filePath}" || which ffplay >/dev/null 2>&1 && ffplay -nodisp -autoexit "${filePath}" || echo "No audio player found"`;
      break;
    default:
      throw new Error(`Unsupported platform: ${os}`);
  }

  try {
    await execAsync(command);
  } catch (error) {
    logger.error('Failed to play audio:', error);
    throw new Error(`Audio playback failed: ${error}`);
  }
}

export function isAudioPlaybackSupported(): boolean {
  const os = platform();
  return ['darwin', 'win32', 'linux'].includes(os);
}