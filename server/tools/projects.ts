/**
 * GitHub Projects V2 management tools.
 *
 * This file contains all tools related to GitHub Projects V2 operations including:
 * - Listing projects
 * - Getting project details
 * - Creating, updating, and deleting projects
 * - Managing project items
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { createGitHubClient } from "../lib/github.ts";

export const createListGitHubProjects = (env: Env) =>
  createPrivateTool({
    id: "LIST_GITHUB_PROJECTS",
    description:
      "List all GitHub Projects V2 for a given organization. Returns project IDs and titles.",
    inputSchema: z.object({
      organizationLogin: z
        .string()
        .describe("GitHub organization login (e.g., 'deco-cx')"),
      first: z
        .number()
        .optional()
        .default(20)
        .describe("Number of projects to fetch (default: 20, max: 100)"),
    }),
    outputSchema: z.object({
      projects: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          number: z.number().optional(),
          url: z.string().optional(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;

      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);
      const orgLogin =
        context.organizationLogin || state.defaultOrganization;

      if (!orgLogin) {
        throw new Error(
          "Organization login is required. Provide it in the input or set a default organization in app configuration."
        );
      }

      const query = `
        query ListProjects($login: String!, $first: Int!) {
          organization(login: $login) {
            projectsV2(first: $first) {
              nodes {
                id
                title
                number
                url
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        organization: {
          projectsV2: {
            nodes: Array<{
              id: string;
              title: string;
              number: number;
              url: string;
            }>;
          };
        };
      }>(query, {
        login: orgLogin,
        first: Math.min(context.first || 20, 100),
      });

      return {
        projects: result.organization.projectsV2.nodes,
      };
    },
  });

export const createGetProjectDetails = (env: Env) =>
  createPrivateTool({
    id: "GET_PROJECT_DETAILS",
    description:
      "Get detailed information about a specific GitHub Project V2, including its fields and items.",
    inputSchema: z.object({
      projectId: z.string().describe("GitHub Project V2 node ID"),
    }),
    outputSchema: z.object({
      project: z.object({
        id: z.string(),
        title: z.string(),
        number: z.number(),
        url: z.string(),
        shortDescription: z.string().nullable(),
        readme: z.string().nullable(),
        closed: z.boolean(),
        public: z.boolean(),
        itemsCount: z.number(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      const query = `
        query GetProject($projectId: ID!) {
          node(id: $projectId) {
            ... on ProjectV2 {
              id
              title
              number
              url
              shortDescription
              readme
              closed
              public
              items {
                totalCount
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        node: {
          id: string;
          title: string;
          number: number;
          url: string;
          shortDescription: string | null;
          readme: string | null;
          closed: boolean;
          public: boolean;
          items: {
            totalCount: number;
          };
        };
      }>(query, { projectId: context.projectId });

      return {
        project: {
          ...result.node,
          itemsCount: result.node.items.totalCount,
        },
      };
    },
  });

export const createCreateProject = (env: Env) =>
  createPrivateTool({
    id: "CREATE_PROJECT",
    description:
      "Create a new GitHub Project V2 in an organization. Returns the created project details.",
    inputSchema: z.object({
      organizationLogin: z
        .string()
        .describe("GitHub organization login (e.g., 'deco-cx')"),
      title: z.string().describe("Project title"),
      description: z
        .string()
        .optional()
        .describe("Project description (optional)"),
    }),
    outputSchema: z.object({
      project: z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        number: z.number(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);
      const orgLogin =
        context.organizationLogin || state.defaultOrganization;

      if (!orgLogin) {
        throw new Error(
          "Organization login is required. Provide it in the input or set a default organization in app configuration."
        );
      }

      // First, get the organization node ID
      const orgQuery = `
        query GetOrgId($login: String!) {
          organization(login: $login) {
            id
          }
        }
      `;

      const orgResult = await client.graphqlQuery<{
        organization: { id: string };
      }>(orgQuery, { login: orgLogin });

      // Create the project
      const mutation = `
        mutation CreateProject($ownerId: ID!, $title: String!) {
          createProjectV2(input: { ownerId: $ownerId, title: $title }) {
            projectV2 {
              id
              title
              url
              number
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        createProjectV2: {
          projectV2: {
            id: string;
            title: string;
            url: string;
            number: number;
          };
        };
      }>(mutation, {
        ownerId: orgResult.organization.id,
        title: context.title,
      });

      return {
        project: result.createProjectV2.projectV2,
      };
    },
  });

export const createUpdateProject = (env: Env) =>
  createPrivateTool({
    id: "UPDATE_PROJECT",
    description:
      "Update a GitHub Project V2's title, description, or readme. Returns the updated project details.",
    inputSchema: z.object({
      projectId: z.string().describe("GitHub Project V2 node ID"),
      title: z.string().optional().describe("New project title"),
      shortDescription: z
        .string()
        .optional()
        .describe("New short description"),
      readme: z.string().optional().describe("New readme content"),
      public: z.boolean().optional().describe("Make project public or private"),
    }),
    outputSchema: z.object({
      project: z.object({
        id: z.string(),
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

      const mutation = `
        mutation UpdateProject($projectId: ID!, $title: String, $shortDescription: String, $readme: String, $public: Boolean) {
          updateProjectV2(
            input: {
              projectId: $projectId
              title: $title
              shortDescription: $shortDescription
              readme: $readme
              public: $public
            }
          ) {
            projectV2 {
              id
              title
              url
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        updateProjectV2: {
          projectV2: {
            id: string;
            title: string;
            url: string;
          };
        };
      }>(mutation, {
        projectId: context.projectId,
        title: context.title,
        shortDescription: context.shortDescription,
        readme: context.readme,
        public: context.public,
      });

      return {
        project: result.updateProjectV2.projectV2,
      };
    },
  });

export const createDeleteProject = (env: Env) =>
  createPrivateTool({
    id: "DELETE_PROJECT",
    description:
      "Delete a GitHub Project V2. This action is permanent and cannot be undone.",
    inputSchema: z.object({
      projectId: z.string().describe("GitHub Project V2 node ID to delete"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      deletedProjectId: z.string(),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      const mutation = `
        mutation DeleteProject($projectId: ID!) {
          deleteProjectV2(input: { projectId: $projectId }) {
            projectV2 {
              id
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        deleteProjectV2: {
          projectV2: {
            id: string;
          };
        };
      }>(mutation, { projectId: context.projectId });

      return {
        success: true,
        deletedProjectId: result.deleteProjectV2.projectV2.id,
      };
    },
  });

export const createListProjectItems = (env: Env) =>
  createPrivateTool({
    id: "LIST_PROJECT_ITEMS",
    description:
      "List all items (issues and pull requests) in a GitHub Project V2.",
    inputSchema: z.object({
      projectId: z.string().describe("GitHub Project V2 node ID"),
      first: z
        .number()
        .optional()
        .default(20)
        .describe("Number of items to fetch (default: 20, max: 100)"),
    }),
    outputSchema: z.object({
      items: z.array(
        z.object({
          id: z.string(),
          type: z.enum(["Issue", "PullRequest", "DraftIssue"]),
          title: z.string().optional(),
          url: z.string().optional(),
          state: z.string().optional(),
          number: z.number().optional(),
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
        query ListProjectItems($projectId: ID!, $first: Int!) {
          node(id: $projectId) {
            ... on ProjectV2 {
              items(first: $first) {
                nodes {
                  id
                  content {
                    __typename
                    ... on Issue {
                      title
                      url
                      state
                      number
                    }
                    ... on PullRequest {
                      title
                      url
                      state
                      number
                    }
                    ... on DraftIssue {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        node: {
          items: {
            nodes: Array<{
              id: string;
              content: {
                __typename: string;
                title?: string;
                url?: string;
                state?: string;
                number?: number;
              };
            }>;
          };
        };
      }>(query, {
        projectId: context.projectId,
        first: Math.min(context.first || 20, 100),
      });

      return {
        items: result.node.items.nodes.map((node) => ({
          id: node.id,
          type: node.content.__typename as "Issue" | "PullRequest" | "DraftIssue",
          title: node.content.title,
          url: node.content.url,
          state: node.content.state,
          number: node.content.number,
        })),
      };
    },
  });

export const createAddItemToProject = (env: Env) =>
  createPrivateTool({
    id: "ADD_ITEM_TO_PROJECT",
    description:
      "Add an issue or pull request to a GitHub Project V2 by its content ID (node ID).",
    inputSchema: z.object({
      projectId: z.string().describe("GitHub Project V2 node ID"),
      contentId: z
        .string()
        .describe("Node ID of the issue or pull request to add"),
    }),
    outputSchema: z.object({
      item: z.object({
        id: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const state = env.DECO_REQUEST_CONTEXT?.state;
      if (!state?.githubToken) {
        throw new Error("GitHub token not configured. Please configure your app with a GitHub Personal Access Token.");
      }
      const client = createGitHubClient(state.githubToken);

      const mutation = `
        mutation AddItemToProject($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(
            input: { projectId: $projectId, contentId: $contentId }
          ) {
            item {
              id
            }
          }
        }
      `;

      const result = await client.graphqlQuery<{
        addProjectV2ItemById: {
          item: {
            id: string;
          };
        };
      }>(mutation, {
        projectId: context.projectId,
        contentId: context.contentId,
      });

      return {
        item: result.addProjectV2ItemById.item,
      };
    },
  });

// Export all project tools
export const projectTools = [
  createListGitHubProjects,
  createGetProjectDetails,
  createCreateProject,
  createUpdateProject,
  createDeleteProject,
  createListProjectItems,
  createAddItemToProject,
];

