import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { TimerConfig } from '../types';
// biome-ignore lint/style/useImportType: TimerService is used at runtime
import { TimerService } from './timer-service';

export type MCPTransportType = 'stdio' | 'http';

export interface MCPServerConfig {
  name: string;
  version: string;
  port?: number; // For HTTP transport
  allowedHosts?: string[];
  allowedOrigins?: string[];
}

export class TempusMCPServer {
  private mcpServer: McpServer;
  private timerService: TimerService;
  private transports: Map<string, StdioServerTransport | StreamableHTTPServerTransport> = new Map();
  private config: MCPServerConfig;

  constructor(timerService: TimerService, config: MCPServerConfig) {
    this.timerService = timerService;
    this.config = config;

    this.mcpServer = new McpServer({
      name: config.name,
      version: config.version,
    });

    this.setupResources();
    this.setupTools();
    this.setupNotifications();
  }

  private setupResources(): void {
    // Timer state resource
    this.mcpServer.registerResource(
      'timer-state',
      'timer://state',
      {
        title: 'Timer State',
        description: 'Current timer state including progress and session info',
        mimeType: 'application/json',
      },
      async () => ({
        contents: [
          {
            uri: 'timer://state',
            text: JSON.stringify(this.timerService.getState(), null, 2),
          },
        ],
      })
    );

    // Timer configuration resource
    this.mcpServer.registerResource(
      'timer-config',
      'timer://config',
      {
        title: 'Timer Configuration',
        description: 'Current timer configuration settings',
        mimeType: 'application/json',
      },
      async () => ({
        contents: [
          {
            uri: 'timer://config',
            text: JSON.stringify(this.timerService.getConfig(), null, 2),
          },
        ],
      })
    );
  }

