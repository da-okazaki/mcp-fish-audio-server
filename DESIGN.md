# Fish Audio MCP Server Design

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Claude Desktop │────▶│  MCP Server      │────▶│ Fish Audio API  │
│  (MCP Client)   │◀────│  (TypeScript)    │◀────│ (TTS Service)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │ Audio Files │
                        │ (Optional)  │
                        └─────────────┘
```

## Component Design

### 1. MCP Server Core (`src/index.ts`)
- Initialize MCP server with stdio transport
- Register TTS tool with the server
- Handle lifecycle events (initialization, shutdown)
- Configure logging and error handling

### 2. TTS Tool (`src/tools/tts.ts`)
- Implement the `fish_audio_tts` tool
- Validate input parameters
- Call Fish Audio service
- Handle response formatting (base64 or file path)
- Manage streaming vs non-streaming modes

### 3. Fish Audio Service (`src/services/fishAudio.ts`)
- HTTP client for Fish Audio API
- Authentication handling
- Request/response formatting
- Streaming implementation
- Error handling and retries

### 4. Configuration (`src/utils/config.ts`)
- Environment variable parsing
- Default value management
- Configuration validation
- Type-safe config object

### 5. Type Definitions (`src/types/index.ts`)
- Fish Audio API types
- MCP tool parameter types
- Response types
- Configuration types

## API Design

### Fish Audio Service Interface

```typescript
interface FishAudioService {
  generateSpeech(params: TTSParams): Promise<TTSResponse>;
  generateSpeechStream(params: TTSParams): AsyncGenerator<Uint8Array>;
}

interface TTSParams {
  text: string;
  referenceId?: string;
  format?: 'mp3' | 'wav' | 'pcm';
  mp3Bitrate?: 64 | 128 | 192;
  normalize?: boolean;
  latency?: 'normal' | 'balanced';
  chunkLength?: number;
}

interface TTSResponse {
  audio: Buffer;
  format: string;
  duration?: number;
}
```

### MCP Tool Interface

```typescript
interface TTSToolParams {
  text: string;
  reference_id?: string;
  streaming?: boolean;
  format?: 'mp3' | 'wav' | 'pcm';
  mp3_bitrate?: 64 | 128 | 192;
  normalize?: boolean;
  latency?: 'normal' | 'balanced';
  output_path?: string;
}

interface TTSToolResponse {
  success: boolean;
  audio_data?: string; // Base64 encoded
  file_path?: string;
  format?: string;
  error?: string;
}
```

## Implementation Details

### 1. Streaming Implementation
- Use async generators for streaming responses
- Write chunks to file progressively
- Provide progress updates to MCP client
- Handle interruptions gracefully

### 2. Error Handling Strategy
```typescript
enum ErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR'
}

class FishAudioError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any
  ) {
    super(message);
  }
}
```

### 3. Retry Logic
- Exponential backoff for transient failures
- Maximum 3 retry attempts
- Configurable retry delays
- Skip retry for non-retryable errors

### 4. File Management
- Default output directory: `./audio_output/`
- Filename pattern: `tts_${timestamp}_${format}`
- Automatic cleanup of old files (optional)
- Support for custom output paths

## Security Considerations

1. **API Key Protection**
   - Never log API keys
   - Validate API key format
   - Use environment variables only

2. **Input Validation**
   - Sanitize text input
   - Validate file paths
   - Check parameter ranges

3. **Resource Limits**
   - Maximum text length: 10,000 characters
   - File size limits for audio output
   - Rate limiting awareness

## Performance Optimizations

1. **Connection Pooling**
   - Reuse HTTP connections
   - Keep-alive headers
   - Connection timeout management

2. **Caching** (Optional)
   - Cache generated audio by text hash
   - Configurable cache TTL
   - Memory-efficient cache management

3. **Streaming Efficiency**
   - Optimal chunk size (8KB)
   - Backpressure handling
   - Memory-efficient buffering

## Testing Strategy

1. **Unit Tests**
   - Tool parameter validation
   - Service method testing
   - Configuration parsing

2. **Integration Tests**
   - Mock Fish Audio API responses
   - End-to-end tool execution
   - Error scenario testing

3. **Manual Testing**
   - Claude Desktop integration
   - Various voice models
   - Different audio formats
   - Streaming vs non-streaming

## Deployment Considerations

1. **Package Structure**
   - Compiled JavaScript in `dist/`
   - Source maps for debugging
   - Minimal dependencies

2. **Version Management**
   - Semantic versioning
   - Changelog maintenance
   - Git tags for releases

3. **Documentation**
   - API documentation
   - Usage examples
   - Troubleshooting guide
   - Migration guides for updates