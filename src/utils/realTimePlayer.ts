import { spawn, ChildProcess } from 'child_process';
import { platform } from 'os';
import { Readable, PassThrough } from 'stream';
import { logger } from './logger.js';

export class RealTimeAudioPlayer {
  private process: ChildProcess | null = null;
  private stream: PassThrough | null = null;
  private isPlaying: boolean = false;
  private os: string;

  constructor() {
    this.os = platform();
  }

  start(format: string = 'opus'): PassThrough {
    if (this.isPlaying) {
      throw new Error('Audio player is already running');
    }

    this.stream = new PassThrough();
    let command: string;
    let args: string[];

    switch (this.os) {
      case 'darwin': // macOS
        if (format === 'opus' || format === 'mp3') {
          // Use ffplay for opus/mp3 streaming
          command = 'ffplay';
          args = ['-f', format, '-nodisp', '-autoexit', '-i', 'pipe:0'];
        } else {
          // Use afplay for other formats
          command = 'afplay';
          args = ['-'];
        }
        break;
      
      case 'win32': // Windows
        // Use ffplay on Windows
        command = 'ffplay';
        args = ['-f', format, '-nodisp', '-autoexit', '-i', 'pipe:0'];
        break;
      
      case 'linux':
        // Try mpv first, then ffplay
        command = 'mpv';
        args = ['--no-cache', '--no-terminal', '--', 'fd://0'];
        break;
      
      default:
        throw new Error(`Unsupported platform: ${this.os}`);
    }

    try {
      this.process = spawn(command, args, {
        stdio: ['pipe', 'ignore', 'ignore']
      });

      this.process.on('error', (error) => {
        logger.error(`Audio player error:`, error);
        // Try alternative player on Linux
        if (this.os === 'linux' && command === 'mpv') {
          this.process = spawn('ffplay', ['-f', format, '-nodisp', '-autoexit', '-i', 'pipe:0'], {
            stdio: ['pipe', 'ignore', 'ignore']
          });
        }
      });

      this.process.on('exit', (code) => {
        this.isPlaying = false;
        this.process = null;
      });

      // Pipe stream to player
      this.stream.pipe(this.process.stdin!);
      this.isPlaying = true;

      return this.stream;
    } catch (error) {
      throw new Error(`Failed to start audio player: ${error}`);
    }
  }

  write(chunk: Buffer): void {
    if (this.stream && this.isPlaying) {
      this.stream.write(chunk);
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }

    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    this.isPlaying = false;
  }

  isSupported(): boolean {
    return ['darwin', 'win32', 'linux'].includes(this.os);
  }
}