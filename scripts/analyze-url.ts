import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  AssetEntrySchema,
  TechnologyFindingSchema,
  parsePageEvidence,
} from "../src/types/analysis.js";

const OUTPUT_DIRECTORY = "output";
const PNG_PLACEHOLDER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

export type GeneratedArtifacts = {
  "page-evidence.json": unknown;
  "technology-findings.json": unknown;
  "assets.json": unknown;
  "desktop.png": Buffer;
  "mobile.png": Buffer;
};

export function parseUrlArgument(args: readonly string[]): URL {
  if (args.length !== 1) {
    throw new Error("Expected exactly one URL argument: npm run analyze -- <url>");
  }

  let url: URL;
  try {
    url = new URL(args[0]);
  } catch {
    throw new Error(`Invalid URL: "${args[0]}"`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`URL must use http or https: "${args[0]}"`);
  }

  return url;
}

export function createPlaceholderArtifacts(sourceUrl: string, generatedAt: string): GeneratedArtifacts {
  const pageEvidence = parsePageEvidence({
    schemaVersion: 1,
    sourceUrl,
    capturedAt: generatedAt,
    screenshots: [],
    structure: [],
    colors: [],
    typography: [],
    spacing: [],
    layout: [],
    components: [],
    responsive: [],
    assets: [],
  });

  const technologyFindings = TechnologyFindingSchema.array().parse([
    {
      name: "placeholder",
      status: "unknown",
      confidence: "low",
      evidence: ["No technology extraction has been implemented yet"],
    },
  ]);
  const assets = AssetEntrySchema.array().parse([]);

  return {
    "page-evidence.json": pageEvidence,
    "technology-findings.json": technologyFindings,
    "assets.json": assets,
    "desktop.png": PNG_PLACEHOLDER,
    "mobile.png": PNG_PLACEHOLDER,
  };
}

async function writeArtifacts(outputPath: string, artifacts: GeneratedArtifacts): Promise<void> {
  await writeFile(join(outputPath, "page-evidence.json"), `${JSON.stringify(artifacts["page-evidence.json"], null, 2)}\n`, "utf8");
  await writeFile(
    join(outputPath, "technology-findings.json"),
    `${JSON.stringify(artifacts["technology-findings.json"], null, 2)}\n`,
    "utf8",
  );
  await writeFile(join(outputPath, "assets.json"), `${JSON.stringify(artifacts["assets.json"], null, 2)}\n`, "utf8");
  await writeFile(join(outputPath, "desktop.png"), artifacts["desktop.png"]);
  await writeFile(join(outputPath, "mobile.png"), artifacts["mobile.png"]);
}

export async function generateOutput(
  cwd: string,
  sourceUrl: string,
  generatedAt = new Date().toISOString(),
): Promise<string> {
  const outputPath = join(cwd, OUTPUT_DIRECTORY);
  let artifacts: GeneratedArtifacts;
  try {
    artifacts = createPlaceholderArtifacts(sourceUrl, generatedAt);
  } catch (error) {
    throw new Error(`Unable to validate placeholder artifacts: ${errorMessage(error)}`);
  }

  try {
    await mkdir(outputPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`Output directory already exists: ${outputPath}`);
    }
    throw new Error(`Unable to create output directory "${outputPath}": ${errorMessage(error)}`);
  }

  try {
    await writeArtifacts(outputPath, artifacts);
  } catch (error) {
    await rm(outputPath, { recursive: true, force: true });
    throw new Error(`Unable to write output artifacts in "${outputPath}": ${errorMessage(error)}`);
  }

  return outputPath;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function main(args: readonly string[], cwd = process.cwd()): Promise<void> {
  const url = parseUrlArgument(args);
  const outputPath = await generateOutput(cwd, url.toString());
  console.log(`Generated placeholder analysis in ${outputPath}`);
}

const isEntryPoint = process.argv[1] !== undefined
  && fileURLToPath(import.meta.url) === process.argv[1];

if (isEntryPoint) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(`Error: ${errorMessage(error)}`);
    process.exitCode = 1;
  });
}
