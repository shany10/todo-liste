import { NextResponse } from "next/server";
import { addItem, listItems, deleteItem, TodoError } from "@/lib/todos-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "";
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  try {
    const items = listItems(userId);
    return NextResponse.json({ todos: items });
  } catch (err) {
    if (err instanceof TodoError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    userId?: unknown;
    name?: unknown;
    content?: unknown;
  } | null;

  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const content = typeof body?.content === "string" ? body.content : "";

  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }

  try {
    const item = addItem(userId, name, content);
    return NextResponse.json({ todo: item }, { status: 201 });
  } catch (err) {
    if (err instanceof TodoError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 422 });
    }
    console.error("[POST /api/todos]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    userId?: unknown;
  } | null;

  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

  if (!id || !userId) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const deleted = deleteItem(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

