"use server";

import { getServerSupabase } from "@/lib/supabase/server";

export async function getSavedAddress() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("customer_name, customer_phone, customer_email, shipping_province, shipping_city, shipping_district, shipping_postal_code, shipping_address")
    .eq("customer_email", session.user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order) return null;

  return {
    fullName: order.customer_name,
    phone: order.customer_phone,
    email: order.customer_email,
    province: order.shipping_province,
    city: order.shipping_city,
    district: order.shipping_district,
    postalCode: order.shipping_postal_code,
    address: order.shipping_address,
  };
}
