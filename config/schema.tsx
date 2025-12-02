import { integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer(),
});

export const SessionChatTable = pgTable("sessionChatTable", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar().notNull(),
  notes: text(),
  // Map to existing DB column "SelectedDoctor"
  selectedDoctor: json("SelectedDoctor"),
  conversation: json(),
  report: json(),
  // Use default column name "createdBy" (this exists in your DB)
  createdBy: varchar().references(() => usersTable.email),
  createdOn: varchar(),
});

