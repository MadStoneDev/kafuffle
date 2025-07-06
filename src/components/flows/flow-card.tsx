// /components/flows/flow-card.tsx
interface FlowCardProps {
  card: {
    id: string;
    title: string;
    description?: string;
    assignee_id?: string;
    due_date?: string;
    labels: string[];
    assignee?: {
      username: string;
      display_name: string | null;
    };
  };
  onDragStart: () => void;
}

export default function FlowCard({ card, onDragStart }: FlowCardProps) {
  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white dark:bg-neutral-900 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700 cursor-move hover:shadow-md transition-shadow"
    >
      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
        {card.title}
      </h4>

      {card.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {card.description}
        </p>
      )}

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.labels.map((label, index) => (
            <span
              key={index}
              className="text-xs bg-kafuffle-primary/10 text-kafuffle-primary px-2 py-1 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        {card.assignee && (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-kafuffle-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {(card.assignee.display_name || card.assignee.username)
                .charAt(0)
                .toUpperCase()}
            </div>
            <span className="text-neutral-500">
              {card.assignee.display_name || card.assignee.username}
            </span>
          </div>
        )}

        {card.due_date && (
          <span
            className={`${isOverdue ? "text-red-500" : "text-neutral-500"}`}
          >
            {new Date(card.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
