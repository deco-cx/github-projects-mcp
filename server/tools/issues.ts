/**
 * GitHub Issues management tools.
 *
 * This file contains all tools related to GitHub Issues operations including:
 * - Listing and getting issues
 * - Creating, updating, and closing issues
 * - Managing comments
 * - Managing labels and assignees
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { createGitHubClient } from "../lib/github.ts";

export const createListIssues = (env: Env) =>
  createPrivateTool({
    id: "LIST_ISSUES",
    description:
      "List issues in a GitHub repository with optional filtering by state, labels, and assignee.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      state: z
        .enum(["OPEN", "CLOSED"])
        .optional()
        .describe("Filter by issue state (OPEN or CLOSED)"),
      labels: z
        .array(z.string())
        .optional()
        .describe("Filter by label names"),
      assignee: z
        .string()
        .optional()
        .describe("Filter by assignee username"),
      first: z
        .number()
        .optional()
        .default(20)
        .describe("Number of issues to fetch (default: 20, max: 100)"),
    }),
    outputSchema: z.object({
      issues: z.array(
        z.object({
          id: z.string(),
          number: z.number(),
          title: z.string(),
          body: z.string().nullable(),
          state: z.string(),
          url: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          author: z
            .object({
              login: z.string(),
            })
            .nullable(),
          labels: z.array(
            z.object({
              name: z.string(),
              color: z.string(),
            })
          ),
          assignees: z.array(
            z.object({
              login: z.string(),
            })
          ),
        })
      ),
      totalCount: z.number(),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      const query = `
        query ListIssues($owner: String!, $repo: String!, $states: [IssueState!], $labels: [String!], $first: Int!) {
          repository(owner: $owner, name: $repo) {
            issues(
              first: $first
              states: $states
              labels: $labels
              orderBy: { field: CREATED_AT, direction: DESC }
            ) {
              totalCount
              nodes {
                id
                number
                title
                body
                state
                url
                createdAt
                updatedAt
                author {
                  login
                }
                labels(first: 10) {
                  nodes {
                    name
                    color
                  }
                }
                assignees(first: 10) {
                  nodes {
                    login
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        repository: {
          issues: {
            totalCount: number;
            nodes: Array<{
              id: string;
              number: number;
              title: string;
              body: string | null;
              state: string;
              url: string;
              createdAt: string;
              updatedAt: string;
              author: { login: string } | null;
              labels: { nodes: Array<{ name: string; color: string }> };
              assignees: { nodes: Array<{ login: string }> };
            }>;
          };
        };
      }>(query, {
        owner: context.owner,
        repo: context.repo,
        states: context.state ? [context.state] : undefined,
        labels: context.labels,
        first: Math.min(context.first || 20, 100),
      });

      return {
        issues: result.repository.issues.nodes.map((issue) => ({
          ...issue,
          labels: issue.labels.nodes,
          assignees: issue.assignees.nodes,
        })),
        totalCount: result.repository.issues.totalCount,
      };
    },
  });

export const createGetIssue = (env: Env) =>
  createPrivateTool({
    id: "GET_ISSUE",
    description:
      "Get detailed information about a specific GitHub issue by its number.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
    }),
    outputSchema: z.object({
      issue: z.object({
        id: z.string(),
        number: z.number(),
        title: z.string(),
        body: z.string().nullable(),
        state: z.string(),
        url: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        closedAt: z.string().nullable(),
        author: z
          .object({
            login: z.string(),
          })
          .nullable(),
        labels: z.array(
          z.object({
            name: z.string(),
            color: z.string(),
          })
        ),
        assignees: z.array(
          z.object({
            login: z.string(),
          })
        ),
        milestone: z
          .object({
            title: z.string(),
          })
          .nullable(),
        commentsCount: z.number(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      const query = `
        query GetIssue($owner: String!, $repo: String!, $issueNumber: Int!) {
          repository(owner: $owner, name: $repo) {
            issue(number: $issueNumber) {
              id
              number
              title
              body
              state
              url
              createdAt
              updatedAt
              closedAt
              author {
                login
              }
              labels(first: 50) {
                nodes {
                  name
                  color
                }
              }
              assignees(first: 50) {
                nodes {
                  login
                }
              }
              milestone {
                title
              }
              comments {
                totalCount
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        repository: {
          issue: {
            id: string;
            number: number;
            title: string;
            body: string | null;
            state: string;
            url: string;
            createdAt: string;
            updatedAt: string;
            closedAt: string | null;
            author: { login: string } | null;
            labels: { nodes: Array<{ name: string; color: string }> };
            assignees: { nodes: Array<{ login: string }> };
            milestone: { title: string } | null;
            comments: { totalCount: number };
          };
        };
      }>(query, {
        owner: context.owner,
        repo: context.repo,
        issueNumber: context.issueNumber,
      });

      const issue = result.repository.issue;

      return {
        issue: {
          ...issue,
          labels: issue.labels.nodes,
          assignees: issue.assignees.nodes,
          commentsCount: issue.comments.totalCount,
        },
      };
    },
  });

export const createCreateIssue = (env: Env) =>
  createPrivateTool({
    id: "CREATE_ISSUE",
    description:
      "Create a new GitHub issue with optional assignees, labels, and milestone.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Issue title"),
      body: z.string().optional().describe("Issue body (markdown supported)"),
      assigneeIds: z
        .array(z.string())
        .optional()
        .describe("Node IDs of users to assign (use getIssueNodeId helper)"),
      labelIds: z
        .array(z.string())
        .optional()
        .describe("Node IDs of labels to add"),
      milestoneId: z.string().optional().describe("Node ID of milestone"),
    }),
    outputSchema: z.object({
      issue: z.object({
        id: z.string(),
        number: z.number(),
        title: z.string(),
        url: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get repository node ID
      const repoId = await client.getRepositoryNodeId(
        context.owner,
        context.repo
      );

      const mutation = `
        mutation CreateIssue(
          $repositoryId: ID!
          $title: String!
          $body: String
          $assigneeIds: [ID!]
          $labelIds: [ID!]
          $milestoneId: ID
        ) {
          createIssue(
            input: {
              repositoryId: $repositoryId
              title: $title
              body: $body
              assigneeIds: $assigneeIds
              labelIds: $labelIds
              milestoneId: $milestoneId
            }
          ) {
            issue {
              id
              number
              title
              url
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        createIssue: {
          issue: {
            id: string;
            number: number;
            title: string;
            url: string;
          };
        };
      }>(mutation, {
        repositoryId: repoId,
        title: context.title,
        body: context.body,
        assigneeIds: context.assigneeIds,
        labelIds: context.labelIds,
        milestoneId: context.milestoneId,
      });

      return {
        issue: result.createIssue.issue,
      };
    },
  });

export const createUpdateIssue = (env: Env) =>
  createPrivateTool({
    id: "UPDATE_ISSUE",
    description:
      "Update an existing GitHub issue's title, body, or state (open/closed).",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      title: z.string().optional().describe("New issue title"),
      body: z.string().optional().describe("New issue body (markdown supported)"),
      state: z
        .enum(["OPEN", "CLOSED"])
        .optional()
        .describe("New issue state"),
    }),
    outputSchema: z.object({
      issue: z.object({
        id: z.string(),
        number: z.number(),
        title: z.string(),
        url: z.string(),
        state: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation UpdateIssue(
          $issueId: ID!
          $title: String
          $body: String
          $state: IssueState
        ) {
          updateIssue(
            input: { id: $issueId, title: $title, body: $body, state: $state }
          ) {
            issue {
              id
              number
              title
              url
              state
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        updateIssue: {
          issue: {
            id: string;
            number: number;
            title: string;
            url: string;
            state: string;
          };
        };
      }>(mutation, {
        issueId,
        title: context.title,
        body: context.body,
        state: context.state,
      });

      return {
        issue: result.updateIssue.issue,
      };
    },
  });

export const createCloseIssue = (env: Env) =>
  createPrivateTool({
    id: "CLOSE_ISSUE",
    description:
      "Close a GitHub issue with an optional state reason (completed or not_planned).",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      stateReason: z
        .enum(["COMPLETED", "NOT_PLANNED"])
        .optional()
        .describe("Reason for closing (completed or not_planned)"),
    }),
    outputSchema: z.object({
      issue: z.object({
        id: z.string(),
        number: z.number(),
        state: z.string(),
        stateReason: z.string().nullable(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation CloseIssue($issueId: ID!, $stateReason: IssueClosedStateReason) {
          closeIssue(input: { issueId: $issueId, stateReason: $stateReason }) {
            issue {
              id
              number
              state
              stateReason
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        closeIssue: {
          issue: {
            id: string;
            number: number;
            state: string;
            stateReason: string | null;
          };
        };
      }>(mutation, {
        issueId,
        stateReason: context.stateReason,
      });

      return {
        issue: result.closeIssue.issue,
      };
    },
  });

export const createAddIssueComment = (env: Env) =>
  createPrivateTool({
    id: "ADD_ISSUE_COMMENT",
    description: "Add a comment to a GitHub issue.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      body: z.string().describe("Comment body (markdown supported)"),
    }),
    outputSchema: z.object({
      comment: z.object({
        id: z.string(),
        body: z.string(),
        url: z.string(),
        createdAt: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation AddComment($subjectId: ID!, $body: String!) {
          addComment(input: { subjectId: $subjectId, body: $body }) {
            commentEdge {
              node {
                id
                body
                url
                createdAt
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        addComment: {
          commentEdge: {
            node: {
              id: string;
              body: string;
              url: string;
              createdAt: string;
            };
          };
        };
      }>(mutation, {
        subjectId: issueId,
        body: context.body,
      });

      return {
        comment: result.addComment.commentEdge.node,
      };
    },
  });

export const createListIssueComments = (env: Env) =>
  createPrivateTool({
    id: "LIST_ISSUE_COMMENTS",
    description: "List all comments on a GitHub issue.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      first: z
        .number()
        .optional()
        .default(20)
        .describe("Number of comments to fetch (default: 20, max: 100)"),
    }),
    outputSchema: z.object({
      comments: z.array(
        z.object({
          id: z.string(),
          body: z.string(),
          url: z.string(),
          createdAt: z.string(),
          author: z
            .object({
              login: z.string(),
            })
            .nullable(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      const query = `
        query ListComments($owner: String!, $repo: String!, $issueNumber: Int!, $first: Int!) {
          repository(owner: $owner, name: $repo) {
            issue(number: $issueNumber) {
              comments(first: $first) {
                nodes {
                  id
                  body
                  url
                  createdAt
                  author {
                    login
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        repository: {
          issue: {
            comments: {
              nodes: Array<{
                id: string;
                body: string;
                url: string;
                createdAt: string;
                author: { login: string } | null;
              }>;
            };
          };
        };
      }>(query, {
        owner: context.owner,
        repo: context.repo,
        issueNumber: context.issueNumber,
        first: Math.min(context.first || 20, 100),
      });

      return {
        comments: result.repository.issue.comments.nodes,
      };
    },
  });

export const createAddLabelsToIssue = (env: Env) =>
  createPrivateTool({
    id: "ADD_LABELS_TO_ISSUE",
    description: "Add one or more labels to a GitHub issue by label node IDs.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      labelIds: z
        .array(z.string())
        .describe("Array of label node IDs to add"),
    }),
    outputSchema: z.object({
      labels: z.array(
        z.object({
          name: z.string(),
          color: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation AddLabels($labelableId: ID!, $labelIds: [ID!]!) {
          addLabelsToLabelable(
            input: { labelableId: $labelableId, labelIds: $labelIds }
          ) {
            labelable {
              ... on Issue {
                labels(first: 50) {
                  nodes {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        addLabelsToLabelable: {
          labelable: {
            labels: {
              nodes: Array<{ name: string; color: string }>;
            };
          };
        };
      }>(mutation, {
        labelableId: issueId,
        labelIds: context.labelIds,
      });

      return {
        labels: result.addLabelsToLabelable.labelable.labels.nodes,
      };
    },
  });

export const createRemoveLabelsFromIssue = (env: Env) =>
  createPrivateTool({
    id: "REMOVE_LABELS_FROM_ISSUE",
    description:
      "Remove one or more labels from a GitHub issue by label node IDs.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      labelIds: z
        .array(z.string())
        .describe("Array of label node IDs to remove"),
    }),
    outputSchema: z.object({
      labels: z.array(
        z.object({
          name: z.string(),
          color: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation RemoveLabels($labelableId: ID!, $labelIds: [ID!]!) {
          removeLabelsFromLabelable(
            input: { labelableId: $labelableId, labelIds: $labelIds }
          ) {
            labelable {
              ... on Issue {
                labels(first: 50) {
                  nodes {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        removeLabelsFromLabelable: {
          labelable: {
            labels: {
              nodes: Array<{ name: string; color: string }>;
            };
          };
        };
      }>(mutation, {
        labelableId: issueId,
        labelIds: context.labelIds,
      });

      return {
        labels: result.removeLabelsFromLabelable.labelable.labels.nodes,
      };
    },
  });

export const createAssignIssue = (env: Env) =>
  createPrivateTool({
    id: "ASSIGN_ISSUE",
    description:
      "Assign one or more users to a GitHub issue by user node IDs.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      assigneeIds: z
        .array(z.string())
        .describe("Array of user node IDs to assign"),
    }),
    outputSchema: z.object({
      assignees: z.array(
        z.object({
          login: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation AssignIssue($assignableId: ID!, $assigneeIds: [ID!]!) {
          addAssigneesToAssignable(
            input: { assignableId: $assignableId, assigneeIds: $assigneeIds }
          ) {
            assignable {
              ... on Issue {
                assignees(first: 50) {
                  nodes {
                    login
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        addAssigneesToAssignable: {
          assignable: {
            assignees: {
              nodes: Array<{ login: string }>;
            };
          };
        };
      }>(mutation, {
        assignableId: issueId,
        assigneeIds: context.assigneeIds,
      });

      return {
        assignees: result.addAssigneesToAssignable.assignable.assignees.nodes,
      };
    },
  });

export const createUnassignIssue = (env: Env) =>
  createPrivateTool({
    id: "UNASSIGN_ISSUE",
    description:
      "Remove one or more assignees from a GitHub issue by user node IDs.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      repo: z.string().describe("Repository name"),
      issueNumber: z.number().describe("Issue number"),
      assigneeIds: z
        .array(z.string())
        .describe("Array of user node IDs to unassign"),
    }),
    outputSchema: z.object({
      assignees: z.array(
        z.object({
          login: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      // Get issue node ID
      const issueId = await client.getIssueNodeId(
        context.owner,
        context.repo,
        context.issueNumber
      );

      const mutation = `
        mutation UnassignIssue($assignableId: ID!, $assigneeIds: [ID!]!) {
          removeAssigneesFromAssignable(
            input: { assignableId: $assignableId, assigneeIds: $assigneeIds }
          ) {
            assignable {
              ... on Issue {
                assignees(first: 50) {
                  nodes {
                    login
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        removeAssigneesFromAssignable: {
          assignable: {
            assignees: {
              nodes: Array<{ login: string }>;
            };
          };
        };
      }>(mutation, {
        assignableId: issueId,
        assigneeIds: context.assigneeIds,
      });

      return {
        assignees:
          result.removeAssigneesFromAssignable.assignable.assignees.nodes,
      };
    },
  });

// Export all issue tools
export const issueTools = [
  createListIssues,
  createGetIssue,
  createCreateIssue,
  createUpdateIssue,
  createCloseIssue,
  createAddIssueComment,
  createListIssueComments,
  createAddLabelsToIssue,
  createRemoveLabelsFromIssue,
  createAssignIssue,
  createUnassignIssue,
];

