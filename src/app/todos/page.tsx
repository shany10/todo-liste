"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TodoList } from "../composant/todoList";
import { FormTodoList } from "../composant/formTodoList";

type Todo = {
    id: string;
    name: string;
    content: string;
    createdAt: string;
};

type RegisteredUser = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
};

function getStoredUser(): RegisteredUser | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = sessionStorage.getItem("user");
        return stored ? (JSON.parse(stored) as RegisteredUser) : null;
    } catch {
        return null;
    }
}

export default function TodosPage() {
    const router = useRouter();
    const [user] = useState<RegisteredUser | null>(getStoredUser);
    const [lists, setLists] = useState<Todo[]>([]);
    const [todoError, setTodoError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Redirect unauthenticated users and fetch todos
    useEffect(() => {
        if (!user) {
            router.replace("/");
            return;
        }
        fetch(`/api/todos?userId=${encodeURIComponent(user.id)}`)
            .then((res) => res.json())
            .then(({ todos }) => {
                setLists(Array.isArray(todos) ? todos : []);
            })
            .catch(() => setLists([]))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (name: string, content: string) => {
        if (!user) return;
        setTodoError(null);
        fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, name, content }),
        })
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    setTodoError(data.message ?? data.error ?? "Une erreur est survenue.");
                    return;
                }
                setLists((prev) => [data.todo, ...prev]);
            })
            .catch(() => setTodoError("Une erreur est survenue."));
    };

    const handleDelete = (id: string) => {
        if (!user) return;
        fetch("/api/todos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, userId: user.id }),
        })
            .then((res) => {
                if (res.ok) setLists((prev) => prev.filter((todo) => todo.id !== id));
            })
            .catch(() => { });
    };

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        router.replace("/");
    };

    if (!user) return null;

    return (
        <div className="min-h-dvh w-full bg-foreground/5 text-foreground flex items-center justify-center p-6">
            <main className="w-full max-w-xl rounded-2xl border border-foreground/10 bg-background p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-foreground/60">
                        Bienvenue,{" "}
                        <span className="font-medium">
                            {user.firstname} {user.lastname}
                        </span>{" "}
                        👋
                    </p>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        Se déconnecter
                    </button>
                </div>

                <FormTodoList handleSubmit={handleSubmit} error={todoError} />

                <div className="mt-6">
                    {loading ? (
                        <p className="text-sm text-foreground/50 text-center">Chargement…</p>
                    ) : (
                        <TodoList lists={lists} handleDelete={handleDelete} />
                    )}
                </div>
            </main>
        </div>
    );
}
