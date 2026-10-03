function resolveLinePrice(structural, dbRow, finish) {
  const finishes = Array.isArray(structural?.finishes) ? structural.finishes : [];
  const finishId = typeof finish === 'string' ? finish : '';

  if (finishes.length === 0) {
    if (finishId) return { ok: false, error: 'invalid finish' };
    if (!Number.isInteger(dbRow?.price_cents) || dbRow.price_cents <= 0) return { ok: false, error: 'invalid price' };
    return { ok: true, unitAmount: dbRow.price_cents, finishId: '', finishLabel: '' };
  }

  const match = finishes.find(entry => entry.id === finishId);
  if (!match) return { ok: false, error: 'invalid finish' };

  const stored = dbRow?.finish_prices && typeof dbRow.finish_prices === 'object'
    ? dbRow.finish_prices[finishId]
    : undefined;
  const unitAmount = stored === undefined ? Math.round(match.price * 100) : stored;
  if (!Number.isInteger(unitAmount) || unitAmount <= 0) return { ok: false, error: 'invalid price' };

  return { ok: true, unitAmount, finishId, finishLabel: match.label };
}

module.exports = { resolveLinePrice };
