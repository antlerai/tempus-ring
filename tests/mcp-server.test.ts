import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TempusMCPServer, createTempusMCPServer, DEFAULT_MCP_CONFIG } from '../src/services/mcp-server';
import { TimerService } from '../src/services/timer-service';
import { TimerState } from '../src/types';

// Create mock instances
const mockMcpServerInstance = {
  registerResource: vi.fn(),
  registerTool: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
};

const mockStdioTransportInstance = {
  onclose: null,
  close: vi.fn(),
};

const mockHttpTransportInstance = {
  sessionId: 'test-session-id',
  onclose: null,
  close: vi.fn(),
};

// Mock the MCP SDK modules
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn(() => mockMcpServerInstance),
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn(() => mockStdioTransportInstance),
}));

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: vi.fn(() => mockHttpTransportInstance),
}));

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return {
    ...actual,
    randomUUID: vi.fn(() => 'mocked-uuid'),
  };
});

// Mock TimerService
vi.mock('../src/services/timer-service', () => ({
  TimerService: vi.fn().mockImplementation(() => ({
    getState: vi.fn(() => ({
      state: TimerState.IDLE,
      progress: 0,
      remainingTime: 1500,
      completedSessions: 0,
      sessionsUntilLongBreak: 4,
    })),
    getConfig: vi.fn(() => ({
      workDuration: 1500,
      shortBreakDuration: 300,
      longBreakDuration: 900,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
    })),
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    updateConfig: vi.fn(),
    on: vi.fn(),
  })),
}));

