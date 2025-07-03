import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface LoadingMessage {
  message: string;
  duration: number; // milliseconds
}

export function useDynamicLoading(messages: LoadingMessage[]) {
  const [currentMessage, setCurrentMessage] = useState(
    messages[0]?.message || "",
  );
  const toastIdRef = useRef<string | number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    // Reset to first message
    setCurrentMessage(messages[0]?.message || "");

    // Create initial toast
    toastIdRef.current = toast.loading(
      messages[0]?.message || "Processando...",
    );

    // Start cycling through messages
    let index = 0;
    const cycleMessages = () => {
      index = (index + 1) % messages.length;
      const nextMessage = messages[index];

      if (toastIdRef.current && nextMessage) {
        setCurrentMessage(nextMessage.message);
        toast.loading(nextMessage.message, { id: toastIdRef.current });

        timeoutRef.current = setTimeout(cycleMessages, nextMessage.duration);
      }
    };

    if (messages.length > 1 && messages[0]) {
      timeoutRef.current = setTimeout(cycleMessages, messages[0].duration);
    }

    return toastIdRef.current;
  };

  const stop = (success: boolean = true, finalMessage?: string) => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Update toast with final message
    if (toastIdRef.current) {
      if (success) {
        toast.success(finalMessage || "Concluído!", { id: toastIdRef.current });
      } else {
        toast.error(finalMessage || "Erro ao processar", {
          id: toastIdRef.current,
        });
      }
      toastIdRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { start, stop, currentMessage };
}
