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
        placeholder={placeholder}
        className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={() => onSubmit(url)}
        disabled={loading || !url}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
      >
        {loading ? "Loading..." : buttonText}
      </button>
    </div>
  );
}