const { setStatus } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const r = body.response || {};
    const ref = r.ExternalReference;

    if (ref) {
      const ok = Number(r.ResultCode) === 0;
      await setStatus(
        ref,
        {
          status: r.Status || (ok ? "Success" : "Failed"),
          resultCode: r.ResultCode ?? null,
          checkoutRequestId: r.CheckoutRequestID || null,
          receipt: r.MpesaReceiptNumber || null,
          phone: r.Phone || null,
          amount: r.Amount ?? null,
          desc: r.ResultDesc || null,
        },
        60 * 60 * 24
      );
    }
  } catch (err) {
    console.error("PayHero callback error:", err);
  }

  // Always 200 so PayHero doesn't keep retrying the webhook
  res.status(200).json({ ok: true });
};
