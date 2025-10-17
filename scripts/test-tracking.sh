#!/bin/bash

# Test Tracking Tools
# Run: chmod +x scripts/test-tracking.sh && ./scripts/test-tracking.sh

echo "🧪 Testing Tracking Tools"
echo ""

# List tracked repositories
echo "1️⃣ LIST_TRACKED_REPOSITORIES"
deno run --allow-read --allow-net test-mcp.ts LIST_TRACKED_REPOSITORIES
echo ""
echo "---"
echo ""

# Add tracked repository
echo "2️⃣ ADD_TRACKED_REPOSITORY (deco-cx/deco)"
deno run --allow-read --allow-net test-mcp.ts ADD_TRACKED_REPOSITORY '{"owner":"deco-cx","name":"deco"}'
echo ""
echo "---"
echo ""

# List tracked repositories again
echo "3️⃣ LIST_TRACKED_REPOSITORIES (after add)"
deno run --allow-read --allow-net test-mcp.ts LIST_TRACKED_REPOSITORIES
echo ""
echo "---"
echo ""

# List tracked projects
echo "4️⃣ LIST_TRACKED_PROJECTS"
deno run --allow-read --allow-net test-mcp.ts LIST_TRACKED_PROJECTS
echo ""

