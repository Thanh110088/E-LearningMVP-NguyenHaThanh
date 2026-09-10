/**
 * handleAsync — "bao" hàm async của Express để khỏi viết try/catch ở mọi controller.
 *
 * Express KHÔNG tự bắt lỗi của hàm async. Nếu bạn `await` rồi bị throw,
 * request sẽ treo trừ khi bạn `.catch(next)`.
 *
 * handleAsync(fn) trả về middleware mới:
 *   1. Gọi fn(req, res, next)
 *   2. Nếu Promise bị reject (throw trong async) → next(err)
 *   3. error.middleware.js nhận err và trả JSON lỗi
 *
 * wrapController: lấy mọi method của class controller rồi bọc handleAsync,
 * nên file controller chỉ việc `async method(req, res) { ... }` là đủ.
 */
/** Bọc 1 middleware/controller async: throw → next(err) → error handler. */
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/** Bọc mọi method của class controller bằng handleAsync (giữ `this`). */
const wrapController = (controller) => {
  const proto = Object.getPrototypeOf(controller);
  const methodNames = Object.getOwnPropertyNames(proto).filter(
    (name) => name !== 'constructor' && typeof controller[name] === 'function'
  );

  for (const name of methodNames) {
    // bind(controller) giữ `this` khi Express gọi method như hàm thường
    controller[name] = handleAsync(controller[name].bind(controller));
  }

  return controller;
};

module.exports = {
  handleAsync,
  wrapController,
};
