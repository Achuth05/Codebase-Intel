"use client";
import { useState, useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import LoadingSpinner from "@/components/LoadingSpinner";
import { askQuestionStream, resetMemory } from "@/services/api";
import { Message } from "@/types/api";
import AuthGuard from "@/components/AuthGuard";

function generateFollowUps(answer: string): string[] {
  const followUps: string[] = [];
  const lower = answer.toLowerCase();
  if (lower.includes("class"))
    followUps.push("What methods does this class have?");
  if (lower.includes("import"))
    followUps.push("Which other files use this import?");
  if (lower.includes("function") || lower.includes("def "))
    followUps.push("Where is this function called?");
  if (lower.includes("auth"))
    followUps.push("How are the routes protected?");
  if (lower.includes("database") || lower.includes("db"))
    followUps.push("What database models are defined?");
  return [...new Set(followUps)].slice(0, 3);
}

export default function ChatPage() {
  const [repoName, setRepoName] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (q: string) => {
    if (!repoName.trim()) {
      setError("Please enter a repo name first.");
      return;
    }
    if (!q.trim()) return;

    setError("");
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", sources: [], follow_up_questions: undefined },
    ]);

    try {
      await askQuestionStream(
        repoName, q,
        (text) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + text };
            return updated;
          });
        },
        (sources) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, sources };
            return updated;
          });
        },
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, follow_up_questions: generateFollowUps(last.content) };
            return updated;
          });
          setLoading(false);
        }
      );
    } catch (e: any) {
      const errorMsg = e.message?.includes("404")
        ? "Repo not found. Please ingest it first."
        : e.message?.includes("500")
        ? "Server error. Check if the backend is running."
        : "Network error: " + (e.message || "Something went wrong");

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: errorMsg };
        return updated;
      });
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!repoName) return;
    await resetMemory(repoName);
    setMessages([]);
    setError("");
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto flex flex-col h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="repo name (e.g. micrograd)"
              className="bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400 shadow-sm"
            />
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition shadow-sm"
            >
              Clear memory
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-slate-400 text-sm">
                Enter a repo name above and ask anything about the codebase.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "How does this codebase work?",
                  "What are the main classes?",
                  "How is authentication handled?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-3 py-2 rounded-full transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={`${i}-${msg.role}-${msg.content.slice(0, 10)}`}
              message={msg}
              onFollowUp={(q) => sendMessage(q)}
            />
          ))}

          {loading && messages[messages.length - 1]?.content === "" && (
            <LoadingSpinner />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage(question)}
            placeholder="Ask anything about the codebase..."
            disabled={loading}
            className="flex-1 bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400 shadow-sm disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(question)}
            disabled={loading || !question.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}