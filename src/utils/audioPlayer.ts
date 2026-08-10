import { execFile } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);

/**
 * Play an audio file.
 *
 * SECURITY: this used `exec()` with the path interpolated into a shell string
 * (`afplay "${filePath}"`). `filePath` comes from the `output_path` TOOL
 * PARAMETER, i.e. a value supplied by the model — so a path containing a quote
 * and a `$(...)` escaped the quoting and ran arbitrary commands on the host.
 *
 * That is not just theoretical for an MCP server: an LLM's tool arguments can
 * be steered by whatever untrusted text is in its context (a web page, an
 * email, a call transcript), which turns prompt injection into shell execution
 * on the user's machine.
 *
 * Every path below now uses execFile with an ARGUMENT ARRAY and no shell, so
 * the filename is passed as a single argv entry and can never be parsed as
 * syntax. Windows goes one step further and hands the path over in the
 * environment, because the PowerShell one-liner would otherwise have its own
 * quoting problem inside the script string.
 */
export async function playAudio(filePath: string): Promise<void> {
  const os = platform();

  try {
    switch (os) {
      case 'darwin': // macOS
        await execFileAsync('afplay', [filePath]);
        return;

      case 'win32': {
        // The path travels in the environment rather than inside the script
        // text: no amount of quoting inside a -Command string is safe against
        // an arbitrary filename, and $env: lookup is not re-parsed.
        await execFileAsync(
          'powershell',
          ['-NoProfile', '-NonInteractive', '-Command',
            '(New-Object Media.SoundPlayer $env:MCP_FISH_AUDIO_PATH).PlaySync()'],
          { env: { ...process.env, MCP_FISH_AUDIO_PATH: filePath } }
        );
        return;
      }

      case 'linux': {
        // Was a `which X && X || which Y && Y` shell chain. Same preference
        // order, expressed as a loop, so no shell is involved at all.
        const players: [string, string[]][] = [
          ['aplay', [filePath]],
          ['mpg123', [filePath]],
          ['ffplay', ['-nodisp', '-autoexit', filePath]]
        ];
        for (const [cmd, args] of players) {
          try {
            await execFileAsync(cmd, args);
            return;
          } catch (err: any) {
            // ENOENT just means this player isn't installed — try the next.
            // Anything else is a real playback failure and should surface.
            if (err?.code !== 'ENOENT') throw err;
          }
        }
        throw new Error('No audio player found (tried aplay, mpg123, ffplay)');
      }

      default:
        throw new Error(`Unsupported platform: ${os}`);
    }
  } catch (error) {
    logger.error('Failed to play audio:', error);
    throw new Error(`Audio playback failed: ${error}`);
  }
}

export function isAudioPlaybackSupported(): boolean {
  const os = platform();
  return ['darwin', 'win32', 'linux'].includes(os);
}
