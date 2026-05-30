interface GraphControlsProps {
  onFilter: (lang: string) => void;
  onSearch: (query: string) => void;
  activeFilter: string;
}

export default function GraphControls({
  onFilter,
  onSearch,
  activeFilter,
}: GraphControlsProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <input
        type="text"
        placeholder="Search files..."
        onChange={(e) => onSearch(e.target.value)}
        className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      />
      <div className="flex gap-2">
        {["all", "py", "ts", "js", "md"].map((lang) => (
          <button
            key={lang}
            onClick={() => onFilter(lang)}
            className={`text-xs px-3 py-2 rounded-lg transition ${
              activeFilter === lang
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {lang === "all" ? "All" : `.${lang}`}
          </button>
        ))}
      </div>
    </div>
  );
}