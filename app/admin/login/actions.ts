"use server";

import { redirect } from "next/navigation";

import { setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!validateAdminCredentials(email, password)) {
    redirect("/admin/login?error=invalid_credentials");
  }

  await setAdminSession(email);
  redirect("/admin");
}
