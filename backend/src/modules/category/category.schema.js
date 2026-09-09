const { z } = require('zod');

const subjectSchema = z.object({
  name: z.string().min(2, 'Tên môn học phải từ 2 ký tự'),
  code: z.string().min(1, 'Mã môn học là bắt buộc').max(20),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

const updateSubjectSchema = subjectSchema.partial();

const gradeSchema = z.object({
  name: z.string().min(2, 'Tên khối lớp phải từ 2 ký tự'),
  code: z.string().min(1, 'Mã khối lớp là bắt buộc').max(20),
  description: z.string().optional().nullable(),
  level: z.coerce.number().int().min(1).optional(),
});

const updateGradeSchema = gradeSchema.partial();

module.exports = {
  subjectSchema,
  updateSubjectSchema,
  gradeSchema,
  updateGradeSchema,
};
