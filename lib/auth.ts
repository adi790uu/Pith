import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

function deriveName(parts: Array<string | null | undefined>, fallback: string) {
  const joined = parts.filter(Boolean).join(" ").trim();
  return joined.length > 0 ? joined : fallback;
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkUser.id}@users.pith.local`;

  const name = deriveName(
    [clerkUser.firstName, clerkUser.lastName],
    clerkUser.username ?? primaryEmail.split("@")[0]
  );

  await db
    .insert(users)
    .values({ id: clerkUser.id, email: primaryEmail, name })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: primaryEmail, name }
    });

  return {
    id: clerkUser.id,
    name,
    email: primaryEmail
  };
}
