import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

/**
 * Drizzle ORM PostgreSQL table definition for nodes.
 */
export const nodesTable = pgTable(
  "nodes",
  {
    /**
     * Auto-incremented primary identifier for the node.
     */
    id: serial("id").primaryKey(),

    /**
     * Unique node identifier.
     */
    nodeId: varchar("node_id", { length: 255 }).notNull().unique(),
  },
  (self) => [
    index().on(self.nodeId),
  ],
);

/**
 * Drizzle ORM PostgreSQL table definition for links between nodes.
 */
export const linksTable = pgTable(
  "links",
  {
    /**
     * Auto-incremented primary identifier for the link.
     */
    id: serial("id").primaryKey(),

    /**
     * Source node reference (foreign key to nodes.node_id).
     */
    source: varchar("source", { length: 255 })
      .notNull()
      .references(() => nodesTable.nodeId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    /**
     * Target node reference (foreign key to nodes.node_id).
     */
    target: varchar("target", { length: 255 })
      .notNull()
      .references(() => nodesTable.nodeId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    /**
     * Local port of the source node.
     */
    localPort: varchar("local_port", { length: 50 }).notNull(),

    /**
     * Remote port of the target node.
     */
    remotePort: varchar("remote_port", { length: 50 }).notNull(),
  },
  (self) => [
    index().on(self.source),
    index().on(self.target),
  ],
);

/**
 * Relations between nodes and links tables.
 */
export const nodesTableRelations = relations(nodesTable, ({ many }) => ({
  /**
   * One-to-many relationship from `nodes` to outgoing `links`.
   */
  outgoingLinks: many(linksTable, { relationName: "nodes.outgoingLinks" }),

  /**
   * One-to-many relationship from `nodes` to incoming `links`.
   */
  incomingLinks: many(linksTable, { relationName: "nodes.incomingLinks" }),
}));

export const linksTableRelations = relations(linksTable, ({ one }) => ({
  /**
   * Many-to-one relationship from `links` to the source `node`.
   */
  sourceNode: one(nodesTable, {
    fields: [linksTable.source],
    references: [nodesTable.nodeId],
    relationName: "nodes.outgoingLinks",
  }),

  /**
   * Many-to-one relationship from `links` to the target `node`.
   */
  targetNode: one(nodesTable, {
    fields: [linksTable.target],
    references: [nodesTable.nodeId],
    relationName: "nodes.incomingLinks",
  }),
}));

/**
 * Zod schema for inserting nodes.
 */
export const nodeInsertSchema = createInsertSchema(nodesTable, {
  nodeId: (schema) => schema.min(1).max(255),
});

/**
 * Zod schema for inserting links.
 */
export const linkInsertSchema = createInsertSchema(linksTable, {
  localPort: (schema) => schema.min(1).max(50),
  remotePort: (schema) => schema.min(1).max(50),
});