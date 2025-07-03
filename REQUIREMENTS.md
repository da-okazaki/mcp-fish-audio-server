# Fish Audio MCP Server Requirements

## Overview
Create an MCP (Model Context Protocol) server that integrates with Fish Audio's TTS (Text-to-Speech) API, allowing LLMs to generate speech output automatically through MCP tools.

## Functional Requirements

### 1. MCP Server Implementation
- Implement a TypeScript-based MCP server using the official MCP SDK
- Expose TTS functionality as MCP tools that can be invoked by LLMs
- Support standard MCP transports (stdio)
- Handle errors gracefully and provide meaningful error messages

### 2. Fish Audio TTS Integration
- Integrate with Fish Audio REST API (https://api.fish.audio/v1/tts)
- Support Bearer token authentication using API key
- Handle multiple TTS models (speech-1.5, speech-1.6, s1)
- Support both JSON and msgpack content types

### 3. TTS Tool Features
- **Text Input**: Accept text input for speech synthesis
- **Voice Selection**: Support reference_id for pre-uploaded voice models
- **Audio Formats**: Support multiple output formats (mp3, wav, pcm)
- **Streaming Mode**: Enable streaming for real-time audio generation
- **Audio Parameters**: Configure mp3_bitrate, chunk_length, normalize options
- **Latency Modes**: Support "normal" and "balanced" latency modes

### 4. Environment Variables
- `FISH_API_KEY`: Fish Audio API key (required)
- `FISH_MODEL_ID`: Default model ID (optional, defaults to "s1")
- `FISH_REFERENCE_ID`: Default voice reference ID (optional)
- `FISH_OUTPUT_FORMAT`: Default audio format (optional, defaults to "mp3")
- `FISH_STREAMING`: Enable streaming by default (optional, defaults to false)
- `FISH_MP3_BITRATE`: Default MP3 bitrate (optional, defaults to 128)

### 5. MCP Tools to Implement

#### Tool: `fish_audio_tts`
Generates speech from text using Fish Audio API.

Parameters:
- `text` (required): Text to convert to speech
- `reference_id` (optional): Voice model ID
- `streaming` (optional): Enable streaming mode
- `format` (optional): Output format (mp3, wav, pcm)
- `mp3_bitrate` (optional): Bitrate for MP3 (64, 128, 192)
- `normalize` (optional): Enable text normalization
- `latency` (optional): Latency mode (normal, balanced)
- `output_path` (optional): Path to save audio file

Returns:
- For non-streaming: Base64 encoded audio data or file path
- For streaming: Success status with file path

## Non-Functional Requirements

### 1. Performance
- Handle streaming responses efficiently
- Minimize latency in TTS generation
- Support concurrent TTS requests

### 2. Error Handling
- Validate API responses
- Handle network errors gracefully
- Provide clear error messages to LLM
- Implement retry logic for transient failures

### 3. Logging
- Log API requests and responses for debugging
- Track usage metrics (optional)
- Respect privacy (no logging of sensitive text content)

### 4. Security
- Secure storage of API keys via environment variables
- No hardcoded credentials
- Validate input parameters

### 5. Documentation
- Comprehensive README.md in English
- Example configurations for Claude Desktop
- Usage examples and best practices
- API reference for all tools

### 6. Testing
- Unit tests for core functionality
- Integration tests with Fish Audio API (mock)
- Test coverage for error scenarios

### 7. Distribution
- Publish as npm package (@username/fish-audio-mcp-server)
- Semantic versioning
- GitHub releases with tags
- Clear installation instructions

## Technical Stack
- Language: TypeScript
- Runtime: Node.js
- MCP SDK: @modelcontextprotocol/sdk
- HTTP Client: node-fetch or axios
- Build Tool: TypeScript compiler
- Test Framework: Jest or Vitest
- Package Manager: npm

## Project Structure
```
fish-audio-mcp-server/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── tools/
│   │   └── tts.ts        # TTS tool implementation
│   ├── services/
│   │   └── fishAudio.ts  # Fish Audio API client
│   ├── types/
│   │   └── index.ts      # TypeScript type definitions
│   └── utils/
│       └── config.ts     # Configuration management
├── tests/
│   ├── tools/
│   └── services/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Success Criteria
1. MCP server successfully connects to Claude Desktop
2. TTS tool generates audio from text input
3. Streaming mode works without interruption
4. All environment variables are properly handled
5. Error cases are handled gracefully
6. Documentation is clear and comprehensive
7. Package is published to npm and installable
8. GitHub repository has proper tags and releases