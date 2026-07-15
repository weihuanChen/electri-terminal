"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { mutateAdmin, queryAdmin } from "@/lib/convex-admin";
import { DEFAULT_LOCALE, type StoredLanguageWorkflow } from "@/lib/i18n";

const PAGE_PATH = "/admin/localizations/strategy";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseJsonObject(formData: FormData, key: string) {
  const raw = value(formData, key);
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${key}_must_be_object`);
  }
  return parsed as Record<string, unknown>;
}

function errorMessage(error: unknown) {
  if (error instanceof SyntaxError) return "invalid_json";
  if (error instanceof Error) return error.message;
  return "unknown_error";
}

function finish(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(
    ([key, item]) => item && search.set(key, item),
  );
  redirect(`${PAGE_PATH}${search.size ? `?${search}` : ""}`);
}

async function assertWorkflowLocale(locale: string) {
  const workflows = await queryAdmin<StoredLanguageWorkflow[]>(
    "frontend:getLanguageWorkflowSettings",
  );
  if (
    locale === DEFAULT_LOCALE ||
    !workflows.some((workflow) => workflow.locale === locale)
  ) {
    throw new Error("language_workflow_required");
  }
}

export async function saveLanguageProfileVersionAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = value(formData, "locale");
  try {
    await assertWorkflowLocale(locale);
    await mutateAdmin(
      "mutations/admin/localizationFoundation:createLanguageProfileVersion",
      {
        locale,
        market: value(formData, "market"),
        schemaVersion: 1,
        hardRules: parseJsonObject(formData, "hardRules"),
        softRules: parseJsonObject(formData, "softRules"),
        changeNote: value(formData, "changeNote") || undefined,
        owner: admin.email,
        actor: admin.email,
      },
    );
  } catch (error) {
    finish({ locale, error: errorMessage(error) });
  }
  revalidatePath(PAGE_PATH);
  finish({ locale, success: "profile_version_created" });
}

export async function approveLanguageProfileVersionAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = value(formData, "locale");
  try {
    await assertWorkflowLocale(locale);
    await mutateAdmin(
      "mutations/admin/localizationFoundation:approveLanguageProfileVersion",
      {
        versionId: value(formData, "versionId"),
        actor: admin.email,
      },
    );
  } catch (error) {
    finish({ locale, error: errorMessage(error) });
  }
  revalidatePath(PAGE_PATH);
  finish({ locale, success: "profile_version_approved" });
}

export async function activateLanguageProfileVersionAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = value(formData, "locale");
  try {
    await assertWorkflowLocale(locale);
    await mutateAdmin(
      "mutations/admin/localizationFoundation:activateLanguageProfileVersion",
      {
        versionId: value(formData, "versionId"),
        actor: admin.email,
      },
    );
  } catch (error) {
    finish({ locale, error: errorMessage(error) });
  }
  revalidatePath(PAGE_PATH);
  finish({ locale, success: "profile_version_activated" });
}

export async function setLanguageProfileStatusAction(formData: FormData) {
  await requireAdmin();
  const locale = value(formData, "locale");
  try {
    await assertWorkflowLocale(locale);
    await mutateAdmin(
      "mutations/admin/localizationFoundation:setLanguageProfileStatus",
      {
        profileId: value(formData, "profileId"),
        status: value(formData, "status"),
      },
    );
  } catch (error) {
    finish({ locale, error: errorMessage(error) });
  }
  revalidatePath(PAGE_PATH);
  finish({ locale, success: "profile_status_updated" });
}
