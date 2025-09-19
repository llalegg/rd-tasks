import { defineConfig } from "drizzle-kit";

// Set the Neon database URL directly for now
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_QDAz4B6KYZyo@ep-dry-lake-adrd3nf5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
