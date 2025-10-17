/**
 * This file is used to define the schema for the database.
 *
 * After making changes to this file, run `npm run db:generate` to generate the migration file.
 * Then, by just using the app, the migration is lazily ensured at runtime.
 */
import { integer, sqliteTable, text } from "@deco/workers-runtime/drizzle";

/**
 * Tracked repositories table - stores repositories that are being monitored
 */
export const trackedRepositoriesTable = sqliteTable("tracked_repositories", {
  id: integer("id").primaryKey(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Tracked projects table - stores GitHub Projects V2 that are being monitored
 */
export const trackedProjectsTable = sqliteTable("tracked_projects", {
  id: integer("id").primaryKey(),
  projectId: text("project_id").notNull().unique(), // GitHub's project ID (e.g., "PVT_kwDOBj_xvs4A_o2I")
  title: text("title").notNull(),
  organizationLogin: text("organization_login").notNull(),
  isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
