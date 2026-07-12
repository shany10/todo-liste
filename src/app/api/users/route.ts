import { NextResponse } from "next/server";
import { validateUser } from "@/lib/user";
import { createUser } from "@/lib/users-repo";
import type { UserInput } from "@/lib/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<UserInput> | null;

  if (!body) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const input: UserInput = {
    firstname: typeof body.firstname === "string" ? body.firstname : "",
    lastname: typeof body.lastname === "string" ? body.lastname : "",
    email: typeof body.email === "string" ? body.email : "",
    birthdate: typeof body.birthdate === "string" ? body.birthdate : "",
    password: typeof body.password === "string" ? body.password : "",
  };

  const result = validateUser(input);

  if (!result.valid) {
    return NextResponse.json({ error: "VALIDATION_ERROR", errors: result.errors }, { status: 400 });
  }

  try {
    const user = createUser(input);
    // Never return the password hash
    const { passwordHash: _pwd, ...safeUser } = user;
    void _pwd;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", errors: [{ field: "email", message: "Cet email est déjà utilisé." }] },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
