/**
 * This is where you define your views.
 *
 * Declaring views here will make them available on the user's
 * project when they install your MCP server.
 * 
 * Since we need absolute URLs for now, the app must be deployed to have
 * a app-name.deco.page url to be used here.
 *
 * @see https://docs.deco.page/en/guides/building-views/
 */
import { ExtendedStateSchema } from "./main.ts";
import { Env } from "./main.ts";
import type { CreateMCPServerOptions } from "@deco/workers-runtime/mastra";

export const views: CreateMCPServerOptions<Env, typeof ExtendedStateSchema>["views"] =
  () => [
    {
      title: "Projects Browser",
      icon: "folder_open",
      url: "https://github-projects.deco.page/projects",
    },
    {
      title: "Issues Browser",
      icon: "bug_report",
      url: "https://github-projects.deco.page/issues",
    },
    {
      title: "Tracking Manager",
      icon: "bookmark",
      url: "https://github-projects.deco.page/tracking",
    },
    {
      title: "Tools Inspector",
      icon: "extension",
      url: "https://github-projects.deco.page/tools",
    },
  ];
