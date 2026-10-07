import { z } from "zod";

import { PageEvidenceSchema } from "./evidence.js";

export const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const ConfidenceSchema = ConfidenceLevelSchema;
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const EvidenceReferenceSchema = z.string().min(1);
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;

export const TechnologyFindingSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  status: z.enum(["verified", "likely", "possible", "unknown"]),
  confidence: ConfidenceSchema,
  evidence: z.array(EvidenceReferenceSchema),
  version: z.string().min(1).optional(),
  recommendation: z.string().min(1).optional(),
});
export type TechnologyFinding = z.infer<typeof TechnologyFindingSchema>;

export const AssetEntrySchema = z.object({
  id: z.string().min(1).optional(),
  originalUrl: z.string().url(),
  previewUrl: z.string().url().optional(),
  dimensions: z.object({
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }).optional(),
  format: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  type: z.enum(["image", "logo", "svg", "font", "background", "favicon", "social-preview", "icon"]),
  decorative: z.boolean().optional(),
  sourceContext: z.string().min(1).optional(),
});
export type AssetEntry = z.infer<typeof AssetEntrySchema>;

export const RecommendationSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  confidence: ConfidenceSchema,
  evidence: z.array(EvidenceReferenceSchema),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const AiOutputSchema = z.object({
  schemaVersion: z.literal(1),
  model: z.string().min(1),
  generatedAt: z.string().datetime({ offset: true }),
  summary: z.string().min(1).optional(),
  technologyFindings: z.array(TechnologyFindingSchema),
  assetEntries: z.array(AssetEntrySchema),
  observedFacts: z.array(z.string().min(1)),
  inferredDesignSystem: z.array(z.string().min(1)),
  reusablePatterns: z.array(z.string().min(1)),
  recommendations: z.array(RecommendationSchema),
});
export type AiOutput = z.infer<typeof AiOutputSchema>;

export const FinalDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1),
  sourceUrl: z.string().url(),
  generatedAt: z.string().datetime({ offset: true }),
  overview: z.string().min(1),
  pageEvidence: PageEvidenceSchema,
  technologyFindings: z.array(TechnologyFindingSchema),
  assetEntries: z.array(AssetEntrySchema),
  observedFacts: z.array(z.string().min(1)),
  inferredDesignSystem: z.array(z.string().min(1)),
  implementationGuidance: z.array(z.string().min(1)),
  sections: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    confidence: ConfidenceSchema,
    evidence: z.array(EvidenceReferenceSchema),
  })),
});
export type FinalDocument = z.infer<typeof FinalDocumentSchema>;

export function parseAiOutput(input: unknown): AiOutput {
  return AiOutputSchema.parse(input);
}

export function parseFinalDocument(input: unknown): FinalDocument {
  return FinalDocumentSchema.parse(input);
}