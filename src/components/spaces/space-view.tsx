interface SpaceViewProps {
  spaceId: string;
  selectedZoneId: string;
  onSelectZone: (selectedZoneId: string) => void;
}

export default function SpaceView({
  spaceId,
  selectedZoneId,
  onSelectZone,
}: SpaceViewProps) {
  return <div className={`flex-grow p-4 bg-neutral-50`}>{spaceId}</div>;
}
