# Analyze CLI Placeholder Pipeline

## Goal

Add the first reliable command-line milestone for `design.md`: accept one
public URL and generate deterministic, schema-valid placeholder artifacts for
downstream development before real browser extraction is implemented.

The CLI is developer-facing. It must establish stable file names and JSON
shapes without fetching the URL, launching a browser, invoking AI services, or
rendering Markdown.

## Command and input contract

The command is:

```bash
npm run analyze -- https://example.com
```

The command requires exactly one positional argument. The argument must parse
as an absolute URL whose protocol is `http:` or `https:`. Missing arguments,
extra arguments, malformed URLs, and unsupported protocols are errors.

The command uses the repository working directory as its base and targets a
fixed `output/` directory. If `output/` already exists, the command fails
without modifying it.

## Generated artifacts

For a valid URL, the command creates:

```text
output/
  page-evidence.json
  technology-findings.json
  assets.json
  desktop.png
  mobile.png
```

`page-evidence.json` is validated with the current
`parsePageEvidence`/`PageEvidenceSchema` contract. Its `sourceUrl` is the
provided URL, its timestamp is the run timestamp, and all evidence collections
are empty placeholders.

`technology-findings.json` is a JSON array validated against
`TechnologyFindingSchema.array()`. It contains a minimal explicit placeholder
finding rather than fabricated technology claims.

`assets.json` is a JSON array validated against
`AssetEntrySchema.array()` and is empty until asset extraction exists.

`desktop.png` and `mobile.png` are deterministic 1×1 transparent PNG
placeholders. They exist to preserve the initial output filename contract and
are not presented as captured screenshots.

All JSON is written with stable formatting and a trailing newline. A single
timestamp is used for all generated timestamp fields in one run.

## Implementation structure

Add `scripts/analyze-url.ts` as the executable entry point. Keep argument
parsing, URL validation, placeholder construction, artifact validation, and
filesystem orchestration as small local functions so each responsibility can
be tested without network or browser dependencies.

Reuse the existing schemas and parsers from `src/types/index.ts`; do not
duplicate their definitions or broaden them for placeholder generation.
Update `package.json` with an `analyze` script that invokes the TypeScript
entry point using the repository's existing runtime/tooling conventions.

Add focused tests using the repository's available test conventions. If no
test runner exists yet, keep the implementation type-safe and add a minimal
test runner dependency only when required to execute the requested tests.

## Error handling and atomicity

Errors are written to stderr with a concise explanation and the command exits
non-zero. Messages must identify the relevant argument, artifact, or path.
Zod failures must include the artifact name and validation details.

The command constructs and validates every placeholder before creating
`output/`. It creates the directory exclusively. If a later artifact write
fails, it removes only the `output/` directory created by this invocation.
Pre-existing directories are never removed or changed.

## Verification

Tests must cover:

- successful generation from a valid HTTP URL;
- successful generation from a valid HTTPS URL;
- missing and extra arguments;
- malformed URLs and non-HTTP(S) schemes;
- refusal when `output/` already exists;
- schema parsing of each generated JSON artifact;
- no partial output when validation or writing fails.

Run `npm run typecheck` and the focused CLI tests. The implementation must not
introduce network access or browser dependencies.

## Out of scope

- Fetching or validating remote responses.
- SSRF protection beyond the CLI's syntactic HTTP/HTTPS URL requirement.
- Playwright or Chromium integration.
- Real screenshots, evidence extraction, asset discovery, or technology
  fingerprinting.
- AI interpretation, Markdown generation, web UI, persistence, and production
  infrastructure.
