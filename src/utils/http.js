function success(res, data = {}, status = 200){ return res.status(status).json({ ok: true, data }); }
function fail(res, message='Bad Request', status=400){ return res.status(status).json({ ok:false, error: message }); }
class HttpError extends Error { constructor(message, status=400){ super(message); this.status = status; } }
module.exports = { success, fail, HttpError };
