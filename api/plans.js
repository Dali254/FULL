const { PLANS, SETTINGS } = require("../lib/plans");

module.exports = (req, res) => {
  res.status(200).json({ plans: PLANS, settings: SETTINGS });
};
