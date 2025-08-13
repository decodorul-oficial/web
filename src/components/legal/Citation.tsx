type Props = {
  act?: string | null;
  partea?: string | null; // ex: Partea I
  numarSiData?: string | null; // ex: M. Of. nr. 716 din 1 august 2025
  sourceUrl?: string | null;
};

export function Citation({ act, partea = 'Partea I', numarSiData, sourceUrl }: Props) {
  const label = act || 'Act normativ';
  return (
    <div className="text-xs text-gray-600">
      <span className="font-medium">Sursa oficială: </span>
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-info hover:underline">
          {label}
        </a>
      ) : (
        <span>{label}</span>
      )}
      {', '}Monitorul Oficial al României, {partea}
      {numarSiData ? `, ${numarSiData}` : ''}.
    </div>
  );
}


