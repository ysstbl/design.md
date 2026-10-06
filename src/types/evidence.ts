import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true });
const httpUrl = z.string().url().refine(
  (value) => {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  },
  { message: "Expected an HTTP or HTTPS URL" },
);

const selector = z.string().min(1);
const pixel = z.number().finite();
const evidenceId = z.string().regex(
  /^E-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}$/,
  "Expected an evidence ID in the form E-CATEGORY-001",
);

export const EvidenceCategorySchema = z.enum([
  "screenshots",
  "structure",
  "colors",
  "typography",
  "spacing",
  "layout",
  "components",
  "assets",
  "responsive",
]);
export type EvidenceCategory = z.infer<typeof EvidenceCategorySchema>;

export const EvidenceCategoryIdSchema = z.enum([
  "E-SCREENSHOTS",
  "E-STRUCTURE-RECORDS",
  "E-COLORS",
  "E-TYPOGRAPHY-RECORDS",
  "E-SPACING-RECORDS",
  "E-LAYOUT-RECORDS",
  "E-COMPONENTS",
  "E-ASSETS",
  "E-RESPONSIVE-CHANGES",
]);
export type EvidenceCategoryId = z.infer<typeof EvidenceCategoryIdSchema>;

export const evidenceCategoryIds: Record<EvidenceCategory, EvidenceCategoryId> = {
  screenshots: "E-SCREENSHOTS",
  structure: "E-STRUCTURE-RECORDS",
  colors: "E-COLORS",
  typography: "E-TYPOGRAPHY-RECORDS",
  spacing: "E-SPACING-RECORDS",
  layout: "E-LAYOUT-RECORDS",
  components: "E-COMPONENTS",
  assets: "E-ASSETS",
  responsive: "E-RESPONSIVE-CHANGES",
};

export const evidenceCategories = [
  { category: "screenshots", name: "Screenshots", id: "E-SCREENSHOTS" },
  { category: "structure", name: "Structure records", id: "E-STRUCTURE-RECORDS" },
  { category: "colors", name: "Colors", id: "E-COLORS" },
  { category: "typography", name: "Typography records", id: "E-TYPOGRAPHY-RECORDS" },
  { category: "spacing", name: "Spacing records", id: "E-SPACING-RECORDS" },
  { category: "layout", name: "Layout records", id: "E-LAYOUT-RECORDS" },
  { category: "components", name: "Components", id: "E-COMPONENTS" },
  { category: "assets", name: "Assets", id: "E-ASSETS" },
  { category: "responsive", name: "Responsive changes", id: "E-RESPONSIVE-CHANGES" },
] as const satisfies ReadonlyArray<{
  category: EvidenceCategory;
  name: string;
  id: EvidenceCategoryId;
}>;

export const ViewportSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  deviceScaleFactor: z.number().positive().optional(),
});
export type Viewport = z.infer<typeof ViewportSchema>;

export const BoundsSchema = z.object({
  x: pixel,
  y: pixel,
  width: pixel.nonnegative(),
  height: pixel.nonnegative(),
});
export type Bounds = z.infer<typeof BoundsSchema>;

export const ScreenshotEvidenceSchema = z.object({
  id: evidenceId,
  viewport: ViewportSchema,
  uri: z.string().min(1),
  fullPage: z.boolean(),
});
export type ScreenshotEvidence = z.infer<typeof ScreenshotEvidenceSchema>;

export const StructureEvidenceSchema = z.object({
  id: evidenceId,
  selector,
  tagName: z.string().min(1),
  role: z.string().min(1).optional(),
  landmark: z.enum(["header", "nav", "main", "aside", "section", "footer"]).optional(),
  bounds: BoundsSchema,
  childCount: z.number().int().nonnegative(),
});
export type StructureEvidence = z.infer<typeof StructureEvidenceSchema>;

export const ColorEvidenceSchema = z.object({
  id: evidenceId,
  selector,
  property: z.enum(["color", "background-color", "border-color", "fill", "stroke"]),
  value: z.string().min(1),
  count: z.number().int().positive().optional(),
});
export type ColorEvidence = z.infer<typeof ColorEvidenceSchema>;

