"use client";
import { useState } from "react";

interface RepoInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  placeholder?: string;
  buttonText?: string;
}

export default function RepoInput({
  onSubmit,
  loading,
  placeholder = "https://github.com/user/repo",
  buttonText = "Analyze",
}: RepoInputProps) {
  const [url, setUrl] = useState("");

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && url && onSubmit(url)}
        placeholder={placeholder}
        className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400"
      />
      <button
        onClick={() => onSubmit(url)}
        disabled={loading || !url}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
      >
        {loading ? "Loading..." : buttonText}
      </button>
    </div>
  );
}