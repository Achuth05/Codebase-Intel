import ReactMarkdown from "react-markdown";

export default function ArchitecturePanel({ readme }: { readme: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{readme}</ReactMarkdown>
      </div>
    </div>
  );
}