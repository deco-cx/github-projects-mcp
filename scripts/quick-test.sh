#!/bin/bash

# Quick test of common tools
# Run: chmod +x scripts/quick-test.sh && ./scripts/quick-test.sh

echo "🚀 Quick MCP Tools Test"
echo ""
echo "Testing the most commonly used tools..."
echo ""

# Test 1: List projects
echo "📊 Test 1: List Projects (deco-cx)"
deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx","first":3}'
echo ""
echo "✅ Projects test complete"
echo ""
echo "---"
echo ""

# Test 2: List issues
echo "🐛 Test 2: List Issues (deco-cx/deco)"
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco","state":"OPEN","first":3}'
echo ""
echo "✅ Issues test complete"
echo ""
echo "---"
echo ""

# Test 3: List tracked items
echo "📝 Test 3: List Tracked Repositories"
deno run --allow-read --allow-net test-mcp.ts LIST_TRACKED_REPOSITORIES
echo ""
echo "✅ Tracking test complete"
echo ""
echo "---"
echo ""

echo "🎉 All quick tests complete!"
echo ""
echo "💡 To add tracking, run:"
echo "   deno run --allow-read --allow-net test-mcp.ts ADD_TRACKED_REPOSITORY '{\"owner\":\"deco-cx\",\"name\":\"deco\"}'"

