const { findPlan } = require("../lib/plans");
const { setStatus } = require("../lib/store");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }
  const { cows, phone_number, external_reference, customer_name } = req.body || {};

  const plan = findPlan(cows); // price comes from the server, not the browser
  if (!plan || !phone_number || !external_reference) {
    return res.status(400).json({ success: false, error: "Invalid plan, phone number, or reference." });
  }

  const auth        = process.env.PAYHERO_AUTH;
  const channelId   = Number(process.env.PAYHERO_CHANNEL_ID);
  const callbackUrl = process.env.PAYHERO_CALLBACK_URL;
  if (!auth || !channelId || !callbackUrl) {
    return res.status(500).json({ success: false, error: "Payment is not configured on the server yet." });
  }

  await setStatus(external_reference, { status: "PENDING" });

  try {
    const r = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": auth },
      body: JSON.stringify({
        amount: plan.fee,
        phone_number,
        channel_id: channelId,
        provider: "m-pesa",
        external_reference,
        customer_name: customer_name || "Farmer",
        callback_url: callbackUrl,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (data && data.CheckoutRequestID) {
      await setStatus(external_reference, { status: "PENDING", CheckoutRequestID: data.CheckoutRequestID });
    }
    if (!r.ok || data.success === false) {
      await setStatus(external_reference, { status: "FAILED", desc: data.error || "Rejected by PayHero." });
    }
    return res.status(r.status).json(data);
  } catch (e) {
    await setStatus(external_reference, { status: "FAILED", desc: "Could not reach PayHero." });
    return res.status(502).json({ success: false, error: "Could not reach PayHero." });
  }
};