export const TypographyEvidenceSchema = z.object({
  id: evidenceId,
  selector,
  fontFamily: z.string().min(1),
  fontSize: pixel.positive(),
  fontWeight: z.number().int().positive(),
  lineHeight: pixel.positive(),
  letterSpacing: pixel,
  textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
});
export type TypographyEvidence = z.infer<typeof TypographyEvidenceSchema>;

export const SpacingEvidenceSchema = z.object({
  id: evidenceId,
  selector,
  property: z.enum([
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "gap",
  ]),
  value: pixel.nonnegative(),
});
export type SpacingEvidence = z.infer<typeof SpacingEvidenceSchema>;

export const LayoutEvidenceSchema = z.object({
  id: evidenceId,
  selector,
  display: z.enum(["block", "flex", "grid", "inline", "inline-block", "none"]),
  position: z.enum(["static", "relative", "absolute", "fixed", "sticky"]),
  bounds: BoundsSchema,
  columns: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
  gap: pixel.nonnegative().optional(),
  alignment: z
    .object({
      horizontal: z.enum(["start", "center", "end", "stretch", "space-between"]).optional(),
      vertical: z.enum(["start", "center", "end", "stretch"]).optional(),
    })
    .optional(),
});
export type LayoutEvidence = z.infer<typeof LayoutEvidenceSchema>;

export const ComponentEvidenceSchema = z.object({
  id: evidenceId,
  selector,
  kind: z.enum([
    "button",
    "link",
    "input",
    "card",
    "navigation",
    "hero",
    "header",
    "footer",
    "modal",
    "list",
    "form",
    "custom",
  ]),
  bounds: BoundsSchema,
  visible: z.boolean(),
  interactive: z.boolean(),
});
export type ComponentEvidence = z.infer<typeof ComponentEvidenceSchema>;

export const ResponsiveEvidenceSchema = z.object({
  id: evidenceId,
  viewport: ViewportSchema,
  changedSelectors: z.array(selector),
  hiddenSelectors: z.array(selector),
  addedSelectors: z.array(selector),
});
export type ResponsiveEvidence = z.infer<typeof ResponsiveEvidenceSchema>;

export const AssetEvidenceSchema = z.object({
  id: evidenceId,
  url: z.string().url(),
  type: z.enum(["image", "svg", "font", "background", "icon"]),
  format: z.string().min(1).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  selector: selector.optional(),
  decorative: z.boolean().optional(),
});
export type AssetEvidence = z.infer<typeof AssetEvidenceSchema>;

export const PageEvidenceSchema = z
  .object({
    schemaVersion: z.literal(1),
    sourceUrl: httpUrl,
    capturedAt: isoDateTime,
    screenshots: z.array(ScreenshotEvidenceSchema),
    structure: z.array(StructureEvidenceSchema),
    colors: z.array(ColorEvidenceSchema),
    typography: z.array(TypographyEvidenceSchema),
    spacing: z.array(SpacingEvidenceSchema),
    layout: z.array(LayoutEvidenceSchema),
    components: z.array(ComponentEvidenceSchema),
    responsive: z.array(ResponsiveEvidenceSchema),
    assets: z.array(AssetEvidenceSchema),
  })
  .superRefine((page, context) => {
    const collections = [
      "screenshots",
      "structure",
      "colors",
      "typography",
      "spacing",
      "layout",
      "components",
      "responsive",
      "assets",
    ] as const;
    const ids = new Map<string, { collection: string; index: number }>();

    for (const collection of collections) {
      for (const [index, record] of page[collection].entries()) {
        const previous = ids.get(record.id);
        if (previous) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [collection, index, "id"],
            message: `Duplicate evidence id "${record.id}" already used in ${previous.collection}[${previous.index}]`,
          });
        } else {
          ids.set(record.id, { collection, index });
        }
      }
    }
  });
export type PageEvidence = z.infer<typeof PageEvidenceSchema>;

export function createEvidenceId(
  category: EvidenceCategory,
  existingIds: Iterable<string> = [],
): string {
  const prefix = `${evidenceCategoryIds[category]}-`;
  let nextNumber = 1;

  for (const id of existingIds) {
    if (!id.startsWith(prefix)) {
      continue;
    }

    const suffix = Number(id.slice(prefix.length));
    if (Number.isInteger(suffix) && suffix >= nextNumber) {
      nextNumber = suffix + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

export function parsePageEvidence(input: unknown): PageEvidence {
  return PageEvidenceSchema.parse(input);
}
