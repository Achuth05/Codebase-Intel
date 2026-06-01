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
  // Only add once — either function OR def, not both
  if (lower.includes("function") || lower.includes("def ")) 
    followUps.push("Where is this function called?");
  if (lower.includes("auth")) 
    followUps.push("How are the routes protected?");
  if (lower.includes("database") || lower.includes("db")) 
    followUps.push("What database models are defined?");
  // Final dedup just in case
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

    // Add empty assistant message that we'll fill in as chunks arrive
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", sources: [], follow_up_questions: undefined },
    ]);

    try {
      await askQuestionStream(
        repoName,
        q,
        // onChunk — append text to last message
        (text) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + text,
            };
            return updated;
          });
        },
        // onSources — set sources on last message
        (sources) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, sources };
            return updated;
          });
        },
        // onDone
        // onDone
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            const followUps = generateFollowUps(last.content);
            updated[updated.length - 1] = { ...last, follow_up_questions: followUps };
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
          updated[updated.length - 1] = {
            role: "assistant",
            content: errorMsg,
          };
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Chat</h1>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="repo name (e.g. micrograd)"
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-lg transition"
          >
            Clear memory
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 bg-red-900/30 border border-red-700 rounded-lg px-4 py-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-gray-500 text-sm">
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
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full transition"
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

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage(question)}
          placeholder="Ask anything about the codebase..."
          disabled={loading}
          className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(question)}
          disabled={loading || !question.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
    </AuthGuard>
  );
}