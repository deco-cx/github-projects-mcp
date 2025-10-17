/**
 * Metadata tools for introspection and tool discovery.
 *
 * This file contains tools that provide information about other tools
 * in the system, useful for building introspection UIs.
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { projectTools } from "./projects.ts";
import { issueTools } from "./issues.ts";
import { trackingTools } from "./tracking.ts";
import { userTools } from "./user.ts";

export const createGetToolMetadata = (env: Env) =>
  createPrivateTool({
    id: "GET_TOOL_METADATA",
    description:
      "Get metadata about all available tools including their IDs, descriptions, and schemas. Useful for building tool introspection UIs.",
    inputSchema: z.object({
      category: z
        .enum(["all", "projects", "issues", "tracking", "user", "metadata"])
        .optional()
        .default("all")
        .describe("Filter tools by category (default: all)"),
    }),
    outputSchema: z.object({
      tools: z.array(
        z.object({
          id: z.string(),
          description: z.string(),
          category: z.string(),
          inputSchema: z.any(),
          outputSchema: z.any(),
        })
      ),
    }),
    execute: async ({ context }) => {
      // Collect all tool creators
      const allToolCategories = [
        { category: "projects", tools: projectTools },
        { category: "issues", tools: issueTools },
        { category: "tracking", tools: trackingTools },
        { category: "user", tools: userTools },
        { category: "metadata", tools: [createGetToolMetadata] },
      ];

      // Filter by category if specified
      const selectedCategories =
        context.category === "all"
          ? allToolCategories
          : allToolCategories.filter((c) => c.category === context.category);

      const toolMetadata: Array<{
        id: string;
        description: string;
        category: string;
        inputSchema: any;
        outputSchema: any;
      }> = [];

      // Extract metadata from each tool
      for (const { category, tools } of selectedCategories) {
        for (const createTool of tools) {
          try {
            const tool = createTool(env);

            toolMetadata.push({
              id: tool.id,
              description: tool.description || "No description available",
              category,
              inputSchema: tool.inputSchema
                ? (tool.inputSchema as any)._def
                : null,
              outputSchema: tool.outputSchema
                ? (tool.outputSchema as any)._def
                : null,
            });
          } catch (error) {
            console.error(`Error extracting metadata for tool in ${category}:`, error);
          }
        }
      }

      return {
        tools: toolMetadata,
      };
    },
  });

export const metadataTools = [createGetToolMetadata];

