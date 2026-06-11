type Todo = {
  id: string;
  name: string;
  createdAt: string;
};

type TodoListProps = {
  handleDelete: (id: string) => void;
  lists: Todo[];
};

export const TodoList = ({ lists, handleDelete }: TodoListProps) => {
  return (
    <section className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Todo List</h1>
        <p className="text-sm text-foreground/60">{lists.length} items</p>
      </div>
      <ul className="mt-4 space-y-2">
        {lists.slice(0, 10).map((list) => (
          <li
            key={list.id}
            className="rounded-xl border border-foreground/10 bg-background grid grid-cols-3 gap-2 px-4 py-3 text-sm hover:bg-foreground/5"
          >
            <p className="col-span-2">{list.name}</p>
            <button
              onClick={() => handleDelete(list.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
