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
        className={`max-w-3xl rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {message.sources && <SourceCard sources={message.sources} />}

        {message.follow_up_questions && message.follow_up_questions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Follow-up questions</p>
            <div className="flex flex-wrap gap-2">
              {message.follow_up_questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp?.(q)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-full transition"
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