import { NextResponse } from "next/server";
import { createTodo, listTodos, deleteTodo } from "@/lib/todos-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const todos = listTodos();
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
  }

  try {
    const todo = createTodo(name);
    const todos = listTodos();
    if (todos.length == 8)
      console.log("Max todos reached, deleting the oldest one");
    return NextResponse.json({ todo }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "NAME_REQUIRED") {
      return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
  } | null;

  const id = typeof body?.id === "string" ? body.id.trim() : "";

  try {
    await deleteTodo(id);
    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
