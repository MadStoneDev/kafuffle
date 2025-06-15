interface SpacesListProps {
  onSelectSpace: (space: string) => void;
}

export default function SpacesList({ onSelectSpace }: SpacesListProps) {
  return (
    <div className={`flex-grow p-6 bg-neutral-50 rounded-4xl text-neutral-900`}>
      <h1 className={`text-2xl font-bold`}>Spaces</h1>
    </div>
  );
}
