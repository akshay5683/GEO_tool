import "server-only";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { AppError } from "./errors";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

/** Converts a thrown error into form state that is safe to show the user. */
export function toActionState(error: unknown): ActionState {
  unstable_rethrow(error);
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please correct the highlighted fields.", fieldErrors };
  }
  if (error instanceof AppError) return { error: error.message };
  console.error(JSON.stringify({ level: "error", source: "server-action", message: String(error), stack: (error as Error)?.stack }));
  return { error: "Something went wrong. Please try again." };
}