  private setupTools(): void {
    // Start timer tool
    this.mcpServer.registerTool(
      'start-timer',
      {
        title: 'Start Timer',
        description: 'Start the Pomodoro timer',
        inputSchema: {},
      },
      async () => {
        try {
          this.timerService.start();
          const state = this.timerService.getState();
          return {
            content: [
              {
                type: 'text',
                text: `Timer started successfully. Current state: ${state.state}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error starting timer: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Pause timer tool
    this.mcpServer.registerTool(
      'pause-timer',
      {
        title: 'Pause Timer',
        description: 'Pause the currently running timer',
        inputSchema: {},
      },
      async () => {
        try {
          this.timerService.pause();
          const state = this.timerService.getState();
          return {
            content: [
              {
                type: 'text',
                text: `Timer paused successfully. Current state: ${state.state}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error pausing timer: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Resume timer tool
    this.mcpServer.registerTool(
      'resume-timer',
      {
        title: 'Resume Timer',
        description: 'Resume a paused timer',
        inputSchema: {},
      },
      async () => {
        try {
          this.timerService.resume();
          const state = this.timerService.getState();
          return {
            content: [
              {
                type: 'text',
                text: `Timer resumed successfully. Current state: ${state.state}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error resuming timer: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Reset timer tool
    this.mcpServer.registerTool(
      'reset-timer',
      {
        title: 'Reset Timer',
        description: 'Reset the timer to idle state',
        inputSchema: {},
      },
      async () => {
        try {
          this.timerService.reset();
          const state = this.timerService.getState();
          return {
            content: [
              {
                type: 'text',
                text: `Timer reset successfully. Current state: ${state.state}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error resetting timer: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Get timer status tool
    this.mcpServer.registerTool(
      'get-timer-status',
      {
        title: 'Get Timer Status',
        description: 'Get the current timer state and progress',
        inputSchema: {},
      },
      async () => {
        try {
          const state = this.timerService.getState();
          const remainingMinutes = Math.ceil(state.remainingTime / 60);
          const progressPercent = Math.round(state.progress * 100);

          return {
            content: [
              {
                type: 'text',
                text: `Timer Status:
- State: ${state.state}
- Remaining Time: ${remainingMinutes} minutes
- Progress: ${progressPercent}%
- Completed Sessions: ${state.completedSessions}
- Sessions Until Long Break: ${state.sessionsUntilLongBreak}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error getting timer status: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Update timer configuration tool
    this.mcpServer.registerTool(
      'update-timer-config',
      {
        title: 'Update Timer Configuration',
        description: 'Update timer configuration settings',
      },
      async (config: Record<string, unknown>) => {
        try {
          const updates = this.validateTimerConfigUpdate(config);
          this.timerService.updateConfig(updates);
          const newConfig = this.timerService.getConfig();

          return {
            content: [
              {
                type: 'text',
                text: `Timer configuration updated successfully:\n${JSON.stringify(
                  newConfig,
                  null,
                  2
                )}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error updating timer configuration: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private validateTimerConfigUpdate(config: Record<string, unknown>): Partial<TimerConfig> {
    const updates: Partial<TimerConfig> = {};

    if (typeof config.workDuration === 'number') {
      updates.workDuration = config.workDuration;
    }
    if (typeof config.shortBreakDuration === 'number') {
      updates.shortBreakDuration = config.shortBreakDuration;
    }
    if (typeof config.longBreakDuration === 'number') {
      updates.longBreakDuration = config.longBreakDuration;
    }
    if (typeof config.sessionsUntilLongBreak === 'number') {
      updates.sessionsUntilLongBreak = config.sessionsUntilLongBreak;
    }
    if (typeof config.autoStartBreaks === 'boolean') {
      updates.autoStartBreaks = config.autoStartBreaks;
    }
    if (typeof config.autoStartPomodoros === 'boolean') {
      updates.autoStartPomodoros = config.autoStartPomodoros;
    }

    return updates;
  }

  private setupNotifications(): void {
    // MCP notifications are handled through the transport layer
    // For now, we'll store timer events that could be exposed as resources or tools
    // In a full implementation, notifications would be sent via transport.sendNotification()
    // if the transport supports it, but the current SDK doesn't expose this directly.

    // Store last state change for potential resource queries
    this.timerService.on('timer:stateChange', (data) => {
      console.log(`Timer state changed from ${data.from} to ${data.to}`);
    });

    this.timerService.on('timer:sessionComplete', (session) => {
      console.log(`Timer session completed: ${session.id} (${session.type})`);
    });

    this.timerService.on('timer:sessionStart', (session) => {
      console.log(`Timer session started: ${session.id} (${session.type})`);
    });

    this.timerService.on('timer:tick', (timerData) => {
      // Only log every minute to reduce noise
      if (timerData.remainingTime % 60 === 0) {
        console.log(`Timer tick: ${Math.ceil(timerData.remainingTime / 60)} minutes remaining`);
      }
    });
  }

  async connectStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    const transportId = 'stdio-transport';
    this.transports.set(transportId, transport);

    transport.onclose = () => {
      this.transports.delete(transportId);
    };

    await this.mcpServer.connect(transport);
  }

  createHTTPTransport(): StreamableHTTPServerTransport {
    return new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableDnsRebindingProtection: true,
      allowedHosts: this.config.allowedHosts || ['127.0.0.1', 'localhost'],
      allowedOrigins: this.config.allowedOrigins || [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      onsessioninitialized: (sessionId) => {
        console.log(`MCP HTTP session initialized: ${sessionId}`);
      },
    });
  }

  async connectHTTP(transport: StreamableHTTPServerTransport): Promise<void> {
    const transportId = transport.sessionId || randomUUID();
    this.transports.set(transportId, transport);

    transport.onclose = () => {
      if (transport.sessionId) {
        this.transports.delete(transport.sessionId);
      }
    };

    await this.mcpServer.connect(transport);
  }

  getActiveSessions(): string[] {
    return Array.from(this.transports.keys());
  }

  close(): void {
    for (const transport of this.transports.values()) {
      try {
        transport.close();
      } catch (error) {
        console.error('Error closing transport:', error);
      }
    }
    this.transports.clear();
  }

  getServerInfo(): { name: string; version: string; activeSessions: number } {
    return {
      name: this.config.name,
      version: this.config.version,
      activeSessions: this.transports.size,
    };
  }
}

// Export factory function for creating MCP server instances
export function createTempusMCPServer(
  timerService: TimerService,
  config: MCPServerConfig
): TempusMCPServer {
  return new TempusMCPServer(timerService, config);
}

// Export default configuration
export const DEFAULT_MCP_CONFIG: MCPServerConfig = {
  name: 'tempus-ring',
  version: '1.0.0',
  port: 3000,
  allowedHosts: ['127.0.0.1', 'localhost'],
  allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
};
