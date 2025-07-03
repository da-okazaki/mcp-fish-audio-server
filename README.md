# Fish Audio MCP Server

[![npm version](https://badge.fury.io/js/@alanse%2Ffish-audio-mcp-server.svg)](https://badge.fury.io/js/@alanse%2Ffish-audio-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://glama.ai/mcp/servers/fish-audio-mcp-server"><img width="380" height="200" src="https://glama.ai/mcp/servers/fish-audio-mcp-server/badge" alt="Fish Audio MCP Server" /></a>

An MCP (Model Context Protocol) server that provides seamless integration between Fish Audio's Text-to-Speech API and LLMs like Claude, enabling natural language-driven speech synthesis.

## Features

- 🎙️ **High-Quality TTS**: Leverage Fish Audio's state-of-the-art TTS models
- 🌊 **Streaming Support**: Real-time audio streaming for low-latency applications
- 🎨 **Multiple Voices**: Support for custom voice models via reference IDs
- 🔧 **Flexible Configuration**: Environment variable-based configuration
- 📦 **Multiple Audio Formats**: Support for MP3, WAV, PCM, and Opus
- 🚀 **Easy Integration**: Simple setup with Claude Desktop or any MCP client

## Quick Start

### Installation

You can run this MCP server directly using npx:

```bash
npx @alanse/fish-audio-mcp-server
```

Or install it globally:

```bash
npm install -g @alanse/fish-audio-mcp-server
```

### Configuration

1. Get your Fish Audio API key from [Fish Audio](https://fish.audio/)

2. Set up environment variables:

```bash
export FISH_API_KEY=your_fish_audio_api_key_here
```

3. Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "fish-audio": {
      "command": "npx",
      "args": ["-y", "@alanse/fish-audio-mcp-server"],
      "env": {
        "FISH_API_KEY": "your_fish_audio_api_key_here",
        "FISH_MODEL_ID": "s1",
        "FISH_REFERENCE_ID": "your_voice_reference_id_here",
        "FISH_OUTPUT_FORMAT": "mp3",
        "FISH_STREAMING": "false",
        "FISH_LATENCY": "balanced",
        "FISH_MP3_BITRATE": "128",
        "FISH_AUTO_PLAY": "false"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `FISH_API_KEY` | Your Fish Audio API key | - | ✅ |
| `FISH_MODEL_ID` | TTS model to use (s1, speech-1.5, speech-1.6) | `s1` | ❌ |
| `FISH_REFERENCE_ID` | Default voice reference ID | - | ❌ |
| `FISH_OUTPUT_FORMAT` | Default audio format (mp3, wav, pcm, opus) | `mp3` | ❌ |
| `FISH_STREAMING` | Enable HTTP streaming by default | `false` | ❌ |
| `FISH_LATENCY` | Latency mode (normal, balanced) | `balanced` | ❌ |
| `FISH_MP3_BITRATE` | MP3 bitrate (64, 128, 192) | `128` | ❌ |
| `FISH_AUTO_PLAY` | Automatically play generated audio | `false` | ❌ |
| `AUDIO_OUTPUT_DIR` | Directory for audio file output | `~/.fish-audio-mcp/audio_output` | ❌ |

## Usage

Once configured, the Fish Audio MCP server provides the `fish_audio_tts` tool to LLMs.

### Tool: `fish_audio_tts`

Generates speech from text using Fish Audio's TTS API.

#### Parameters

- `text` (required): Text to convert to speech (max 10,000 characters)
- `reference_id` (optional): Voice model reference ID
- `streaming` (optional): Enable streaming mode
- `format` (optional): Output format (mp3, wav, pcm, opus)
- `mp3_bitrate` (optional): MP3 bitrate (64, 128, 192)
- `normalize` (optional): Enable text normalization (default: true)
- `latency` (optional): Latency mode (normal, balanced)
- `output_path` (optional): Custom output file path
- `auto_play` (optional): Automatically play the generated audio
- `websocket_streaming` (optional): Use WebSocket streaming instead of HTTP
- `realtime_play` (optional): Play audio in real-time during WebSocket streaming

### Examples

#### Basic Text-to-Speech

```
User: "Generate speech saying 'Hello, world! Welcome to Fish Audio TTS.'"

Claude: I'll generate speech for that text using Fish Audio TTS.

[Uses fish_audio_tts tool with text parameter]

Result: Audio file saved to ./audio_output/tts_2025-01-03T10-30-00.mp3
```

#### Using Custom Voice

```
User: "Generate speech with voice model xyz123 saying 'This is a custom voice test'"

Claude: I'll generate speech using the specified voice model.

[Uses fish_audio_tts tool with text and reference_id parameters]

Result: Audio generated with custom voice model xyz123
```

#### HTTP Streaming Mode

```
User: "Generate a long speech in streaming mode about the benefits of AI"

Claude: I'll generate the speech in streaming mode for faster response.

[Uses fish_audio_tts tool with streaming: true]

Result: Streaming audio saved to ./audio_output/tts_2025-01-03T10-35-00.mp3
```

#### WebSocket Real-time Streaming

```
User: "Stream and play in real-time: 'Welcome to the future of AI'"

Claude: I'll stream the speech via WebSocket and play it in real-time.

[Uses fish_audio_tts tool with websocket_streaming: true, realtime_play: true]

Result: Audio streamed and played in real-time via WebSocket
```

## Development

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/da-okazaki/mcp-fish-audio-server.git
cd mcp-fish-audio-server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your API key
```

4. Build the project:
```bash
npm run build
```

5. Run in development mode:
```bash
npm run dev
```

### Testing

Run the test suite:
```bash
npm test
```

### Project Structure

```
mcp-fish-audio-server/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── tools/
│   │   └── tts.ts        # TTS tool implementation
│   ├── services/
│   │   └── fishAudio.ts  # Fish Audio API client
│   ├── types/
│   │   └── index.ts      # TypeScript definitions
│   └── utils/
│       └── config.ts     # Configuration management
├── tests/                # Test files
├── audio_output/         # Default audio output directory
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

### Fish Audio Service

The service provides two main methods:

1. **generateSpeech**: Standard TTS generation
   - Returns audio buffer
   - Suitable for short texts
   - Lower memory usage

2. **generateSpeechStream**: Streaming TTS generation
   - Returns audio stream
   - Suitable for long texts
   - Real-time processing

### Error Handling

The server handles various error scenarios:

- **INVALID_API_KEY**: Invalid or missing API key
- **NETWORK_ERROR**: Connection issues with Fish Audio API
- **INVALID_PARAMS**: Invalid request parameters
- **QUOTA_EXCEEDED**: API rate limit exceeded
- **SERVER_ERROR**: Fish Audio server errors

## Troubleshooting

### Common Issues

1. **"FISH_API_KEY environment variable is required"**
   - Ensure you've set the `FISH_API_KEY` environment variable
   - Check that the API key is valid

2. **"Network error: Unable to reach Fish Audio API"**
   - Check your internet connection
   - Verify Fish Audio API is accessible
   - Check for proxy/firewall issues

3. **"Text length exceeds maximum limit"**
   - Split long texts into smaller chunks
   - Maximum supported length is 10,000 characters

4. **Audio files not appearing**
   - Check the `AUDIO_OUTPUT_DIR` path exists
   - Ensure write permissions for the directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Fish Audio](https://fish.audio/) for providing the excellent TTS API
- [Anthropic](https://anthropic.com/) for creating the Model Context Protocol
- The MCP community for inspiration and examples

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/da-okazaki/mcp-fish-audio-server).

## Changelog

### v0.5.0 (2025-01-03)
- Simplified environment variables: removed FISH_WEBSOCKET_STREAMING and FISH_REALTIME_PLAY
- WebSocket streaming now controlled by FISH_STREAMING
- Real-time playback now controlled by FISH_AUTO_PLAY
- Cleaner configuration with unified controls

### v0.4.1 (2025-01-03)
- Added intelligent environment variable mapping
- FISH_WEBSOCKET_STREAMING defaults to FISH_STREAMING
- FISH_REALTIME_PLAY defaults to FISH_AUTO_PLAY
- Simplified configuration with smart defaults

### v0.4.0 (2025-01-03)
- Refactored to use official Fish Audio SDK
- Improved WebSocket streaming implementation
- Fixed auto-play functionality
- Better error handling and connection stability
- Latency parameter now properly supported (normal/balanced)
- Cleaner codebase with SDK integration

### v0.3.0 (2025-01-03)
- Added WebSocket streaming support for real-time TTS
- Added real-time audio playback during WebSocket streaming
- New parameters: `websocket_streaming` and `realtime_play`
- Support for both HTTP and WebSocket streaming modes
- Real-time player for immediate audio output

### v0.2.0 (2025-01-03)
- Added automatic audio playback feature with `auto_play` parameter
- Added FISH_AUTO_PLAY environment variable for default behavior
- Support for cross-platform audio playback (macOS, Windows, Linux)
- HTTP streaming mode implementation

### v0.1.2 (2025-01-03)
- Changed npm package name to @alanse/fish-audio-mcp-server

### v0.1.1 (2025-01-03)
- Fixed directory creation error when running via npx
- Changed default audio output to user's home directory

### v0.1.0 (2025-01-03)
- Initial release
- Basic TTS functionality
- Streaming support
- Environment variable configuration
- Multiple audio format support