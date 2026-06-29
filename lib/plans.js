/* =====================================================================
   EDIT THIS FILE to change herd sizes and fees.
   These are the REAL prices customers pay — the server uses this list,
   so a customer cannot change the amount from their browser.

     cows -> herd size (also used as the plan id)
     fee  -> amount charged on M-Pesa, in the currency below
   ===================================================================== */

const PLANS = [
  { cows: 1000,  fee: 10  },
  { cows: 200,  fee: 15  },
  { cows: 300,  fee: 18  },
  { cows: 500,  fee: 20  },
  { cows: 750,  fee: 35  },
  { cows: 1000, fee: 50  },
  { cows: 1500, fee: 70  },
  { cows: 2000, fee: 90  },
  { cows: 3000, fee: 130 },
  { cows: 5000, fee: 200 },
];

const SETTINGS = {
  programName: "Fertilizer Program",
  currency:    "KES",
  waitHours:   24,
};

function findPlan(cows) {
  return PLANS.find(function (p) { return p.cows === Number(cows); }) || null;
}

module.exports = { PLANS, SETTINGS, findPlan };