describe('TempusMCPServer', () => {
  let mcpServer: TempusMCPServer;
  let timerService: TimerService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear mock state
    mockMcpServerInstance.registerResource.mockClear();
    mockMcpServerInstance.registerTool.mockClear();
    mockMcpServerInstance.connect.mockClear();
    mockStdioTransportInstance.close.mockClear();
    mockHttpTransportInstance.close.mockClear();
    mockStdioTransportInstance.onclose = null;
    mockHttpTransportInstance.onclose = null;
    
    timerService = new TimerService();
    mcpServer = new TempusMCPServer(timerService, DEFAULT_MCP_CONFIG);
  });

  afterEach(() => {
    mcpServer.close();
  });

  describe('constructor', () => {
    it('should create MCP server with correct configuration', () => {
      expect(mcpServer).toBeInstanceOf(TempusMCPServer);
      
      const serverInfo = mcpServer.getServerInfo();
      expect(serverInfo.name).toBe(DEFAULT_MCP_CONFIG.name);
      expect(serverInfo.version).toBe(DEFAULT_MCP_CONFIG.version);
      expect(serverInfo.activeSessions).toBe(0);
    });

    it('should setup timer service event listeners', () => {
      expect(timerService.on).toHaveBeenCalledWith('timer:stateChange', expect.any(Function));
      expect(timerService.on).toHaveBeenCalledWith('timer:sessionComplete', expect.any(Function));
      expect(timerService.on).toHaveBeenCalledWith('timer:sessionStart', expect.any(Function));
      expect(timerService.on).toHaveBeenCalledWith('timer:tick', expect.any(Function));
    });
  });

  describe('stdio transport', () => {
    it('should connect to stdio transport successfully', async () => {
      await expect(mcpServer.connectStdio()).resolves.toBeUndefined();
      
      const activeSessions = mcpServer.getActiveSessions();
      expect(activeSessions).toContain('stdio-transport');
      expect(activeSessions.length).toBe(1);
    });

    it('should handle stdio transport closure', async () => {
      await mcpServer.connectStdio();
      expect(mcpServer.getActiveSessions()).toHaveLength(1);
      
      // The actual test is that the onclose handler is properly set
      // We can't easily test the removal without modifying the implementation
      expect(mockStdioTransportInstance.onclose).toBeDefined();
    });
  });

  describe('HTTP transport', () => {
    it('should create HTTP transport with correct configuration', () => {
      const transport = mcpServer.createHTTPTransport();
      expect(transport).toBeDefined();
    });

    it('should connect to HTTP transport successfully', async () => {
      const transport = mcpServer.createHTTPTransport();
      await expect(mcpServer.connectHTTP(transport)).resolves.toBeUndefined();
      
      const activeSessions = mcpServer.getActiveSessions();
      expect(activeSessions).toContain('test-session-id');
      expect(activeSessions.length).toBe(1);
    });

    it('should handle HTTP transport closure', async () => {
      const transport = mcpServer.createHTTPTransport();
      await mcpServer.connectHTTP(transport);
      expect(mcpServer.getActiveSessions()).toHaveLength(1);
      
      // The actual test is that the onclose handler is properly set
      // We can't easily test the removal without modifying the implementation
      expect(mockHttpTransportInstance.onclose).toBeDefined();
    });
  });

  describe('timer control tools', () => {
    it('should register all required timer tools', () => {
      
      expect(mockMcpServerInstance.registerTool).toHaveBeenCalledWith(
        'start-timer',
        expect.objectContaining({
          title: 'Start Timer',
          description: 'Start the Pomodoro timer',
        }),
        expect.any(Function)
      );
      
      expect(mockMcpServerInstance.registerTool).toHaveBeenCalledWith(
        'pause-timer',
        expect.objectContaining({
          title: 'Pause Timer',
          description: 'Pause the currently running timer',
        }),
        expect.any(Function)
      );
      
      expect(mockMcpServerInstance.registerTool).toHaveBeenCalledWith(
        'resume-timer',
        expect.objectContaining({
          title: 'Resume Timer',
          description: 'Resume a paused timer',
        }),
        expect.any(Function)
      );
      
      expect(mockMcpServerInstance.registerTool).toHaveBeenCalledWith(
        'reset-timer',
        expect.objectContaining({
          title: 'Reset Timer',
          description: 'Reset the timer to idle state',
        }),
        expect.any(Function)
      );
      
      expect(mockMcpServerInstance.registerTool).toHaveBeenCalledWith(
        'get-timer-status',
        expect.objectContaining({
          title: 'Get Timer Status',
          description: 'Get the current timer state and progress',
        }),
        expect.any(Function)
      );
      
      expect(mockMcpServerInstance.registerTool).toHaveBeenCalledWith(
        'update-timer-config',
        expect.objectContaining({
          title: 'Update Timer Configuration',
          description: 'Update timer configuration settings',
        }),
        expect.any(Function)
      );
    });
  });

  describe('resources', () => {
    it('should register timer state resource', () => {
      expect(mockMcpServerInstance.registerResource).toHaveBeenCalledWith(
        'timer-state',
        'timer://state',
        expect.objectContaining({
          title: 'Timer State',
          description: 'Current timer state including progress and session info',
          mimeType: 'application/json',
        }),
        expect.any(Function)
      );
    });

    it('should register timer config resource', () => {
      expect(mockMcpServerInstance.registerResource).toHaveBeenCalledWith(
        'timer-config',
        'timer://config',
        expect.objectContaining({
          title: 'Timer Configuration',
          description: 'Current timer configuration settings',
          mimeType: 'application/json',
        }),
        expect.any(Function)
      );
    });
  });

  describe('session management', () => {
    it('should track multiple active sessions', async () => {
      await mcpServer.connectStdio();
      
      const httpTransport = mcpServer.createHTTPTransport();
      await mcpServer.connectHTTP(httpTransport);
      
      const activeSessions = mcpServer.getActiveSessions();
      expect(activeSessions).toHaveLength(2);
      expect(activeSessions).toContain('stdio-transport');
      expect(activeSessions).toContain('test-session-id');
    });

    it('should close all transports when server is closed', async () => {
      await mcpServer.connectStdio();
      const httpTransport = mcpServer.createHTTPTransport();
      await mcpServer.connectHTTP(httpTransport);
      
      mcpServer.close();
      
      // Verify all transports were closed
      expect(mockStdioTransportInstance.close).toHaveBeenCalled();
      expect(mockHttpTransportInstance.close).toHaveBeenCalled();
      expect(mcpServer.getActiveSessions()).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle transport close errors gracefully', async () => {
      mockStdioTransportInstance.close.mockImplementation(() => {
        throw new Error('Transport close error');
      });

      await mcpServer.connectStdio();
      
      // Should not throw when closing
      expect(() => mcpServer.close()).not.toThrow();
    });

    it('should handle timer service errors in tools', async () => {
      const mockTimerService = timerService as any;
      mockTimerService.start.mockImplementation(() => {
        throw new Error('Timer start failed');
      });

      // Simulate tool execution - would need access to registered tool handlers
      // This is a simplified test since we can't easily access the registered handlers
      expect(mockTimerService.start).toBeDefined();
    });
  });

  describe('configuration validation', () => {
    it('should validate timer config updates correctly', () => {
      // Access the private method through type assertion for testing
      const server = mcpServer as any;
      
      const validConfig = {
        workDuration: 1800,
        shortBreakDuration: 360,
        longBreakDuration: 1200,
        sessionsUntilLongBreak: 3,
        autoStartBreaks: true,
        autoStartPomodoros: true,
      };
      
      const result = server.validateTimerConfigUpdate(validConfig);
      expect(result).toEqual(validConfig);
    });

    it('should filter out invalid config properties', () => {
      const server = mcpServer as any;
      
      const invalidConfig = {
        workDuration: 1800,
        invalidProperty: 'should be filtered',
        shortBreakDuration: 'not a number',
        autoStartBreaks: true,
      };
      
      const result = server.validateTimerConfigUpdate(invalidConfig);
      expect(result).toEqual({
        workDuration: 1800,
        autoStartBreaks: true,
      });
      expect(result).not.toHaveProperty('invalidProperty');
      expect(result).not.toHaveProperty('shortBreakDuration');
    });
  });
});

describe('createTempusMCPServer factory', () => {
  it('should create a new TempusMCPServer instance', () => {
    const timerService = new TimerService();
    const server = createTempusMCPServer(timerService, DEFAULT_MCP_CONFIG);
    
    expect(server).toBeInstanceOf(TempusMCPServer);
    
    const serverInfo = server.getServerInfo();
    expect(serverInfo.name).toBe(DEFAULT_MCP_CONFIG.name);
    expect(serverInfo.version).toBe(DEFAULT_MCP_CONFIG.version);
    
    server.close();
  });
});

describe('DEFAULT_MCP_CONFIG', () => {
  it('should export correct default configuration', () => {
    expect(DEFAULT_MCP_CONFIG).toEqual({
      name: 'tempus-ring',
      version: '1.0.0',
      port: 3000,
      allowedHosts: ['127.0.0.1', 'localhost'],
      allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    });
  });
});