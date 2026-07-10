function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function normalizeWaterCount(value) {
  const count = Number.parseInt(value, 10);

  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return null;
  }

  return count;
}

function customerName(from) {
  const fullName = [from.first_name, from.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Noma’lum mijoz";
}

module.exports = {
  normalizePhone,
  normalizeWaterCount,
  customerName,
};