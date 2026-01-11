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
      <div className="flex items-center gap-3 p-4 border-b border-[#e9e9e7]">
        <div className="w-9 h-9 bg-[#f7f6f3] rounded-full flex items-center justify-center">
          <span className="text-lg">🗺️</span>
        </div>
        <div>
          <h2 className="font-semibold text-[#37352f] text-sm">Mapiker-AI</h2>
          <p className="text-xs text-[#9b9a97]">Tell me about your project</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#f7f6f3] rounded-lg rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#9b9a97] rounded-full animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 bg-[#9b9a97] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-[#9b9a97] rounded-full animate-bounce"
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
        <div className="mx-4 mb-4 p-4 bg-[rgba(15,123,108,0.08)] border border-[rgba(15,123,108,0.2)] rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#0f7b6c]">✓</span>
            <span className="font-medium text-[#0f7b6c] text-sm">Requirements captured!</span>
          </div>
          <div className="text-sm text-[#0f7b6c] space-y-1">
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
      <div className="p-4 border-t border-[#e9e9e7] space-y-3">
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
            className="flex-1 px-3 py-2.5 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] disabled:bg-[#f7f6f3] text-[#37352f] placeholder:text-[#9b9a97] text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </form>

        {/* Proceed button - only visible when complete */}
        {isComplete && (
          <button
            onClick={handleProceed}
            className="w-full py-2.5 bg-[#0f7b6c] text-white rounded-md font-medium hover:bg-[#0a6459] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            View Recommended Products
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
