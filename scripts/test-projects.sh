#!/bin/bash

# Test GitHub Projects V2 Tools
# Run: chmod +x scripts/test-projects.sh && ./scripts/test-projects.sh

echo "🧪 Testing GitHub Projects V2 Tools"
echo ""

# List projects (using default org from settings)
echo "1️⃣ LIST_GITHUB_PROJECTS (default org)"
deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS
echo ""
echo "---"
echo ""

# List projects for deco-cx
echo "2️⃣ LIST_GITHUB_PROJECTS (deco-cx)"
deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx"}'
echo ""
echo "---"
echo ""

# Get tool metadata for projects category
echo "3️⃣ GET_TOOL_METADATA (projects)"
deno run --allow-read --allow-net test-mcp.ts GET_TOOL_METADATA '{"category":"projects"}'
echo ""

