function sumPrices(prices) {
  const totalCents = prices.reduce((sum, price) => {
    return sum + Math.round(price * 100);
  }, 0);

  return totalCents / 100;
}

export { sumPrices };
