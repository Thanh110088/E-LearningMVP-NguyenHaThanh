const { z } = require('zod');

const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT'], {
    errorMap: () => ({ message: 'Vai trò không hợp lệ' }),
  }),
});

const updateTeacherPlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE'], {
    errorMap: () => ({ message: 'Gói dịch vụ không hợp lệ' }),
  }),
});

module.exports = {
  updateUserRoleSchema,
  updateTeacherPlanSchema,
};
