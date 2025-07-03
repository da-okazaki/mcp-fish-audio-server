#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { TTSTool } from './tools/tts.js';
import { loadConfig } from './utils/config.js';

async function main() {
  try {
    // Validate configuration on startup
    loadConfig();
    
    // Create MCP server
    const server = new Server(
      {
        name: 'fish-audio-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Create and register TTS tool
    const ttsTool = new TTSTool();
    
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: ttsTool.name,
          description: ttsTool.description,
          inputSchema: ttsTool.inputSchema,
        },
      ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === ttsTool.name) {
        const result = await ttsTool.run(request.params.arguments as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('Fish Audio MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start Fish Audio MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down Fish Audio MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down Fish Audio MCP Server...');
  process.exit(0);
});

// Run the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});