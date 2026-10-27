"use server";

import { revalidatePath } from "next/cache";
import { setUserStatus } from "@/server/admin/service";
import { requireAdminApiContext } from "@/server/auth/session";

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const ctx = await requireAdminApiContext();
  const status = formData.get("status") === "suspended" ? "suspended" : "active";
  await setUserStatus(ctx, String(formData.get("userId") ?? ""), status);
  revalidatePath("/admin/users");
}
