/**
 * Static TypeScript safety audit.
 * Scans source files and prints a categorised violation report.
 * No runtime dependencies — pure fs + regex.
 */

import fs   from "fs";
import path from "path";

type Category =
  | "EXPLICIT_ANY"
  | "TYPE_ASSERTION"
  | "NON_NULL_ASSERTION"
  | "IMPLICIT_RETURN"
  | "UNTYPED_CATCH"
  | "FLOATING_PROMISE"
  | "UNSAFE_INDEX_ACCESS"
  | "DIRECT_PROCESS_ENV"
  | "DISABLED_TS_COMMENT"
  | "OBJECT_SHORTHAND_CAST";

type Violation = {
  file:     string;
  line:     number;
  category: Category;
  snippet:  string;
};

const RULES: Array<{
  category: Category;
  pattern:  RegExp;
  ignore?:  RegExp;
}> = [
  {
    category: "EXPLICIT_ANY",
    pattern:  /:\s*any\b|as\s+any\b/,
    ignore:   /\/\/ ts-audit-ignore/,
  },
  {
    category: "TYPE_ASSERTION",
    pattern:  /\bas\s+(?!any\b|unknown\b|const\b|keyof\b)\w/,
    ignore:   /\/\/ ts-audit-ignore/,
  },
  {
    category: "NON_NULL_ASSERTION",
    pattern:  /\w!\./,
    ignore:   /\/\/ ts-audit-ignore/,
  },
  {
    category: "UNTYPED_CATCH",
    pattern:  /catch\s*\(\s*\w+\s*\)(?!\s*:\s*unknown)/,
  },
  {
    category: "DISABLED_TS_COMMENT",
    pattern:  /@ts-ignore|@ts-nocheck/,
  },
  {
    category: "DIRECT_PROCESS_ENV",
    pattern:  /process\.env\.\w+/,
    ignore:   /config\/env|core\/env|\.env\.config/,
  },
  {
    category: "OBJECT_SHORTHAND_CAST",
    pattern:  /\{\s*\}\s+as\s+\w/,
  },
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Directory does not exist: ${dir}`);
    return [];
  }
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (["node_modules", ".next", "dist", "build", ".git"].includes(entry)) continue;
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(full) && !full.endsWith(".spec.ts") && !full.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

function auditFile(file: string): Violation[] {
  const lines  = fs.readFileSync(file, "utf-8").split("\n");
  const result: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        if (line.includes("ts-audit-ignore")) continue;
        if (rule.ignore?.test(file + line)) continue;
        result.push({
          file,
          line:     i + 1,
          category: rule.category,
          snippet:  line.trim().slice(0, 100),
        });
      }
    }
  }
  return result;
}

const args = process.argv.slice(2);
const dirs = args.length > 0 ? args : ["./merigaumata/src", "./backend-microservices/src"];
const files = dirs.flatMap(walk);
const all:  Violation[] = [];

for (const file of files) {
  all.push(...auditFile(file));
}

const byCategory = {} as Record<Category, Violation[]>;
for (const v of all) {
  (byCategory[v.category] ??= []).push(v);
}

console.log("\n╔══════════════════════════════════════════════════╗");
console.log("║        TYPESCRIPT SAFETY AUDIT REPORT           ║");
console.log("╚══════════════════════════════════════════════════╝\n");
console.log(`  Files scanned : ${files.length}`);
console.log(`  Total issues  : ${all.length}\n`);

const severity: Record<Category, "🔴 CRITICAL" | "🟡 WARNING"> = {
  EXPLICIT_ANY:          "🔴 CRITICAL",
  DISABLED_TS_COMMENT:   "🔴 CRITICAL",
  DIRECT_PROCESS_ENV:    "🔴 CRITICAL",
  UNTYPED_CATCH:         "🔴 CRITICAL",
  TYPE_ASSERTION:        "🟡 WARNING",
  NON_NULL_ASSERTION:    "🟡 WARNING",
  IMPLICIT_RETURN:       "🟡 WARNING",
  FLOATING_PROMISE:      "🟡 WARNING",
  UNSAFE_INDEX_ACCESS:   "🟡 WARNING",
  OBJECT_SHORTHAND_CAST: "🟡 WARNING",
};

for (const [cat, violations] of Object.entries(byCategory)) {
  const sev = severity[cat as Category];
  console.log(`${sev}  ${cat}  (${violations.length} occurrences)`);
  for (const v of violations) {
    console.log(`    ${v.file}:${v.line}`);
    console.log(`    → ${v.snippet}`);
  }
  console.log();
}

const criticals = all.filter((v) => severity[v.category] === "🔴 CRITICAL");
if (criticals.length > 0) {
  console.log(`❌  ${criticals.length} critical violation(s). Fix before merging.\n`);
  process.exit(1);
}
console.log("✅  No critical violations found.\n");
