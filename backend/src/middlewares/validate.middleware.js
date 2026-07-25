const { sendError } = require('../utils/response.util');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const formattedErrors = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return sendError(res, 'Dữ liệu đầu vào không hợp lệ', 400, formattedErrors);
  }
};

module.exports = validate;
