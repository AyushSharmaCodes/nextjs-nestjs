// src/config/env.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// RULE: This is the ONLY file in the entire application allowed to read
//       process.env directly. All other files import from this module.
// ─────────────────────────────────────────────────────────────────────────────

export type AppConfig = {
  app: {
    nodeEnv: "development" | "production" | "test";
    port: number;
    isDev: boolean;
    isProd: boolean;
  };
  database: {
    url: string;
  };
  nvidia: {
    nimBaseUrl: string;
    apiKey: string;
    defaultModel: string;
    maxTokens: number;
    timeoutMs: number;
    temperature: number;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[config/env.config.ts] Missing required env variable: "${key}". ` +
        "Ensure it is set in your .env file or deployment environment."
    );
  }
  return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
  return (process.env[key] ?? fallback).trim();
}

function requireInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`[config/env.config.ts] "${key}" must be an integer, got: "${raw}"`);
  }
  return parsed;
}

function requireFloat(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) {
    throw new Error(`[config/env.config.ts] "${key}" must be a float, got: "${raw}"`);
  }
  return parsed;
}

function validateEnum<T extends string>(
  key: string,
  value: string,
  allowed: readonly T[]
): T {
  if (!allowed.includes(value as T)) {
    throw new Error(
      `[config/env.config.ts] Invalid value for "${key}": "${value}". ` +
        `Allowed: ${allowed.join(", ")}`
    );
  }
  return value as T;
}

// ─── Build config (runs once at module load — fails fast on missing vars) ────

const nodeEnvRaw = optionalEnv("NODE_ENV", "development");

export const appConfig: AppConfig = Object.freeze({
  app: {
    nodeEnv: validateEnum("NODE_ENV", nodeEnvRaw, [
      "development",
      "production",
      "test",
    ] as const),
    port: requireInt("PORT", 3000),
    get isDev() {
      return nodeEnvRaw === "development";
    },
    get isProd() {
      return nodeEnvRaw === "production";
    },
  },

  database: {
    url: requireEnv("DATABASE_URL"),
  },

  nvidia: {
    nimBaseUrl: optionalEnv(
      "NVIDIA_NIM_BASE_URL",
      "https://integrate.api.nvidia.com/v1"
    ),
    apiKey:       requireEnv("NVIDIA_NIM_API_KEY"),
    defaultModel: optionalEnv(
      "NVIDIA_NIM_DEFAULT_MODEL",
      "meta/llama-3.1-8b-instruct"
    ),
    maxTokens:   requireInt("NVIDIA_NIM_MAX_TOKENS", 2048),
    timeoutMs:   requireInt("NVIDIA_NIM_TIMEOUT_MS", 30_000),
    temperature: requireFloat("NVIDIA_NIM_TEMPERATURE", 0.7),
  },
});
