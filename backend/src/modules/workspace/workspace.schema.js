const { z } = require('zod');

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Tên Workspace không được để trống').max(100),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

const updateWorkspaceSchema = createWorkspaceSchema.partial();

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
};
