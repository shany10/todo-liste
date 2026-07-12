"use client";

import { useState } from "react";

type LoggedInUser = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
};

type Props = {
    onLoggedIn: (user: LoggedInUser) => void;
    onSwitchToRegister: () => void;
};

const inputClass =
    "w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm shadow-sm focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "block text-sm font-medium mb-1";

export const FormLogin = ({ onLoggedIn, onSwitchToRegister }: Props) => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? "Une erreur est survenue.");
                return;
            }

            onLoggedIn(data.user);
        } catch {
            setError("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1 className="text-xl font-semibold tracking-tight mb-1">Se connecter</h1>
            <p className="text-sm text-foreground/50 mb-6">
                Pas encore de compte ?{" "}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-foreground font-medium underline underline-offset-2 hover:text-foreground/70 transition-colors"
                >
                    Créer un compte
                </button>
            </p>

            {error && (
                <p className="mb-4 text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className={labelClass}>
                        Adresse email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="password" className={labelClass}>
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md px-3 py-2 text-sm text-white bg-foreground hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading ? "Connexion…" : "Se connecter"}
                </button>
            </div>
        </form>
    );
};
