const { z } = require('zod');

const joinLiveSchema = z.object({
  pinCode: z.string().min(4, 'Mã PIN không hợp lệ').max(10),
});

module.exports = {
  joinLiveSchema,
};
