"use client";

import { useState } from "react";

type Props = {
    onRegistered: (user: { id: string; firstname: string; lastname: string; email: string }) => void;
    onSwitchToLogin: () => void;
};

type FieldError = { field: string; message: string };

const inputClass =
    "w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm shadow-sm focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "block text-sm font-medium mb-1";

export const FormRegister = ({ onRegistered, onSwitchToLogin }: Props) => {
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        birthdate: "",
        password: "",
    });
    const [errors, setErrors] = useState<FieldError[]>([]);
    const [loading, setLoading] = useState(false);

    const getError = (field: string) =>
        errors.find((e) => e.field === field)?.message;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors(data.errors ?? [{ field: "global", message: data.error }]);
                return;
            }

            onRegistered(data.user);
        } catch {
            setErrors([{ field: "global", message: "Une erreur est survenue." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1 className="text-xl font-semibold tracking-tight mb-1">Créer un compte</h1>
            <p className="text-sm text-foreground/50 mb-6">
                Déjà un compte ?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-foreground font-medium underline underline-offset-2 hover:text-foreground/70 transition-colors"
                >
                    Se connecter
                </button>
            </p>

            {getError("global") && (
                <p className="mb-4 text-sm text-red-500">{getError("global")}</p>
            )}

            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label htmlFor="firstname" className={labelClass}>
                            Prénom
                        </label>
                        <input
                            id="firstname"
                            name="firstname"
                            type="text"
                            autoComplete="given-name"
                            value={form.firstname}
                            onChange={handleChange}
                            className={inputClass}
                            aria-describedby={getError("firstname") ? "firstname-error" : undefined}
                        />
                        {getError("firstname") && (
                            <p id="firstname-error" className="mt-1 text-xs text-red-500">
                                {getError("firstname")}
                            </p>
                        )}
                    </div>

                    <div className="flex-1">
                        <label htmlFor="lastname" className={labelClass}>
                            Nom
                        </label>
                        <input
                            id="lastname"
                            name="lastname"
                            type="text"
                            autoComplete="family-name"
                            value={form.lastname}
                            onChange={handleChange}
                            className={inputClass}
                            aria-describedby={getError("lastname") ? "lastname-error" : undefined}
                        />
                        {getError("lastname") && (
                            <p id="lastname-error" className="mt-1 text-xs text-red-500">
                                {getError("lastname")}
                            </p>
                        )}
                    </div>
                </div>

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
                        aria-describedby={getError("email") ? "email-error" : undefined}
                    />
                    {getError("email") && (
                        <p id="email-error" className="mt-1 text-xs text-red-500">
                            {getError("email")}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="birthdate" className={labelClass}>
                        Date de naissance
                    </label>
                    <input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={form.birthdate}
                        onChange={handleChange}
                        className={inputClass}
                        aria-describedby={getError("birthdate") ? "birthdate-error" : undefined}
                    />
                    {getError("birthdate") && (
                        <p id="birthdate-error" className="mt-1 text-xs text-red-500">
                            {getError("birthdate")}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className={labelClass}>
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        className={inputClass}
                        aria-describedby={getError("password") ? "password-error" : undefined}
                    />
                    <p className="mt-1 text-xs text-foreground/50">
                        8–40 caractères, au moins une minuscule, une majuscule et un chiffre.
                    </p>
                    {getError("password") && (
                        <p id="password-error" className="mt-1 text-xs text-red-500">
                            {getError("password")}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md px-3 py-2 text-sm text-white bg-foreground hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading ? "Inscription…" : "S'inscrire"}
                </button>
            </div>
        </form>
    );
};
