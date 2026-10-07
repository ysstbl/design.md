# design.md

## Placeholder analysis CLI

Generate schema-valid placeholder artifacts for a URL:

```bash
npm run analyze -- https://example.com
```

The command creates `output/` with `page-evidence.json`,
`technology-findings.json`, `assets.json`, and transparent placeholder
`desktop.png`/`mobile.png` files. It does not fetch the URL or overwrite an
existing output directory.