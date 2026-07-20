/**
 * User store — Supabase-backed persistence.
 */

import { hashPassword, verifyPassword } from "./password";
import { getAdminClient } from "../supabase/admin";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  onboardingComplete: boolean;
  createdAt: string;
}

export async function createUser(params: {
  email: string;
  password: string;
  name: string;
}): Promise<StoredUser> {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const user: StoredUser = {
    id,
    email: params.email.toLowerCase().trim(),
    name: params.name.trim(),
    passwordHash: hashPassword(params.password),
    onboardingComplete: false,
    createdAt: now,
  };

  const supabase = getAdminClient();
  const { error } = await supabase.from("users").insert({
    id: user.id,
    email: user.email,
    name: user.name,
    password_hash: user.passwordHash,
    onboarding_complete: false,
    created_at: now,
  });

  if (error) {
    // Duplicate email
    if (error.code === "23505") {
      throw new Error("A user with this email already exists.");
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return user;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const supabase = getAdminClient();
  console.log("[user-store] getUserByEmail query for:", email.toLowerCase().trim());
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error("[user-store] getUserByEmail Supabase error:", error.message, error.code);
    return null;
  }
  if (!data) {
    console.error("[user-store] getUserByEmail: no user found for email");
    return null;
  }
  console.log("[user-store] getUserByEmail: user found, onboarding_complete:", data.onboarding_complete);
  return mapRow(data);
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<StoredUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function updateUser(
  email: string,
  updates: Partial<Pick<StoredUser, "name" | "onboardingComplete" | "passwordHash">>,
): Promise<StoredUser | null> {
  const supabase = getAdminClient();
  const record: Record<string, unknown> = {};
  if (updates.name !== undefined) record.name = updates.name;
  if (updates.onboardingComplete !== undefined) record.onboarding_complete = updates.onboardingComplete;
  if (updates.passwordHash !== undefined) record.password_hash = updates.passwordHash;

  const { data, error } = await supabase
    .from("users")
    .update(record)
    .eq("email", email.toLowerCase().trim())
    .select()
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

export async function markOnboardingComplete(userId: string): Promise<boolean> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ onboarding_complete: true })
    .eq("id", userId);

  return !error;
}

export async function isOnboardingComplete(userIdOrEmail: string): Promise<boolean> {
  const supabase = getAdminClient();
  const col = userIdOrEmail.includes("@") ? "email" : "id";
  const { data, error } = await supabase
    .from("users")
    .select("onboarding_complete")
    .eq(col, userIdOrEmail.toLowerCase().trim())
    .maybeSingle();

  if (error || !data) return false;
  return data.onboarding_complete === true;
}

// ── Helpers ────────────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): StoredUser {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    passwordHash: (row.password_hash as string) ?? "",
    onboardingComplete: (row.onboarding_complete as boolean) ?? false,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}
