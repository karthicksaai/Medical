import { sql } from "drizzle-orm";
import { integer, varchar, pgTable, serial, text } from "drizzle-orm/pg-core";

// users schema
export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull(),
  age: integer("age").notNull(),
  location: varchar("location").notNull(),
  folders: text("folders")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  treatmentCounts: integer("treatment_counts").notNull(),
  folder: text("folder")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  createdBy: varchar("created_by").notNull(),
});

// records schema
export const Records = pgTable("records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    //.notNull()
    ,
  name: varchar("name"),
  patientId: integer("patient_id").references(() => Patients.id),
  recordName: varchar("record_name")
  //.notNull()
  ,
  analysisResult: varchar("analysis_result")
  //.notNull()
  ,
  kanbanRecords: varchar("kanban_records")
  //.notNull()
  ,
  createdBy: varchar("created_by")
  //.notNull(),
  ,
});

// patients schema
export const Patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  age: integer("age")
  //.notNull(),
  ,
  gender: varchar("gender")
  //.notNull(),
  ,
  location: varchar("location")
  //.notNull(),
  ,
  medicalHistory: text("medical_history")
  //.notNull(),
  ,
  allergies: text("allergies").array()//.notNull()
  .default(sql`ARRAY[]::text[]`),
  treatmentCounts: integer("treatment_counts")
  //.notNull(),
  ,
  createdBy: varchar("created_by")
  //.notNull(),
});
