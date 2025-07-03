# Auto-Play Feature Examples

## Environment Variable Configuration

### Enable auto-play by default
```json
{
  "mcpServers": {
    "fish-audio": {
      "command": "npx",
      "args": ["@alanse/fish-audio-mcp-server"],
      "env": {
        "FISH_API_KEY": "your_api_key",
        "FISH_AUTO_PLAY": "true"
      }
    }
  }
}
```

## Usage Examples

### Basic auto-play
```
User: "Generate and play speech saying 'Hello, world!'"

Claude: I'll generate and automatically play the speech for you.

[Uses fish_audio_tts tool with auto_play: true]

Result: Audio file generated and played automatically
```

### Override default behavior
```
User: "Generate speech without playing: 'This is a test'"

Claude: I'll generate the speech without automatic playback.

[Uses fish_audio_tts tool with auto_play: false]

Result: Audio file saved without playback
```

### Streaming with auto-play
```
User: "Stream and play a long speech about AI"

Claude: I'll stream the speech and play it once generation is complete.

[Uses fish_audio_tts tool with streaming: true, auto_play: true]

Result: Audio streamed to file and played upon completion
```

## Platform Support

- **macOS**: Uses `afplay` command
- **Windows**: Uses PowerShell Media.SoundPlayer
- **Linux**: Tries `aplay`, `mpg123`, or `ffplay` in order

## Notes

- Audio playback happens after the file is fully generated
- For streaming mode, playback occurs after the stream completes
- Playback errors are logged but don't fail the TTS operation
- The response includes `played: true/false` to indicate if playback occurred