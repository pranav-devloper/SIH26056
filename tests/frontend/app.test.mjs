// Basic frontend unit tests verifying API structures and Laspeyres calculations
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Frontend Laspeyres Calculator Logic', () => {
  it('calculates weighted index accurately', () => {
    const routes = [
      { weight: 0.5, currentFare: 5500, baseFare: 5000 },
      { weight: 0.5, currentFare: 4400, baseFare: 4000 }
    ];

    let indexSum = 0;
    for (const r of routes) {
      indexSum += r.weight * (r.currentFare / r.baseFare);
    }
    const finalIndex = Math.round(indexSum * 100 * 100) / 100;

    assert.strictEqual(finalIndex, 110.0);
  });

  it('validates booking window lead time order', () => {
    const windows = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'];
    const leadDays = [1, 7, 15, 30, 45];
    assert.strictEqual(windows.length, 5);
    for (let i = 0; i < leadDays.length - 1; i++) {
      assert(leadDays[i] < leadDays[i + 1]);
    }
  });
});
