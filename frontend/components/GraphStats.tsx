import { GraphStatsData } from "@/types/graph";

export default function GraphStats({ data }: { data: GraphStatsData }) {
  return (
    <div className="bg-gray-800 rounded-lg p-5">
      <h3 className="text-white font-medium mb-4">Most Imported Modules</h3>
      <div className="space-y-3">
        {data.most_imported.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-gray-400 text-xs w-4">{i + 1}</span>
            <span className="text-blue-300 font-mono text-sm flex-1">{item.module}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{
                  width: `${Math.min((item.imported_by / data.most_imported[0].imported_by) * 120, 120)}px`,
                }}
              />
              <span className="text-gray-400 text-xs">{item.imported_by}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}