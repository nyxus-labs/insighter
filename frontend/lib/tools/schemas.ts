import { z } from 'zod';

// --- Base Message Schema ---
export const BaseMessageSchema = z.object({
  id: z.string().uuid(),
  sourceToolId: z.string(),
  targetToolId: z.string().optional(),
  timestamp: z.number(),
  type: z.string(),
  payload: z.any(), // Refined in specific schemas
  retryCount: z.number().default(0),
});

// --- Specific Event Schemas ---

export const DataLoadSchema = BaseMessageSchema.extend({
  type: z.literal('DATA_LOAD'),
  payload: z.object({
    datasetId: z.string(),
    url: z.string().url().optional(),
    format: z.enum(['csv', 'json', 'parquet']),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const CellExecutionSchema = BaseMessageSchema.extend({
  type: z.literal('CELL_EXECUTED'),
  payload: z.object({
    cellId: z.string(),
    status: z.enum(['success', 'error', 'running']),
    codeLength: z.number(),
    error: z.string().optional(),
    executionTimeMs: z.number().optional(),
  }),
});

export const ModelExportSchema = BaseMessageSchema.extend({
  type: z.literal('MODEL_EXPORT'),
  payload: z.object({
    modelId: z.string(),
    framework: z.enum(['sklearn', 'pytorch', 'tensorflow']),
    accuracy: z.number().min(0).max(1),
    location: z.string(),
  }),
});

// --- Registry of Valid Schemas ---
export const MessageSchemas = {
  'DATA_LOAD': DataLoadSchema,
  'CELL_EXECUTED': CellExecutionSchema,
  'MODEL_EXPORT': ModelExportSchema,
};

export type ToolMessage = z.infer<typeof BaseMessageSchema>;
export type DataLoadMessage = z.infer<typeof DataLoadSchema>;
