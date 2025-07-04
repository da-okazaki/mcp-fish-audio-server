#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { TTSTool } from './tools/tts.js';
import { ListReferencesTool } from './tools/listReferences.js';
import { loadConfig } from './utils/config.js';
import { logger } from './utils/logger.js';

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

    // Create and register tools
    const ttsTool = new TTSTool();
    const listRefTool = new ListReferencesTool();
    
    const tools = [ttsTool, listRefTool];
    
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const tool = tools.find(t => t.name === request.params.name);
      
      if (tool) {
        const result = await tool.run(request.params.arguments as any);
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
    
    logger.info('Fish Audio MCP Server started successfully');
  } catch (error) {
    logger.error('Failed to start Fish Audio MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down Fish Audio MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down Fish Audio MCP Server...');
  process.exit(0);
});

// Run the server
main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});