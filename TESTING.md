# Testing Guide for GitHub Projects MCP

## Setup

### 1. Save Your Cookie
Copy your browser cookie and save it:
```bash
pbpaste > ~/.cookie.txt
```

### 2. Start the Development Server
In one terminal:
```bash
npm run dev
```

## Manual Testing with Deno Script

### Basic Usage
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts <TOOL_NAME> [params]
# Or just make it executable:
chmod +x test-mcp.ts
./test-mcp.ts <TOOL_NAME> [params]
```

### Quick Examples

**List projects (using default org from settings):**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts LIST_GITHUB_PROJECTS
```

**List projects for specific org:**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx"}'
```

**List issues:**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco","state":"OPEN","first":5}'
```

**Get issue details:**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts GET_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1}'
```

**Add tracked repository:**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts ADD_TRACKED_REPOSITORY '{"owner":"deco-cx","name":"deco"}'
```

**List tracked repositories:**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts LIST_TRACKED_REPOSITORIES
```

**Get tool metadata:**
```bash
deno run --allow-read --allow-net --allow-env test-mcp.ts GET_TOOL_METADATA '{"category":"all"}'
```

## Automated Test Scripts

### Quick Test (most common operations)
```bash
chmod +x scripts/quick-test.sh
./scripts/quick-test.sh
```

### Test Projects Tools
```bash
chmod +x scripts/test-projects.sh
./scripts/test-projects.sh
```

### Test Issues Tools
```bash
chmod +x scripts/test-issues.sh
./scripts/test-issues.sh
```

### Test Tracking Tools
```bash
chmod +x scripts/test-tracking.sh
./scripts/test-tracking.sh
```

## All Available Tools

### Projects V2 (7 tools)
```bash
# List projects
deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx"}'

# Get project details
deno run --allow-read --allow-net test-mcp.ts GET_PROJECT_DETAILS '{"projectId":"PVT_kwDOBj_xvs4A_o2I"}'

# Create project
deno run --allow-read --allow-net test-mcp.ts CREATE_PROJECT '{"organizationLogin":"deco-cx","title":"Test Project"}'

# Update project
deno run --allow-read --allow-net test-mcp.ts UPDATE_PROJECT '{"projectId":"PVT_xxx","title":"Updated Title"}'

# Delete project
deno run --allow-read --allow-net test-mcp.ts DELETE_PROJECT '{"projectId":"PVT_xxx"}'

# List project items
deno run --allow-read --allow-net test-mcp.ts LIST_PROJECT_ITEMS '{"projectId":"PVT_xxx","first":10}'

# Add item to project
deno run --allow-read --allow-net test-mcp.ts ADD_ITEM_TO_PROJECT '{"projectId":"PVT_xxx","contentId":"I_yyy"}'
```

### Issues (11 tools)
```bash
# List issues
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco","state":"OPEN"}'

# Get issue
deno run --allow-read --allow-net test-mcp.ts GET_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1}'

# Create issue
deno run --allow-read --allow-net test-mcp.ts CREATE_ISSUE '{"owner":"deco-cx","repo":"deco","title":"Test Issue","body":"This is a test"}'

# Update issue
deno run --allow-read --allow-net test-mcp.ts UPDATE_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1,"title":"Updated Title"}'

# Close issue
deno run --allow-read --allow-net test-mcp.ts CLOSE_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1,"stateReason":"COMPLETED"}'

# Add comment
deno run --allow-read --allow-net test-mcp.ts ADD_ISSUE_COMMENT '{"owner":"deco-cx","repo":"deco","issueNumber":1,"body":"Great work!"}'

# List comments
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUE_COMMENTS '{"owner":"deco-cx","repo":"deco","issueNumber":1}'

# Add labels (requires label node IDs)
deno run --allow-read --allow-net test-mcp.ts ADD_LABELS_TO_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1,"labelIds":["LA_xxx"]}'

# Remove labels
deno run --allow-read --allow-net test-mcp.ts REMOVE_LABELS_FROM_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1,"labelIds":["LA_xxx"]}'

# Assign issue
deno run --allow-read --allow-net test-mcp.ts ASSIGN_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1,"assigneeIds":["MDQ6VXNlcjEyMzQ1"]}'

# Unassign issue
deno run --allow-read --allow-net test-mcp.ts UNASSIGN_ISSUE '{"owner":"deco-cx","repo":"deco","issueNumber":1,"assigneeIds":["MDQ6VXNlcjEyMzQ1"]}'
```

### Tracking (6 tools)
```bash
# Add tracked repository
deno run --allow-read --allow-net test-mcp.ts ADD_TRACKED_REPOSITORY '{"owner":"deco-cx","name":"deco"}'

# List tracked repositories
deno run --allow-read --allow-net test-mcp.ts LIST_TRACKED_REPOSITORIES

# Remove tracked repository
deno run --allow-read --allow-net test-mcp.ts REMOVE_TRACKED_REPOSITORY '{"id":1}'

# Add tracked project
deno run --allow-read --allow-net test-mcp.ts ADD_TRACKED_PROJECT '{"projectId":"PVT_xxx","title":"Platform","organizationLogin":"deco-cx"}'

# List tracked projects
deno run --allow-read --allow-net test-mcp.ts LIST_TRACKED_PROJECTS

# Remove tracked project
deno run --allow-read --allow-net test-mcp.ts REMOVE_TRACKED_PROJECT '{"id":1}'
```

### Metadata (1 tool)
```bash
# Get all tools
deno run --allow-read --allow-net test-mcp.ts GET_TOOL_METADATA '{"category":"all"}'

# Get only project tools
deno run --allow-read --allow-net test-mcp.ts GET_TOOL_METADATA '{"category":"projects"}'

# Get only issue tools
deno run --allow-read --allow-net test-mcp.ts GET_TOOL_METADATA '{"category":"issues"}'
```

## Environment Variables

Set custom MCP URL:
```bash
export MCP_URL=http://localhost:8787
```

Use production URL:
```bash
export MCP_URL=https://github-projects.deco.page
```

## Troubleshooting

**Cookie expired:**
```bash
# Get fresh cookie from browser and update
pbpaste > ~/.cookie.txt
```

**Server not running:**
```bash
npm run dev
```

**Invalid JSON params:**
Make sure to use single quotes around JSON and double quotes inside:
```bash
# ✅ Correct
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco"}'

# ❌ Wrong
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES {"owner":"deco-cx","repo":"deco"}
```

## Advanced Usage

### Chain multiple calls
```bash
# Get project ID, then list its items
PROJECT_ID=$(deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS '{"organizationLogin":"deco-cx"}' | jq -r '.projects[0].id')
deno run --allow-read --allow-net test-mcp.ts LIST_PROJECT_ITEMS "{\"projectId\":\"$PROJECT_ID\"}"
```

### Pretty print with jq
```bash
deno run --allow-read --allow-net test-mcp.ts LIST_GITHUB_PROJECTS | jq '.'
```

### Save output to file
```bash
deno run --allow-read --allow-net test-mcp.ts LIST_ISSUES '{"owner":"deco-cx","repo":"deco"}' > issues.json
```

