const supabase = require("../config/supabase");

async function saveCustomer(customer) {
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      {
        id: customer.id,
        full_name: customer.fullName,
        username: customer.username || null,
        phone: customer.phone,
        address: customer.address,
        language: customer.language || "uz",
        birthday: customer.birthday || null,
        last_order_date: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Mijozni saqlash xatosi:", error.message);
    throw error;
  }

  return data;
}

async function getCustomer(customerId) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();

  if (error) {
    console.error("Mijozni olish xatosi:", error.message);
    throw error;
  }

  return data;
}

module.exports = {
  saveCustomer,
  getCustomer,
};