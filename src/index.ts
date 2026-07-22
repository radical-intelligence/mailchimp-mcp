#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MailchimpService } from "./services/mailchimp.js";
import { createMcpServer } from "./server.js";

// Initialize Mailchimp with API key from environment variable
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
if (!MAILCHIMP_API_KEY) {
  throw new Error("MAILCHIMP_API_KEY environment variable is required");
}

const mailchimpService = new MailchimpService(MAILCHIMP_API_KEY);
const server = createMcpServer(mailchimpService);

/**
 * Start the server using stdio transport.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mailchimp MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
