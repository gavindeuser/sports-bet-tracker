import fs from "node:fs";
import path from "node:path";

function readEnvFileValue(key) {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const envContents = fs.readFileSync(envPath, "utf8");
  for (const line of envContents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const prefix = `${key}=`;
    if (trimmed.startsWith(prefix)) {
      const rawValue = trimmed.slice(prefix.length).trim();
      return rawValue.replace(/^['"]|['"]$/g, "");
    }
  }

  return undefined;
}

function detectProvider() {
  const explicitProvider = process.env.PRISMA_DB_PROVIDER;
  if (explicitProvider === "postgresql" || explicitProvider === "sqlite") {
    return explicitProvider;
  }

  const databaseUrl = process.env.DATABASE_URL ?? readEnvFileValue("DATABASE_URL") ?? "";
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    return "postgresql";
  }

  return "sqlite";
}

const provider = detectProvider();
const sourceFile =
  provider === "postgresql"
    ? path.join(process.cwd(), "prisma", "schema.postgres.prisma")
    : path.join(process.cwd(), "prisma", "schema.sqlite.prisma");
const targetFile = path.join(process.cwd(), "prisma", "schema.prisma");

fs.copyFileSync(sourceFile, targetFile);
console.log(`Using Prisma schema for ${provider}: ${path.basename(sourceFile)} -> prisma/schema.prisma`);
