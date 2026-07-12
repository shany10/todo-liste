import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/users-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;

  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const user = getUserByEmail(body.email);

  if (!user || user.passwordHash !== hashPassword(body.password)) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const { passwordHash: _pwd, ...safeUser } = user;
  void _pwd;

  return NextResponse.json({ user: safeUser }, { status: 200 });
}
