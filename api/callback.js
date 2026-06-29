const { setStatus } = require("../lib/store");

module.exports = async (req, res) => {
  const r = (req.body && req.body.response) || {};
  const ref = r.ExternalReference;
  if (ref) {
    await setStatus(ref, {
      status: r.Status || (r.ResultCode === 0 ? "Success" : "Failed"),
      resultCode: r.ResultCode,
      receipt: r.MpesaReceiptNumber || null,
      phone: r.Phone || null,
      amount: r.Amount || null,
      desc: r.ResultDesc || null,
    }, 60 * 60 * 24);
  }
  res.status(200).json({ ok: true });
};
