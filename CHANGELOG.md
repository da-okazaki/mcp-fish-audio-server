# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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