const { z } = require('zod');

const startExamSchema = z.object({
  password: z.string().optional(),
});

const answersSchema = z.object({
  answers: z.array(z.any()).optional(),
  tabSwitchCount: z.coerce.number().int().min(0).optional(),
  violations: z.any().optional(),
});

module.exports = {
  startExamSchema,
  answersSchema,
};
