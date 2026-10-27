"use server";

import { redirect } from "next/navigation";
import { toActionState, type ActionState } from "@/server/action-state";
import { requireApiContext } from "@/server/auth/session";
import { archiveProject, createProject } from "@/server/projects/service";

export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let id: string;
  try {
    const ctx = await requireApiContext();
    const project = await createProject(ctx, {
      name: formData.get("name") ?? "",
      domain: formData.get("domain"),
      country: formData.get("country"),
      languages: formData.getAll("languages"),
    });
    id = project.id;
  } catch (error) {
    return toActionState(error);
  }
  redirect(`/dashboard/projects/${id}`);
}

export async function archiveProjectAction(formData: FormData): Promise<void> {
  const ctx = await requireApiContext();
  await archiveProject(ctx, String(formData.get("projectId") ?? ""));
  redirect("/dashboard/projects");
}
