const supabase = require("../config/supabase");

async function createOrder(order) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: order.customerId,
      water_count: order.waterCount,
      status: "Yangi",
    })
    .select()
    .single();

  if (error) {
    console.error("Buyurtmani saqlash xatosi:", error.message);
    throw error;
  }

  return data;
}

async function getOrder(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Buyurtmani olish xatosi:", error.message);
    throw error;
  }

  return data;
}

async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("Holatni yangilash xatosi:", error.message);
    throw error;
  }

  return data;
}

module.exports = {
  createOrder,
  getOrder,
  updateOrderStatus,
};