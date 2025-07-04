#!/usr/bin/env node

import { spawn } from 'child_process';

// Test MCP server functionality
async function testMCPServer() {
  console.log('Starting MCP server test...');
  
  // Spawn the MCP server
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      FISH_API_KEY: 'f0df8c5b273e488ca09035cbb9359bfc',
      FISH_MODEL_ID: 's1',
      FISH_REFERENCE_ID: '1cd9cb46c5c94f3081b2ba3e705bf936',
      FISH_OUTPUT_FORMAT: 'mp3',
      FISH_STREAMING: 'false',
      FISH_AUTO_PLAY: 'false'
    }
  });

  let serverReady = false;
  
  // Wait for server to be ready
  server.stderr.on('data', (data) => {
    const message = data.toString();
    console.log('Server:', message.trim());
    if (message.includes('Fish Audio MCP Server started successfully')) {
      serverReady = true;
      runTests();
    }
  });

  server.stdout.on('data', (data) => {
    console.log('Server response:', data.toString());
  });

  async function runTests() {
    console.log('\n🧪 Testing MCP server functionality...\n');
    
    // Test 1: Initialize
    console.log('1. Testing initialize...');
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };
    
    server.stdin.write(JSON.stringify(initRequest) + '\n');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: List tools
    console.log('2. Testing tools/list...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };
    
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Call TTS tool
    console.log('3. Testing fish_audio_tts tool...');
    const ttsRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'fish_audio_tts',
        arguments: {
          text: 'Hello, this is a test of the Fish Audio TTS MCP server!',
          format: 'mp3',
          auto_play: false
        }
      }
    };
    
    server.stdin.write(JSON.stringify(ttsRequest) + '\n');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n✅ Test completed. Check output above for results.');
    
    // Clean up
    server.kill('SIGTERM');
    process.exit(0);
  }

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    if (!serverReady) {
      console.error('Server failed to start');
      process.exit(1);
    }
  });

  // Timeout after 30 seconds
  setTimeout(() => {
    console.error('Test timeout');
    server.kill('SIGTERM');
    process.exit(1);
  }, 30000);
}

testMCPServer().catch(console.error);