const { z } = require('zod');

const optionSchema = z.object({
  content: z.string().min(1, 'Nội dung đáp án không được để trống'),
  isCorrect: z.boolean().optional().default(false),
});

const questionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE']).optional(),
  points: z.coerce.number().positive().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  explanation: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  examId: z.string().uuid().optional().nullable(),
  subjectId: z.string().uuid().optional().nullable(),
  workspaceId: z.string().uuid().optional().nullable(),
  options: z.array(optionSchema).min(2, 'Câu hỏi phải có ít nhất 2 lựa chọn'),
});

const updateQuestionSchema = questionSchema.partial().extend({
  options: z.array(optionSchema).min(2).optional(),
});

module.exports = {
  questionSchema,
  updateQuestionSchema,
};
