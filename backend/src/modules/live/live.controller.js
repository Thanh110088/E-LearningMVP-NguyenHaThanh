const { wrapController } = require('../../utils/handleAsync');
const liveService = require('./live.service');
const { sendSuccess } = require('../../utils/response.util');

class LiveController {
  async joinRoom(req, res) {
    const { pinCode } = req.body;
    const exam = await liveService.joinLiveRoom(pinCode);
    return sendSuccess(res, 'Vào phòng thi Live thành công', exam);
  }
}

module.exports = wrapController(new LiveController());
