import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { MailchimpService } from "./services/mailchimp.js";
import { getToolDefinitions, handleToolCall } from "./tools/index.js";

/**
 * Creates a configured MCP server instance. Shared by the stdio entry point
 * (local/plugin use) and the HTTP entry point (remote use), so both expose
 * exactly the same tools.
 */
export function createMcpServer(mailchimpService: MailchimpService): Server {
  const server = new Server(
    {
      name: "mailchimp-mcp-server",
      version: "2.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: getToolDefinitions(mailchimpService),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return await handleToolCall(
        mailchimpService,
        request.params.name,
        request.params.arguments
      );
    } catch (error: any) {
      console.error("Mailchimp Error:", error);

      if (error.message && error.message.includes("Mailchimp API Error:")) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }

      if (error instanceof Error) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }

      throw new McpError(
        ErrorCode.InternalError,
        "An unexpected error occurred"
      );
    }
  });

  return server;
}
