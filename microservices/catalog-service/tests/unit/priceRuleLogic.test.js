/**
 * UNIT TEST – Validate logic tính toán giá vé (PriceRule)
 * ─────────────────────────────────────────────────────────────────
 * Kiểm tra hàm tính giá cuối sau khi áp dụng luật tăng/giảm giá.
 * KHÔNG cần database, KHÔNG cần server.
 * Kiểm tra logic thuần JavaScript.
 */

// ────────────────────────────────────────────────────────────────
// Hàm tính giá cuối cùng (logic từ PriceRule của bạn)
// priceMultiplier: nhân hệ số (vd: 1.2 = tăng 20%)
// priceDelta:      cộng/trừ số tiền cố định (vd: -50000 = giảm 50k)
// ────────────────────────────────────────────────────────────────
function applyPriceRule(basePrice, rule) {
  if (!rule) return basePrice;
  let finalPrice = basePrice;
  if (rule.priceMultiplier) {
    finalPrice = finalPrice * Number(rule.priceMultiplier);
  }
  if (rule.priceDelta) {
    finalPrice = finalPrice + Number(rule.priceDelta);
  }
  return Math.max(0, finalPrice); // giá không được âm
}

describe('Unit Test – applyPriceRule() Tính giá vé', () => {

  // ────────────────────────────────────────────────────────────────
  // Test 1: Không có luật giá → trả về giá gốc
  // ────────────────────────────────────────────────────────────────
  test('Không áp dụng rule → trả về đúng giá gốc', () => {
    const result = applyPriceRule(200000, null);
    expect(result).toBe(200000);
  });

  // ────────────────────────────────────────────────────────────────
  // Test 2: Nhân hệ số 1.2 (tăng 20% dịp lễ tết)
  // ────────────────────────────────────────────────────────────────
  test('Áp dụng priceMultiplier 1.2 → giá tăng 20%', () => {
    const rule = { priceMultiplier: '1.2', priceDelta: null };
    const result = applyPriceRule(200000, rule);
    expect(result).toBe(240000);
  });

  // ────────────────────────────────────────────────────────────────
  // Test 3: Giảm giá cố định 50,000đ (khuyến mãi)
  // ────────────────────────────────────────────────────────────────
  test('Áp dụng priceDelta -50000 → giá giảm 50,000đ', () => {
    const rule = { priceMultiplier: null, priceDelta: '-50000' };
    const result = applyPriceRule(200000, rule);
    expect(result).toBe(150000);
  });

  // ────────────────────────────────────────────────────────────────
  // Test 4: Áp dụng cả multiplier VÀ delta cùng lúc
  // ────────────────────────────────────────────────────────────────
  test('Áp dụng cả multiplier 1.1 và delta +20000', () => {
    // 200000 * 1.1 = 220000 → 220000 + 20000 = 240000
    const rule = { priceMultiplier: '1.1', priceDelta: '20000' };
    const result = applyPriceRule(200000, rule);
    expect(result).toBe(240000);
  });

  // ────────────────────────────────────────────────────────────────
  // Test 5: Giá không được âm (giảm quá nhiều)
  // ────────────────────────────────────────────────────────────────
  test('Giá không được trả về số âm dù priceDelta rất lớn', () => {
    const rule = { priceMultiplier: null, priceDelta: '-999999999' };
    const result = applyPriceRule(200000, rule);
    expect(result).toBe(0); // Math.max(0, ...) đảm bảo không âm
  });

  // ────────────────────────────────────────────────────────────────
  // Test 6: Giá gốc = 0, multiplier 1.5 → vẫn là 0
  // ────────────────────────────────────────────────────────────────
  test('Giá gốc là 0 sau khi nhân hệ số vẫn là 0', () => {
    const rule = { priceMultiplier: '1.5', priceDelta: null };
    const result = applyPriceRule(0, rule);
    expect(result).toBe(0);
  });
});
