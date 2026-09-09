const { z } = require('zod');

const upgradePlanSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE'], {
    errorMap: () => ({ message: 'Gói cước không hợp lệ' }),
  }),
  paymentMethod: z.string().optional().default('QR_BANKING'),
});

module.exports = {
  upgradePlanSchema,
};
