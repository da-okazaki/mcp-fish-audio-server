# WebSocket Streaming Examples

## Overview

Fish Audio MCP Server now supports WebSocket streaming for real-time text-to-speech generation. This enables low-latency audio streaming with the ability to play audio as it's being generated.

## WebSocket vs HTTP Streaming

- **HTTP Streaming**: Downloads the entire audio file in chunks
- **WebSocket Streaming**: Bidirectional real-time communication, audio plays as it's generated

## Usage Examples

### Basic WebSocket Streaming
```
User: "Generate speech with WebSocket: 'Hello from the future'"

Claude: I'll use WebSocket streaming for low-latency speech generation.

[Uses fish_audio_tts tool with websocket_streaming: true]

Result: Audio generated via WebSocket and saved to file
```

### Real-time Playback
```
User: "Stream and play in real-time: 'This is being spoken as it's generated'"

Claude: I'll stream and play the audio in real-time using WebSocket.

[Uses fish_audio_tts tool with websocket_streaming: true, realtime_play: true]

Result: Audio streams and plays immediately as chunks arrive
```

### WebSocket with Custom Voice
```
User: "Use WebSocket streaming with voice xyz123: 'Custom voice in real-time'"

Claude: I'll use WebSocket streaming with your specified voice model.

[Uses fish_audio_tts tool with websocket_streaming: true, reference_id: "xyz123"]

Result: Real-time speech with custom voice via WebSocket
```

## Configuration

### Enable WebSocket Streaming by Default
```json
{
  "mcpServers": {
    "fish-audio": {
      "command": "npx",
      "args": ["@alanse/fish-audio-mcp-server"],
      "env": {
        "FISH_API_KEY": "your_api_key",
        "FISH_WEBSOCKET_STREAMING": "true",
        "FISH_REALTIME_PLAY": "true"
      }
    }
  }
}
```

## Technical Details

### WebSocket Endpoint
- URL: `wss://api.fish.audio/v1/tts/live`
- Protocol: WebSocket with MessagePack encoding

### Message Flow
1. Connect to WebSocket with Bearer token
2. Send `start` event with TTS parameters
3. Send `text` events with text chunks
4. Receive audio data in real-time
5. Send `stop` event to end session

### Supported Formats
- `opus` (recommended for streaming)
- `mp3`
- `wav`
- `pcm`

### Real-time Players
- **macOS**: `ffplay` (opus/mp3) or `afplay`
- **Windows**: `ffplay`
- **Linux**: `mpv` or `ffplay`

## Benefits

1. **Low Latency**: Audio starts playing before full generation completes
2. **Memory Efficient**: No need to buffer entire audio file
3. **Interactive**: Can be used for real-time conversational AI
4. **Smooth Playback**: Continuous audio stream without gaps