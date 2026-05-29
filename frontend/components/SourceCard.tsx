interface SourceCardProps {
  sources: string[];
}

export default function SourceCard({ sources }: SourceCardProps) {
  if (!sources.length) return null;
  return (
    <div className="mt-3 p-3 bg-gray-800 rounded-lg">
      <p className="text-xs text-gray-400 mb-2 font-medium">Sources</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => (
          <span
            key={i}
            className="text-xs bg-gray-700 text-blue-300 px-2 py-1 rounded font-mono"
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}