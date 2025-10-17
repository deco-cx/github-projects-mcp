/**
 * Repository and Project tracking tools.
 *
 * This file contains all tools related to tracking repositories and projects:
 * - Adding and removing tracked repositories
 * - Adding and removing tracked projects
 * - Listing tracked items
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { orm } from "@deco/workers-runtime/drizzle";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import {
  trackedRepositoriesTable,
  trackedProjectsTable,
} from "../schema.ts";

const { eq } = orm;

export const createAddTrackedRepository = (env: Env) =>
  createPrivateTool({
    id: "ADD_TRACKED_REPOSITORY",
    description:
      "Add a GitHub repository to the tracked list for monitoring. Prevents duplicates.",
    inputSchema: z.object({
      owner: z.string().describe("Repository owner (user or organization)"),
      name: z.string().describe("Repository name"),
    }),
    outputSchema: z.object({
      repository: z.object({
        id: z.number(),
        owner: z.string(),
        name: z.string(),
        isActive: z.boolean(),
        createdAt: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      // Check if already exists
      const existing = await db
        .select()
        .from(trackedRepositoriesTable)
        .where(eq(trackedRepositoriesTable.owner, context.owner))
        .limit(1);

      const matchingRepo = existing.find((r) => r.name === context.name);

      if (matchingRepo) {
        // If exists but inactive, reactivate it
        if (matchingRepo.isActive === 0) {
          const updated = await db
            .update(trackedRepositoriesTable)
            .set({ isActive: 1 })
            .where(eq(trackedRepositoriesTable.id, matchingRepo.id))
            .returning();

          return {
            repository: {
              id: updated[0].id,
              owner: updated[0].owner,
              name: updated[0].name,
              isActive: updated[0].isActive === 1,
              createdAt: updated[0].createdAt.toISOString(),
            },
          };
        }

        // Already active, return existing
        return {
          repository: {
            id: matchingRepo.id,
            owner: matchingRepo.owner,
            name: matchingRepo.name,
            isActive: matchingRepo.isActive === 1,
            createdAt: matchingRepo.createdAt.toISOString(),
          },
        };
      }

      // Create new tracked repository
      const inserted = await db
        .insert(trackedRepositoriesTable)
        .values({
          owner: context.owner,
          name: context.name,
          isActive: 1,
        })
        .returning();

      return {
        repository: {
          id: inserted[0].id,
          owner: inserted[0].owner,
          name: inserted[0].name,
          isActive: inserted[0].isActive === 1,
          createdAt: inserted[0].createdAt.toISOString(),
        },
      };
    },
  });

export const createListTrackedRepositories = (env: Env) =>
  createPrivateTool({
    id: "LIST_TRACKED_REPOSITORIES",
    description:
      "List all tracked GitHub repositories, optionally filtering to active only.",
    inputSchema: z.object({
      activeOnly: z
        .boolean()
        .optional()
        .default(true)
        .describe("Only return active repositories (default: true)"),
    }),
    outputSchema: z.object({
      repositories: z.array(
        z.object({
          id: z.number(),
          owner: z.string(),
          name: z.string(),
          isActive: z.boolean(),
          createdAt: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      const repositories = context.activeOnly
        ? await db
            .select()
            .from(trackedRepositoriesTable)
            .where(eq(trackedRepositoriesTable.isActive, 1))
        : await db.select().from(trackedRepositoriesTable);

      return {
        repositories: repositories.map((repo) => ({
          id: repo.id,
          owner: repo.owner,
          name: repo.name,
          isActive: repo.isActive === 1,
          createdAt: repo.createdAt.toISOString(),
        })),
      };
    },
  });

export const createRemoveTrackedRepository = (env: Env) =>
  createPrivateTool({
    id: "REMOVE_TRACKED_REPOSITORY",
    description:
      "Remove a tracked GitHub repository by marking it as inactive or deleting it.",
    inputSchema: z.object({
      id: z.number().describe("Tracked repository ID"),
      hardDelete: z
        .boolean()
        .optional()
        .default(false)
        .describe("Permanently delete instead of deactivating (default: false)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      deletedId: z.number(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      // Check if exists
      const existing = await db
        .select()
        .from(trackedRepositoriesTable)
        .where(eq(trackedRepositoriesTable.id, context.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error(`Tracked repository with ID ${context.id} not found`);
      }

      if (context.hardDelete) {
        // Permanently delete
        await db
          .delete(trackedRepositoriesTable)
          .where(eq(trackedRepositoriesTable.id, context.id));
      } else {
        // Soft delete (mark as inactive)
        await db
          .update(trackedRepositoriesTable)
          .set({ isActive: 0 })
          .where(eq(trackedRepositoriesTable.id, context.id));
      }

      return {
        success: true,
        deletedId: context.id,
      };
    },
  });

export const createAddTrackedProject = (env: Env) =>
  createPrivateTool({
    id: "ADD_TRACKED_PROJECT",
    description:
      "Add a GitHub Project V2 to the tracked list for monitoring. Prevents duplicates.",
    inputSchema: z.object({
      projectId: z
        .string()
        .describe("GitHub Project V2 node ID (e.g., 'PVT_kwDOBj_xvs4A_o2I')"),
      title: z.string().describe("Project title"),
      organizationLogin: z
        .string()
        .describe("Organization login (e.g., 'deco-cx')"),
    }),
    outputSchema: z.object({
      project: z.object({
        id: z.number(),
        projectId: z.string(),
        title: z.string(),
        organizationLogin: z.string(),
        isActive: z.boolean(),
        createdAt: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      // Check if already exists
      const existing = await db
        .select()
        .from(trackedProjectsTable)
        .where(eq(trackedProjectsTable.projectId, context.projectId))
        .limit(1);

      if (existing.length > 0) {
        const project = existing[0];

        // If exists but inactive, reactivate it
        if (project.isActive === 0) {
          const updated = await db
            .update(trackedProjectsTable)
            .set({ isActive: 1, title: context.title })
            .where(eq(trackedProjectsTable.id, project.id))
            .returning();

          return {
            project: {
              id: updated[0].id,
              projectId: updated[0].projectId,
              title: updated[0].title,
              organizationLogin: updated[0].organizationLogin,
              isActive: updated[0].isActive === 1,
              createdAt: updated[0].createdAt.toISOString(),
            },
          };
        }

        // Already active, return existing (update title in case it changed)
        const updated = await db
          .update(trackedProjectsTable)
          .set({ title: context.title })
          .where(eq(trackedProjectsTable.id, project.id))
          .returning();

        return {
          project: {
            id: updated[0].id,
            projectId: updated[0].projectId,
            title: updated[0].title,
            organizationLogin: updated[0].organizationLogin,
            isActive: updated[0].isActive === 1,
            createdAt: updated[0].createdAt.toISOString(),
          },
        };
      }

      // Create new tracked project
      const inserted = await db
        .insert(trackedProjectsTable)
        .values({
          projectId: context.projectId,
          title: context.title,
          organizationLogin: context.organizationLogin,
          isActive: 1,
        })
        .returning();

      return {
        project: {
          id: inserted[0].id,
          projectId: inserted[0].projectId,
          title: inserted[0].title,
          organizationLogin: inserted[0].organizationLogin,
          isActive: inserted[0].isActive === 1,
          createdAt: inserted[0].createdAt.toISOString(),
        },
      };
    },
  });

export const createListTrackedProjects = (env: Env) =>
  createPrivateTool({
    id: "LIST_TRACKED_PROJECTS",
    description:
      "List all tracked GitHub Projects V2, optionally filtering to active only.",
    inputSchema: z.object({
      activeOnly: z
        .boolean()
        .optional()
        .default(true)
        .describe("Only return active projects (default: true)"),
    }),
    outputSchema: z.object({
      projects: z.array(
        z.object({
          id: z.number(),
          projectId: z.string(),
          title: z.string(),
          organizationLogin: z.string(),
          isActive: z.boolean(),
          createdAt: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      const projects = context.activeOnly
        ? await db
            .select()
            .from(trackedProjectsTable)
            .where(eq(trackedProjectsTable.isActive, 1))
        : await db.select().from(trackedProjectsTable);

      return {
        projects: projects.map((project) => ({
          id: project.id,
          projectId: project.projectId,
          title: project.title,
          organizationLogin: project.organizationLogin,
          isActive: project.isActive === 1,
          createdAt: project.createdAt.toISOString(),
        })),
      };
    },
  });

export const createRemoveTrackedProject = (env: Env) =>
  createPrivateTool({
    id: "REMOVE_TRACKED_PROJECT",
    description:
      "Remove a tracked GitHub Project V2 by marking it as inactive or deleting it.",
    inputSchema: z.object({
      id: z.number().describe("Tracked project ID"),
      hardDelete: z
        .boolean()
        .optional()
        .default(false)
        .describe("Permanently delete instead of deactivating (default: false)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      deletedId: z.number(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      // Check if exists
      const existing = await db
        .select()
        .from(trackedProjectsTable)
        .where(eq(trackedProjectsTable.id, context.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error(`Tracked project with ID ${context.id} not found`);
      }

      if (context.hardDelete) {
        // Permanently delete
        await db
          .delete(trackedProjectsTable)
          .where(eq(trackedProjectsTable.id, context.id));
      } else {
        // Soft delete (mark as inactive)
        await db
          .update(trackedProjectsTable)
          .set({ isActive: 0 })
          .where(eq(trackedProjectsTable.id, context.id));
      }

      return {
        success: true,
        deletedId: context.id,
      };
    },
  });

// Export all tracking tools
export const trackingTools = [
  createAddTrackedRepository,
  createListTrackedRepositories,
  createRemoveTrackedRepository,
  createAddTrackedProject,
  createListTrackedProjects,
  createRemoveTrackedProject,
];

