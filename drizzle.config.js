export default {
    dialect: "postgresql",
    schema: "./src/utils/schema.jsx",
    out: "./drizzle",
    dbCredentials: {
      url: "postgresql://neondb_owner:6kpD1nCfQHjR@ep-withered-mode-a1aum754.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
      connectionString:
        "postgresql://neondb_owner:6kpD1nCfQHjR@ep-withered-mode-a1aum754.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"},
};