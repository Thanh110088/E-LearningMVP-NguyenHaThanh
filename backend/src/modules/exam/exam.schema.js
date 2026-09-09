const { z } = require('zod');

const examSchema = z.object({
  title: z.string().min(1, 'Tiêu đề đề thi không được để trống'),
  code: z.string().min(1, 'Mã đề thi không được để trống'),
  description: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  totalPoints: z.coerce.number().optional(),
  passPoints: z.coerce.number().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isLive: z.boolean().optional(),
  pinCode: z.string().optional().nullable(),
  startTime: z.union([z.string(), z.date()]).optional().nullable(),
  endTime: z.union([z.string(), z.date()]).optional().nullable(),
  examPassword: z.string().optional().nullable(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  maxAttempts: z.coerce.number().int().min(0).optional(),
  showAnswerAfter: z.boolean().optional(),
  proctorEnabled: z.boolean().optional(),
  subjectId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional().nullable(),
});

const updateExamSchema = examSchema.partial();

module.exports = {
  examSchema,
  updateExamSchema,
};
