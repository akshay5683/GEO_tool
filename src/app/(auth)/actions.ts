"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/server/auth/cookie";
import { login, logout, register, switchOrganization } from "@/server/auth/service";
import {
  clearSessionCookie,
  getClientInfo,
  getSessionToken,
  requireApiContext,
  setSessionCookie,
} from "@/server/auth/session";
import { toActionState, type ActionState } from "@/server/action-state";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await login(
      { email: formData.get("email"), password: formData.get("password") },
      await getClientInfo(),
    );
    await setSessionCookie(session);
  } catch (error) {
    return toActionState(error);
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await register(
      {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        organizationName: formData.get("organizationName") ?? "",
      },
      await getClientInfo(),
    );
    await setSessionCookie(session);
  } catch (error) {
    return toActionState(error);
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) await logout(token);
  await clearSessionCookie();
  redirect("/login");
}

export async function switchOrganizationAction(formData: FormData): Promise<void> {
  const ctx = await requireApiContext();
  await switchOrganization(ctx, String(formData.get("organizationId") ?? ""));
  redirect("/dashboard");
}
