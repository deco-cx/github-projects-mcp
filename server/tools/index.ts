/**
 * Central export point for all tools organized by domain.
 *
 * This file aggregates all tools from different domains into a single
 * export, making it easy to import all tools in main.ts while keeping
 * the domain separation.
 */
import { projectTools } from "./projects.ts";
import { issueTools } from "./issues.ts";
import { trackingTools } from "./tracking.ts";
import { metadataTools } from "./metadata.ts";
import { userTools } from "./user.ts";

// Export all tools from all domains
export const tools = [
  ...projectTools,
  ...issueTools,
  ...trackingTools,
  ...metadataTools,
  ...userTools,
];

// Re-export domain-specific tools for direct access if needed
export { projectTools } from "./projects.ts";
export { issueTools } from "./issues.ts";
export { trackingTools } from "./tracking.ts";
export { metadataTools } from "./metadata.ts";
export { userTools } from "./user.ts";
