"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormRegister } from "./composant/formRegister";
import { FormLogin } from "./composant/formLogin";

type RegisteredUser = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
};

export default function Home() {
  const router = useRouter();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const handleLoggedIn = (u: RegisteredUser) => {
    sessionStorage.setItem("user", JSON.stringify(u));
    router.push("/todos");
  };

  return (
    <div className="min-h-dvh w-full bg-foreground/5 text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-xl rounded-2xl border border-foreground/10 bg-background p-6 sm:p-8">
        {authView === "login" ? (
          <FormLogin
            onLoggedIn={handleLoggedIn}
            onSwitchToRegister={() => setAuthView("register")}
          />
        ) : (
          <FormRegister
            onRegistered={handleLoggedIn}
            onSwitchToLogin={() => setAuthView("login")}
          />
        )}
      </main>
    </div>
  );
}
