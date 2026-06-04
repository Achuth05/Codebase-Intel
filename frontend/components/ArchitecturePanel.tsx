import ReactMarkdown from "react-markdown";

export default function ArchitecturePanel({ readme }: { readme: string }) {
  return (
    <div className="prose prose-slate prose-sm max-w-none
      prose-headings:text-slate-900 prose-headings:font-semibold
      prose-p:text-slate-600 prose-p:leading-relaxed
      prose-li:text-slate-600
      prose-strong:text-slate-800
      prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
      prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-xl
      prose-blockquote:border-indigo-200 prose-blockquote:text-slate-500
      prose-hr:border-slate-200">
      <ReactMarkdown>{readme}</ReactMarkdown>
    </div>
  );
}