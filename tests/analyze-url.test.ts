import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createPlaceholderArtifacts,
  generateOutput,
  parseUrlArgument,
} from "../scripts/analyze-url.js";
import { parsePageEvidence, AssetEntrySchema, TechnologyFindingSchema } from "../src/types/analysis.js";

describe("analyze URL CLI", () => {
  it("accepts only absolute HTTP and HTTPS URLs", () => {
    assert.equal(parseUrlArgument(["http://example.com"]).protocol, "http:");
    assert.equal(parseUrlArgument(["https://example.com/path"]).protocol, "https:");
    assert.throws(() => parseUrlArgument([]), /exactly one URL/);
    assert.throws(() => parseUrlArgument(["https://example.com", "extra"]), /exactly one URL/);
    assert.throws(() => parseUrlArgument(["example.com"]), /Invalid URL/);
    assert.throws(() => parseUrlArgument(["ftp://example.com"]), /must use http or https/);
  });

  it("creates schema-valid placeholder artifacts", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "design-md-analyze-"));
    try {
      const outputPath = await generateOutput(cwd, "https://example.com", "2026-10-07T13:00:00.000Z");
      const pageEvidence = JSON.parse(await readFile(join(outputPath, "page-evidence.json"), "utf8"));
      const findings = JSON.parse(await readFile(join(outputPath, "technology-findings.json"), "utf8"));
      const assets = JSON.parse(await readFile(join(outputPath, "assets.json"), "utf8"));

      assert.equal(parsePageEvidence(pageEvidence).sourceUrl, "https://example.com");
      assert.equal(TechnologyFindingSchema.array().parse(findings).length, 1);
      assert.deepEqual(AssetEntrySchema.array().parse(assets), []);
      assert.ok((await readFile(join(outputPath, "desktop.png"))).length > 0);
      assert.ok((await readFile(join(outputPath, "mobile.png"))).length > 0);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("refuses to modify an existing output directory", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "design-md-analyze-"));
    const outputPath = join(cwd, "output");
    await mkdir(outputPath);
    await writeFile(join(outputPath, "sentinel"), "keep");
    try {
      await assert.rejects(generateOutput(cwd, "https://example.com"), /already exists/);
      assert.equal(await readFile(join(outputPath, "sentinel"), "utf8"), "keep");
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("validates placeholders before filesystem creation", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "design-md-analyze-"));
    try {
      const artifacts = createPlaceholderArtifacts("https://example.com", "2026-10-07T13:00:00.000Z");
      assert.equal((artifacts["page-evidence.json"] as { schemaVersion: number }).schemaVersion, 1);
      await assert.rejects(
        generateOutput(cwd, "https://example.com", "not-a-date"),
        /Unable to validate placeholder artifacts/,
      );
      await assert.rejects(readFile(join(cwd, "output", "page-evidence.json")));
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
