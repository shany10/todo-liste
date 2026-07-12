import { useState } from "react";

type Props = {
  handleSubmit: (name: string, content: string) => void;
  error?: string | null;
};

const inputClass =
  "w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm shadow-sm focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const FormTodoList = ({ handleSubmit, error }: Props) => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  return (
    <form
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(name, content);
        setName("");
        setContent("");
      }}
    >
      <div className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Nom de l'item…"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          name="content"
          placeholder="Contenu (max 1000 caractères)…"
          rows={3}
          maxLength={1000}
          className={`${inputClass} resize-none`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-sm text-white bg-green-500 hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
};

