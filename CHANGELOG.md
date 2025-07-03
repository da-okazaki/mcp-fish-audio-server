# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.4] - 2025-01-03

### Fixed
- Fixed zod version compatibility by pinning to exact version 3.23.8
- Resolved version conflict between MCP SDK and Fish Audio SDK dependencies
- Verified dev and build modes work correctly locally

## [0.5.3] - 2025-01-03

### Fixed
- Added missing `zod` dependency to fix "Cannot find module" error
- Fixed module resolution issues when running via npx

## [0.5.2] - 2025-01-03

### Fixed
- Fixed audio playback not working when FISH_STREAMING=true and FISH_AUTO_PLAY=true
- Fixed tilde (~) expansion in AUDIO_OUTPUT_DIR environment variable
- Separated HTTP streaming from WebSocket streaming to prevent connection issues
- WebSocket streaming now requires explicit enabling via tool parameters

### Changed
- FISH_STREAMING now only controls HTTP streaming (not WebSocket)
- WebSocket streaming defaults to false to improve stability

## [0.5.1] - 2025-01-03

### Changed
- Improved README documentation formatting
- Changed "Required" column in environment variables table to use text instead of emojis
- Updated references from "Claude Desktop" to "MCP Settings" for broader compatibility
- Added AUDIO_OUTPUT_DIR to the configuration example
- Updated FISH_STREAMING description to clarify it controls both HTTP and WebSocket streaming
- Updated FISH_AUTO_PLAY description to clarify it controls both auto-play and real-time playback

## [0.5.0] - 2025-01-03

### Breaking Changes
- Removed `FISH_WEBSOCKET_STREAMING` environment variable
- Removed `FISH_REALTIME_PLAY` environment variable
- WebSocket streaming is now controlled by `FISH_STREAMING`
- Real-time playback is now controlled by `FISH_AUTO_PLAY`

### Changed
- Simplified environment variable configuration
- `websocket_streaming` parameter now defaults to `FISH_STREAMING` value
- `realtime_play` parameter now defaults to `FISH_AUTO_PLAY` value
- Cleaner configuration with unified controls

### Migration Guide
- Remove `FISH_WEBSOCKET_STREAMING` from your config (use `FISH_STREAMING` instead)
- Remove `FISH_REALTIME_PLAY` from your config (use `FISH_AUTO_PLAY` instead)

## [0.4.1] - 2025-01-03

### Added
- Environment variable mapping for WebSocket streaming
- `FISH_WEBSOCKET_STREAMING` defaults to `FISH_STREAMING` value
- `FISH_REALTIME_PLAY` defaults to `FISH_AUTO_PLAY` value
- Simplified configuration with intelligent defaults

### Changed
- WebSocket streaming can now be enabled via environment variables
- Real-time playback can now be enabled via environment variables
- Improved configuration documentation

## [0.4.0] - 2025-01-03

### Added
- Integration with official Fish Audio SDK
- Proper latency parameter support (normal/balanced)
- Config caching for better performance

### Changed
- Refactored entire codebase to use Fish Audio SDK
- Improved WebSocket streaming stability
- Better error handling with SDK error types
- Simplified API calls using SDK methods

### Fixed
- Auto-play functionality now works correctly
- Connection stability issues resolved
- Memory efficiency improvements

### Removed
- Custom API implementation (replaced by SDK)
- Direct axios calls (handled by SDK)

## [0.3.0] - 2025-01-03

### Added
- WebSocket streaming support for real-time TTS via `wss://api.fish.audio/v1/tts/live`
- Real-time audio playback during WebSocket streaming with `realtime_play` parameter
- `websocket_streaming` parameter to enable WebSocket mode
- `FishAudioWebSocketService` for handling WebSocket connections
- `RealTimeAudioPlayer` utility for immediate audio output
- Support for both HTTP and WebSocket streaming modes
- MessagePack encoding/decoding for WebSocket communication

### Changed
- TTS tool now supports three modes: standard, HTTP streaming, and WebSocket streaming
- Response includes `streaming_mode` and `total_bytes` information
- Updated documentation with WebSocket examples

### Technical Details
- WebSocket uses MessagePack for message encoding
- Real-time player supports multiple platforms (ffplay, mpv, afplay)
- Text is chunked for optimal WebSocket streaming performance

## [0.2.0] - 2025-01-03

### Added
- Automatic audio playback feature with `auto_play` parameter
- Cross-platform audio playback support (macOS, Windows, Linux)
- FISH_AUTO_PLAY environment variable for default playback behavior
- Audio player utility for handling platform-specific playback

### Changed
- TTS tool now returns `played` status in response
- Updated documentation with auto-play feature

### Technical Notes
- Streaming mode uses HTTP streaming API (not WebSocket)
- Audio playback is handled through native OS commands

## [0.1.2] - 2025-01-03

### Changed
- Changed npm package name to @alanse/fish-audio-mcp-server for scoped publishing
- Updated documentation to reflect new package name

## [0.1.1] - 2025-01-03

### Fixed
- Fixed directory creation error when running via npx
- Changed default audio output directory to `~/.fish-audio-mcp/audio_output` for better permissions
- Added error handling for directory creation failures

### Changed
- Audio output directory now defaults to user's home directory instead of relative path
- Improved error messages for directory creation issues

## [0.1.0] - 2025-01-03

### Added
- Initial release
- Basic TTS functionality with Fish Audio API integration
- Streaming support for real-time audio generation
- Environment variable based configuration
- Support for multiple audio formats (MP3, WAV, PCM, Opus)
- MCP tools for text-to-speech generation
- Custom voice support via reference IDs