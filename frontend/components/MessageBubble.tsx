import { Message } from "@/types/api";
import SourceCard from "./SourceCard";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
  onFollowUp?: (question: string) => void;
}

export default function MessageBubble({ message, onFollowUp }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
            : "bg-white border border-slate-200 text-slate-800 shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-slate prose-sm max-w-none
            prose-headings:text-slate-900 prose-headings:font-semibold
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-li:text-slate-700
            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
            prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-xl">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {message.sources && <SourceCard sources={message.sources} />}

        {message.follow_up_questions && message.follow_up_questions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-2 font-medium">Follow-up questions</p>
            <div className="flex flex-wrap gap-2">
              {message.follow_up_questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp?.(q)}
                  className="text-xs bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-full transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}