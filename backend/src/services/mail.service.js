/**
 * Gửi email (Nodemailer).
 * Chưa cấu hình SMTP hoặc đang test: không gửi thật, ghi vào `outbox` trong RAM
 * để test đọc được token trong link.
 */
const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../config/logger');

const outbox = []; // hộp thư giả — test gọi findByTo() để lấy token trong HTML

let transporter = null;

/** Tạo (hoặc tái sử dụng) kết nối SMTP. Thiếu host/user → null, không gửi thật. */
const getTransporter = () => {
  if (transporter) return transporter;
  if (!config.smtp.host || !config.smtp.user) return null;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: Number(config.smtp.port) === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  return transporter;
};

/** Bọc HTML chung cho mọi mail auth. */
const wrapLayout = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
    <h2 style="color:#22d3ee;margin:0 0 16px;">ETech E-Learning</h2>
    <h3 style="margin:0 0 12px;color:#f8fafc;">${title}</h3>
    ${body}
    <p style="margin-top:24px;font-size:12px;color:#94a3b8;">Nếu bạn không thực hiện thao tác này, hãy bỏ qua email hoặc liên hệ quản trị viên.</p>
  </div>
`;

const templates = {
  /** Mail sau đăng ký: link /verify-email?token= */
  verifyEmail({ fullName, verifyUrl }) {
    return {
      subject: 'Xác nhận email đăng ký tài khoản ETech',
      html: wrapLayout(
        'Xác nhận địa chỉ email',
        `<p>Xin chào <strong>${fullName}</strong>,</p>
         <p>Cảm ơn bạn đã đăng ký. Vui lòng xác nhận email để kích hoạt tài khoản:</p>
         <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">Xác nhận email</a></p>
         <p style="font-size:12px;word-break:break-all;color:#94a3b8;">${verifyUrl}</p>`
      ),
    };
  },
  /** Mail quên MK: link /reset-password?token= */
  resetPassword({ fullName, resetUrl }) {
    return {
      subject: 'Đặt lại mật khẩu tài khoản ETech',
      html: wrapLayout(
        'Yêu cầu đặt lại mật khẩu',
        `<p>Xin chào <strong>${fullName}</strong>,</p>
         <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Liên kết có hiệu lực trong thời gian ngắn:</p>
         <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">Đặt lại mật khẩu</a></p>
         <p style="font-size:12px;word-break:break-all;color:#94a3b8;">${resetUrl}</p>`
      ),
    };
  },
  /** Mail cảnh báo sau khi đổi / reset mật khẩu. */
  passwordChanged({ fullName, changedAt, ipAddress }) {
    return {
      subject: 'Mật khẩu tài khoản ETech vừa được thay đổi',
      html: wrapLayout(
        'Cảnh báo bảo mật: mật khẩu đã đổi',
        `<p>Xin chào <strong>${fullName}</strong>,</p>
         <p>Mật khẩu tài khoản của bạn vừa được thay đổi vào <strong>${changedAt}</strong>.</p>
         <p>Địa chỉ IP ghi nhận: <strong>${ipAddress || 'Không xác định'}</strong>.</p>
         <p>Nếu không phải bạn, hãy đặt lại mật khẩu ngay và liên hệ quản trị viên.</p>`
      ),
    };
  },
};

/** Gửi 1 email. Thiếu SMTP hoặc NODE_ENV=test: chỉ log, không gọi Gmail. */
const sendMail = async ({ to, subject, html }) => {
  const payload = { to, subject, html, sentAt: new Date().toISOString() };
  outbox.push(payload);

  const transport = getTransporter();
  if (!transport || config.isTest) {
    logger.info(`[MAIL:${config.isTest ? 'test' : 'dev'}] to=${to} subject=${subject} (chưa gửi SMTP)`);
    return payload;
  }

  try {
    await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    logger.info(`[MAIL:sent] to=${to} subject=${subject}`);
  } catch (error) {
    logger.error(`[MAIL:fail] to=${to} ${error.message}`);
    if (config.isProduction) throw error;
  }
  return payload;
};

/** Chọn template auth (verifyEmail / resetPassword / passwordChanged) rồi gửi. */
const sendTemplate = async (templateName, to, data) => {
  const built = templates[templateName](data);
  return sendMail({ to, ...built });
};

/** Test: lấy mail mới nhất gửi tới email này. */
const findByTo = (email) => [...outbox].reverse().find((item) => item.to === email) || null;

/** Test: lọc thêm theo đoạn subject (phân biệt verify vs reset). */
const findLatestByToAndSubject = (email, subjectIncludes) =>
  [...outbox]
    .reverse()
    .find((item) => item.to === email && item.subject?.includes(subjectIncludes)) || null;

/** Test: xóa hộp thư giả giữa các test. */
const clearOutbox = () => {
  outbox.length = 0;
};

/** Test: snapshot toàn bộ outbox. */
const getOutbox = () => [...outbox];

module.exports = {
  sendMail,
  sendTemplate,
  findByTo,
  findLatestByToAndSubject,
  clearOutbox,
  getOutbox,
};
