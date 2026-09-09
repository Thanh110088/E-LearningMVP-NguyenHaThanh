const request = require('supertest');
const app = require('../../src/app');
const mailService = require('../../src/services/mail.service');

const extractTokenFromMail = (mail) => {
  const html = mail?.html || '';
  const match = html.match(/token=([a-f0-9]{64})/i);
  return match ? match[1] : null;
};

const registerAndActivate = async (user) => {
  mailService.clearOutbox();
  const agent = request.agent(app);
  const registerRes = await agent.post('/api/v1/auth/register').send(user);
  const mail = mailService.findByTo(user.email);
  const token = extractTokenFromMail(mail);
  const verifyRes = await agent.post('/api/v1/auth/verify-email').send({ token });
  return { agent, registerRes, verifyRes, verifyToken: token, mail };
};

const loginAgent = async (email, password) => {
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/login').send({ email, password });
  return { agent, res };
};

module.exports = {
  extractTokenFromMail,
  registerAndActivate,
  loginAgent,
};
