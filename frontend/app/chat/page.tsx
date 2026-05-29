"use client";
import { useState, useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import LoadingSpinner from "@/components/LoadingSpinner";
import { askQuestion, resetMemory } from "@/services/api";
import { Message } from "@/types/api";

export default function ChatPage() {
  const [repoName, setRepoName] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (q: string) => {
    if (!repoName || !q.trim()) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const data = await askQuestion(repoName, q);
      const assistantMsg: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        follow_up_questions: data.follow_up_questions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + (e.response?.data?.detail || "Something went wrong") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!repoName) return;
    await resetMemory(repoName);
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[85vh]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Chat</h1>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="repo name (e.g. fastapi)"
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

      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">Enter a repo name and ask anything about the codebase.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onFollowUp={(q) => sendMessage(q)}
          />
        ))}
        {loading && <LoadingSpinner />}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(question)}
          placeholder="Ask anything about the codebase..."
          className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => sendMessage(question)}
          disabled={loading || !question.trim() || !repoName}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}