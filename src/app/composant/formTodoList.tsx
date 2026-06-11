import { useState } from "react";

type Props = {
  handleSubmit: (name: string) => void;
};

export const FormTodoList = ({ handleSubmit }: Props) => {
  const [name, setName] = useState("");

  return (
    <form
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(name);
        setName("");
      }}
    >
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="New todo name..."
          className="flex-1 rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm shadow-sm focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md px-3 py-2 text-sm text-white hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
};
