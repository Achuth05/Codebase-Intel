interface NodeDetailData {
  file: string;
  description?: string;
  language?: string;
  functions?: string[];
  classes?: string[];
  imports?: any[];
  dependents?: string[];
  dependent_count?: number;
  total_symbols?: number;
}

interface NodeDetailPanelProps {
  data: NodeDetailData | null;
  onClose: () => void;
}

export default function NodeDetailPanel({ data, onClose }: NodeDetailPanelProps) {
  if (!data) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 p-5 overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium truncate flex-1">{data.file}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg ml-2">×</button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap mb-5">
        {data.total_symbols !== undefined && (
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
            {data.total_symbols} symbols
          </span>
        )}
        {data.dependent_count !== undefined && (
          <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
            {data.dependent_count} dependents
          </span>
        )}
        {data.language && (
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {data.language}
          </span>
        )}
      </div>

      {/* AI Description */}
      {data.description && (
        <div className="mb-5 bg-blue-900/20 border border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-400 mb-1 font-medium">What this file does</p>
          <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Functions */}
      {data.functions && data.functions.length > 0 && (
        <div className="mb-5">
          <p className="text-gray-400 text-xs mb-2 font-medium">
            Functions ({data.functions.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.functions.map((f, i) => (
              <span key={i} className="text-xs font-mono bg-gray-800 text-yellow-300 px-2 py-1 rounded">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Classes */}
      {data.classes && data.classes.length > 0 && (
        <div className="mb-5">
          <p className="text-gray-400 text-xs mb-2 font-medium">
            Classes ({data.classes.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.classes.map((c, i) => (
              <span key={i} className="text-xs font-mono bg-gray-800 text-purple-300 px-2 py-1 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Imports */}
      {data.imports && data.imports.length > 0 && (
        <div className="mb-5">
          <p className="text-gray-400 text-xs mb-2 font-medium">
            Imports ({data.imports.length})
          </p>
          <div className="space-y-2">
            {data.imports.map((imp, i) => (
              <div key={i} className="bg-gray-800 rounded p-2">
                <span className="text-xs font-mono text-blue-300">
                  {typeof imp === "string" ? imp : imp.module}
                </span>
                {imp.co_importers > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    +{imp.co_importers} other files import this
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependents */}
      {data.dependents && data.dependents.length > 0 && (
        <div className="mb-5">
          <p className="text-gray-400 text-xs mb-2 font-medium text-orange-400">
            ⚠ Files that depend on this ({data.dependents.length})
          </p>
          <div className="space-y-1">
            {data.dependents.slice(0, 8).map((d, i) => (
              <p key={i} className="text-xs font-mono text-orange-300 bg-gray-800 px-2 py-1 rounded">
                {d}
              </p>
            ))}
            {data.dependents.length > 8 && (
              <p className="text-xs text-gray-500">+{data.dependents.length - 8} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}