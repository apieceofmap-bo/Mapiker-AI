"use client";

import Image from "next/image";
import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-[#37352f] text-white rounded-br-sm"
            : "bg-[#f7f6f3] text-[#37352f] rounded-bl-sm"
        }`}
      >
        {!isUser && (
          <div className="mb-1">
            <Image src="/logo.png" alt="Mapiker-AI" width={80} height={22} />
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
