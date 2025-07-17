import { useRef, useState, type JSX } from 'react';
import type { Messages } from './ChatBot'

interface BotFormProps {
  chatHistory: Messages[];
  setChatHistory: (updater: (prev: Messages[]) => Messages[]) => void; 
  generateBotResponse: (history: Messages[]) => Promise<void>;
  onUserActivity?: () => void;
}

export default function BotForm({
  chatHistory,
  setChatHistory,
  generateBotResponse,
  onUserActivity
}: BotFormProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const triggerUserActivity = () => {
    if (onUserActivity) {
      onUserActivity();
    }
  };

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const userMessage = inputValue.trim();

    if (!userMessage) return;

    triggerUserActivity();

    setInputValue("");
    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
    ]);

    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Typing..." },
      ]);
      generateBotResponse([
        ...chatHistory,
        { role: "user", text: userMessage },
      ]);
    }, 600);
  }

  const isInputEmpty = inputValue.trim() === "";

  return (
    <div className="flex items-center bg-white/20 backdrop-blur-sm border-r border-white/30 rounded-lg focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent shadow-sm">
      <input
        className="flex-1 border-none outline-none bg-transparent h-10 md:h-12 px-3 md:px-4 text-sm placeholder-gray-500 min-w-0"
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value);
          triggerUserActivity();
        }}
        onFocus={triggerUserActivity}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && !isInputEmpty) {
            handleFormSubmit(e);
          }
        }}
        placeholder="Type your message..."
      />
      <button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          handleFormSubmit(e as any);
        }}
        disabled={isInputEmpty}
        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center mr-2 transition-all duration-200 flex-shrink-0 ${
          isInputEmpty
            ? "bg-gray-300 cursor-not-allowed opacity-50"
            : "bg-bgColor hover:bg-teal-700 hover:scale-105 active:scale-95 cursor-pointer"
        }`}
      >
        <div className={`${isInputEmpty ? "text-gray-500" : "text-limeTxt"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
        </div>
      </button>
    </div>
  );
}