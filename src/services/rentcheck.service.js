const prisma = require('../lib/prisma');

function qcRentCheck({ base, proposed, year, majorWork }) {
  const pct = ((proposed - base) / base) * 100;
  let result = 'Unsure';
  let explain = `Increase: ${pct.toFixed(2)}%`;
  if (pct <= 3) { result = 'Likely OK'; explain += ' — modest increase.'; }
  if (pct > 5 && !majorWork) { result = 'Likely NOT OK'; explain += ' — high without major work.'; }
  return { pct, result, explain };
}

async function create({ userId, province='QC', base, proposed, year, majorWork=false }) {
  const { pct, result, explain } = qcRentCheck({ base, proposed, year, majorWork });
  return prisma.rentCheck.create({ data: { userId, province, year, base, proposed, pct, majorWork, result, explain } });
}

module.exports = { create };
