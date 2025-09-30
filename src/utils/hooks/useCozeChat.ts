import { cozeChatApi, type chatSteamObject } from "@/api/ai";
import { useRef, useState } from "react";
import {
  fetchEventSource,
  type EventSourceMessage,
} from "@microsoft/fetch-event-source";
import { LocalStorage } from "../storage";

export function useCozeChat() {
  const [think, setThink] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string[]>([]);
  const [chatid, setChatid] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const ctrlRef = useRef<AbortController | null>(null);
  const cleanup = () => {
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }
  };

  const resetValues = () => {
    setThink("");
    setAnswer("");
    setSuggestion([]);
    setChatid("");
  };

  const run = async (data: {
    conversationId: string;
    question: string;
    fileIdOrUrl?: string;
  }) => {
    try {
      resetValues();
      // 先清理之前的连接
      cleanup();

      // 创建新的 AbortController
      const newCtrl = new AbortController();
      ctrlRef.current = newCtrl;

      setLoading(true);
      const events: EventSourceMessage[] = [];
      await fetchEventSource(cozeChatApi, {
        method: "POST",
        signal: newCtrl.signal,
        headers: {
          AccessToken: LocalStorage.get("accessToken") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        onmessage(event) {
          events.push(event);
          const d = JSON.parse(event.data) as chatSteamObject;
          if (event.event === "chatid" && d.type === "text") {
            setChatid(d.content);
          }
          if (event.event === "think") {
            if (d.type === "text") setThink((prev) => prev + d.content);
          }
          if (event.event === "answer") {
            if (d.type === "text") setAnswer(d.content);
          }
          if (event.event === "suggestion") {
            if (d.type === "text")
              setSuggestion((prev) => [...prev, d.content]);
          }
        },
        onerror(error) {
          console.error("SSE onerror:", error);
          setLoading(false);
          cleanup();
        },
        onclose() {
          setLoading(false);
          cleanup();
        },
      });
      return events;
    } catch (error) {
      setLoading(false);
      cleanup();
    }
  };

  const cancel = () => {
    cleanup();
    setLoading(false);
  };

  return {
    data: {
      chatid,
      think,
      answer,
      suggestion,
    },
    loading,
    run,
    cancel,
    resetValues,
  };
}
