const { confirmReport } = require('../services/confirmations.service');
const { success } = require('../utils/http');

// POST /confirm/reports/:reportId/confirm
async function confirmIssue(req, res, next) {
  try {
    const { reportId } = req.params;
    const userId = req.user.id; // comes from auth middleware

    const result = await confirmReport({ reportId, userId });
    // result looks like { reportId: "...", confirmations: 3 }

    return success(res, result);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  confirmIssue,
};
