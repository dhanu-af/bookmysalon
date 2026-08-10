"use server";

import { searchSalons, type SalonSearchParams } from "@/lib/salon-search";

export async function searchSalonsAction(params: SalonSearchParams) {
  return searchSalons(params);
}
