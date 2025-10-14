import { cozeChatApi, cancelChat, type chatSteamObject } from "@/api/ai";
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
  const [chatInfo, setChatInfo] = useState<{
    ID: string;
    bot_id: string;
    conversation_id: string;
    id: string;
    status: string;
  }>();
  const ctrlRef = useRef<AbortController | null>(null);
  const cleanup = () => {
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }
  };

  const reset = () => {
    setThink("");
    setAnswer("");
    setSuggestion([]);
    setChatid("");
    setChatInfo(undefined);
  };

  const run = async (data: {
    conversationId: string;
    question: string;
    fileIdOrUrl?: string;
  }) => {
    try {
      reset();
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
          if (event.event === "chatInfo" && d.type === "text") {
            setChatInfo(
              d.content as unknown as {
                ID: string;
                bot_id: string;
                conversation_id: string;
                id: string;
                status: string;
              }
            );
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

  const cancel = async () => {
    if (loading) {
      if (chatInfo) {
        try {
          cancelChat({
            chatId: chatInfo?.id || "",
            conversationId: chatInfo?.conversation_id || "",
          });
        } catch (error) {}
      }
      const t = think ? think + "\n---\n用户取消了请求" : "用户取消了请求";
      setThink(t);
      setAnswer(t);
      cleanup();
      setLoading(false);
    }
  };

  return {
    data: {
      chatid,
      think,
      answer,
      suggestion,
      chatInfo,
    },
    loading,
    run,
    cancel,
    reset,
  };
}
