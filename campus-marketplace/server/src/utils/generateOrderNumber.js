function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ORD-${timestamp}${rand}`;
}

module.exports = generateOrderNumber;
