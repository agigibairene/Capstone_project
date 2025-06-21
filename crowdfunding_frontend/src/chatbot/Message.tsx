import {  Bot } from "lucide-react";
import type { Messages } from "./ChatBot";


interface Props{
  chat: Messages
}

export default function Message({ chat }:Props) {
  return (
    <div
      className={`flex gap-3 ${
        chat.role === "user" ? "flex-col items-end" : "items-start"
      } ${chat.isError ? 'text-red-400' : ''}`}
    >
      {chat.role === "model" && (
        <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 self-end mb-0.5">
          <Bot size={18} className="text-white" />
        </div>
      )}
      <div
        className={`px-4 py-3 max-w-[75%] break-words whitespace-pre-line text-sm ${
          chat.role === "model"
            ? "bg-purple-50 text-gray-800 rounded-2xl rounded-bl-sm"
            : "bg-teal-600 text-white rounded-2xl rounded-br-sm"
        }`}
      >
        {chat.text}
      </div>
    </div>
  );
}