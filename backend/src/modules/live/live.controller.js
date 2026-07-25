const liveService = require('./live.service');
const { sendSuccess } = require('../../utils/response.util');

class LiveController {
  async joinRoom(req, res, next) {
    try {
      const { pinCode } = req.body;
      const exam = await liveService.joinLiveRoom(pinCode);
      return sendSuccess(res, 'Vào phòng thi Live thành công', exam);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LiveController();
