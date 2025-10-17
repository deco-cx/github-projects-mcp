#!/bin/bash

# Test GitHub Issues Tools
# Run: chmod +x scripts/test-issues.sh && ./scripts/test-issues.sh

echo "🧪 Testing GitHub Issues Tools"
echo ""

# List issues from deco-cx/deco
echo "1️⃣ LIST_ISSUES (deco-cx/deco)"
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco","state":"OPEN","first":5}'
echo ""
echo "---"
echo ""

# List issues from facebook/react
echo "2️⃣ LIST_ISSUES (facebook/react)"
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"facebook","repo":"react","state":"OPEN","first":3}'
echo ""
echo "---"
echo ""

# Get tool metadata for issues category
echo "3️⃣ GET_TOOL_METADATA (issues)"
deno run --allow-read --allow-net test-mcp.ts GET_TOOL_METADATA '{"category":"issues"}'
echo ""

