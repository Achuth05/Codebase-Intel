import { FileSummary } from "@/types/graph";

interface NodeDetailPanelProps {
  data: FileSummary | null;
  onClose: () => void;
}

export default function NodeDetailPanel({ data, onClose }: NodeDetailPanelProps) {
  if (!data) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-gray-900 border-l border-gray-700 p-5 overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium truncate">{data.file}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      {[
        { label: "Functions", items: data.functions, color: "text-yellow-300" },
        { label: "Classes", items: data.classes, color: "text-purple-300" },
        { label: "Imports", items: data.imports, color: "text-blue-300" },
      ].map(({ label, items, color }) => (
        <div key={label} className="mb-5">
          <p className="text-gray-400 text-xs mb-2">
            {label} ({items.length})
          </p>
          {items.length === 0 ? (
            <p className="text-gray-600 text-xs">None</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.map((item, i) => (
                <span
                  key={i}
                  className={`text-xs font-mono bg-gray-800 px-2 py-1 rounded ${color}`}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}