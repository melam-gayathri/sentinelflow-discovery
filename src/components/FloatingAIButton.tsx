import { Brain } from "lucide-react";

const FloatingAIButton = () => {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-subtle hover:scale-110"
      aria-label="AI Chat Assistant"
    >
      <Brain className="h-6 w-6" />
    </button>
  );
};

export default FloatingAIButton;
