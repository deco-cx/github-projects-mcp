#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

/**
 * MCP Tools Testing Script
 * 
 * Usage:
 *   deno run --allow-read --allow-net --allow-env test-mcp.ts <TOOL_NAME> [params]
 * 
 * Examples:
 *   deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS
 *   deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx"}'
 *   deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco","state":"OPEN"}'
 */

const MCP_URL = Deno.env.get("MCP_URL") || "http://localhost:8787";
const COOKIE_PATH = `${Deno.env.get("HOME")}/.cookie.txt`;

async function loadCookie(): Promise<string> {
  try {
    const cookie = await Deno.readTextFile(COOKIE_PATH);
    return cookie.trim();
  } catch {
    console.error(`❌ Cookie file not found at ${COOKIE_PATH}`);
    console.error(`💡 Run: pbpaste > ~/.cookie.txt`);
    Deno.exit(1);
  }
}

async function callTool(toolName: string, params: Record<string, any> = {}) {
  const cookie = await loadCookie();
  
  console.log(`\n🚀 Calling tool: ${toolName}`);
  console.log(`📦 Params:`, JSON.stringify(params, null, 2));
  console.log(`⏳ Waiting for response...\n`);

  const response = await fetch(`${MCP_URL}/mcp/call-tool/${toolName}`, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "content-type": "text/plain;charset=UTF-8",
      "cookie": cookie,
      "x-deco-mcp-client": "true",
    },
    body: JSON.stringify(params),
    credentials: "include",
  });

  if (!response.ok) {
    console.error(`❌ Error: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error(text);
    Deno.exit(1);
  }

  const result = await response.json();
  console.log(`✅ Success!\n`);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

// Main execution
const args = Deno.args;

if (args.length === 0) {
  console.log(`
🧪 MCP Tools Testing Script

Usage:
  deno run --allow-read --allow-net test-mcp.ts <TOOL_NAME> [params]

Available Tools:

📊 PROJECTS:
  LIST_GITHUB_PROJECTS          List projects in an organization
  GET_PROJECT_DETAILS           Get details of a specific project
  CREATE_PROJECT                Create a new project
  UPDATE_PROJECT                Update project details
  DELETE_PROJECT                Delete a project
  LIST_PROJECT_ITEMS            List items in a project
  ADD_ITEM_TO_PROJECT           Add issue/PR to project

🐛 ISSUES:
  LIST_ISSUES                   List issues in a repository
  GET_ISSUE                     Get details of a specific issue
  CREATE_ISSUE                  Create a new issue
  UPDATE_ISSUE                  Update issue details
  CLOSE_ISSUE                   Close an issue
  ADD_ISSUE_COMMENT             Add comment to issue
  LIST_ISSUE_COMMENTS           List comments on issue
  ADD_LABELS_TO_ISSUE           Add labels to issue
  REMOVE_LABELS_FROM_ISSUE      Remove labels from issue
  ASSIGN_ISSUE                  Assign users to issue
  UNASSIGN_ISSUE                Remove assignees from issue

📝 TRACKING:
  ADD_TRACKED_REPOSITORY        Add repository to tracking
  LIST_TRACKED_REPOSITORIES     List tracked repositories
  REMOVE_TRACKED_REPOSITORY     Remove tracked repository
  ADD_TRACKED_PROJECT           Add project to tracking
  LIST_TRACKED_PROJECTS         List tracked projects
  REMOVE_TRACKED_PROJECT        Remove tracked project

🔍 METADATA:
  GET_TOOL_METADATA             Get information about all tools

Examples:
  deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS
  deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx"}'
  deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco"}'
  deno run --allow-read --allow-net test-mcp.ts GET_TOOL_METADATA '{"category":"projects"}'

Setup:
  1. Copy your browser cookie: pbpaste > ~/.cookie.txt
  2. Run npm run dev in another terminal
  3. Run this script with a tool name
`);
  Deno.exit(0);
}

const toolName = args[0];
const params = args[1] ? JSON.parse(args[1]) : {};

await callTool(toolName, params);

