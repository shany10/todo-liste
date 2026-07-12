type Todo = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type TodoListProps = {
  handleDelete: (id: string) => void;
  lists: Todo[];
};

export const TodoList = ({ lists = [], handleDelete }: TodoListProps) => {
  return (
    <section className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Ma TodoList</h1>
        <p className="text-sm text-foreground/60">{lists.length} / 10 items</p>
      </div>
      <ul className="mt-4 space-y-2">
        {lists.map((list) => (
          <li
            key={list.id}
            className="rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm hover:bg-foreground/5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{list.name}</p>
              <button
                onClick={() => handleDelete(list.id)}
                className="shrink-0 text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            {list.content && (
              <p className="mt-1 text-foreground/60 whitespace-pre-wrap">{list.content}</p>
            )}
            <p className="mt-1 text-xs text-foreground/40">
              {new Date(list.createdAt).toLocaleString("fr-FR")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

