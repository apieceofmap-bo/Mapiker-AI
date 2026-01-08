"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType, Requirements } from "@/lib/types";
import { sendChatMessage } from "@/lib/api";
import ChatMessage from "./ChatMessage";

const INITIAL_MESSAGE: ChatMessageType = {
  role: "assistant",
  content:
    "Hi! I'm Mapiker-AI, here to help you find the right map products for your project.\n\nWhat kind of service are you looking to build using maps products?\n\nExamples: Food delivery, Ride-hailing, Logistics, Fleet management, Store locator, etc.",
};

interface ChatWindowProps {
  onComplete: (requirements: Requirements) => void;
  onStateChange?: (state: {
    messages: ChatMessageType[];
    requirements: Requirements | null;
    isComplete: boolean;
  }) => void;
  initialMessages?: ChatMessageType[];
  initialRequirements?: Requirements | null;
  initialIsComplete?: boolean;
}

export default function ChatWindow({
  onComplete,
  onStateChange,
  initialMessages,
  initialRequirements,
  initialIsComplete,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(
    initialMessages || [INITIAL_MESSAGE]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(initialIsComplete || false);
  const [requirements, setRequirements] = useState<Requirements | null>(
    initialRequirements || null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Notify parent of state changes for session persistence
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ messages, requirements, isComplete });
    }
  }, [messages, requirements, isComplete, onStateChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    const newMessages: ChatMessageType[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage, messages);

      // Add assistant response
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.reply },
      ]);

      // Check if requirements are complete
      if (response.is_complete && response.extracted_requirements) {
        console.log("=== Requirements extracted from chat ===");
        console.log("extracted_requirements:", JSON.stringify(response.extracted_requirements, null, 2));
        setIsComplete(true);
        setRequirements(response.extracted_requirements);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      // Auto-focus input after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleProceed = () => {
    if (requirements) {
      onComplete(requirements);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl">🗺️</span>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">Mapiker-AI</h2>
          <p className="text-xs text-gray-500">Tell me about your project</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Requirements Summary */}
      {isComplete && requirements && (
        <div className="mx-4 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">✓</span>
            <span className="font-medium text-green-800">Requirements captured!</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>
              <strong>Use Case:</strong> {requirements.use_case}
            </p>
            <p>
              <strong>Platform:</strong> {requirements.application}
            </p>
            <p>
              <strong>Region:</strong> {requirements.region}
            </p>
            <p>
              <strong>Features:</strong> {requirements.required_features.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Chat input - always visible */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isComplete ? "Type to modify requirements..." : "Type your message..."}
            disabled={isLoading}
            autoFocus
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>

        {/* Proceed button - only visible when complete */}
        {isComplete && (
          <button
            onClick={handleProceed}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            View Recommended Products
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
