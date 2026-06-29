const { getStatus } = require("../lib/store");

module.exports = async (req, res) => {
  const ref = req.query.ref;
  if (!ref) return res.status(400).json({ status: "UNKNOWN" });
  const data = await getStatus(ref);
  res.status(200).json(data || { status: "UNKNOWN" });
};
