import { Bot } from "lucide-react";
import type { Messages } from "./ChatBot";

interface Props {
  chat: Messages;
}

export default function Message({ chat }: Props) {
  return (
    <div
      className={`flex gap-2 md:gap-3 ${
        chat.role === "user" ? "flex-col items-end" : "items-start"
      } ${chat.isError ? 'text-red-400' : ''}`}
    >
      {chat.role === "model" && (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 self-end mb-0.5">
          <Bot size={16} className="text-white md:w-[18px] md:h-[18px]" />
        </div>
      )}
      <div
        className={`px-3 py-2 md:px-4 md:py-3 max-w-[85%] md:max-w-[75%] break-words whitespace-pre-line text-sm ${
          chat.role === "model"
            ? "bg-purple-50 text-gray-800 rounded-2xl rounded-bl-sm"
            : "bg-bgColor text-white rounded-2xl rounded-br-sm"
        }`}
      >
        {chat.text}
      </div>
    </div>
  );
}