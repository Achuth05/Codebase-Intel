import { ImpactResponse } from "@/types/api";

export default function ImpactCard({ data }: { data: ImpactResponse }) {
  return (
    <div className="bg-gray-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-mono text-sm">{data.file}</h3>
        <span className="bg-red-900 text-red-300 text-xs px-3 py-1 rounded-full">
          Impact: {data.total_impact}
        </span>
      </div>

      {data.symbols_defined && data.symbols_defined.length > 0 && (
        <div>
          <p className="text-gray-400 text-xs mb-2">Symbols defined ({data.symbols_defined.length})</p>
          <div className="flex flex-wrap gap-2">
            {data.symbols_defined.slice(0, 10).map((s, i) => (
              <span key={i} className="text-xs bg-gray-700 text-purple-300 px-2 py-1 rounded font-mono">
                {s.type === "class" ? "🔷" : "⚡"} {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.direct_dependents && data.direct_dependents.length > 0 && (
        <div>
          <p className="text-gray-400 text-xs mb-2">Direct dependents ({data.direct_dependents.length})</p>
          <div className="space-y-1">
            {data.direct_dependents.slice(0, 5).map((d, i) => (
              <p key={i} className="text-xs text-yellow-300 font-mono">{d}</p>
            ))}
          </div>
        </div>
      )}

      {data.indirect_dependents && data.indirect_dependents.length > 0 && (
        <div>
          <p className="text-gray-400 text-xs mb-2">Indirect dependents ({data.indirect_dependents.length})</p>
          <div className="space-y-1">
            {data.indirect_dependents.slice(0, 5).map((d, i) => (
              <p key={i} className="text-xs text-orange-300 font-mono">{d}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}