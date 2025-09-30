import { useState, useRef } from "react";
import { LocalStorage } from "../storage";
import {
  fetchEventSource,
  type EventSourceMessage,
} from "@microsoft/fetch-event-source";

export default function useSSE<Payload>(
  url: string,
  options?: {
    method?: "POST" | "GET";
    onOpen?: (response: Response) => void;
    onComplete?: (msgs: EventSourceMessage[]) => void;
  }
) {
  const [data, setData] = useState<EventSourceMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // 使用 useRef 存储 AbortController，避免闭包问题
  const ctrlRef = useRef<AbortController | null>(null);
  const cleanup = () => {
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }
  };

  const run = async (params: Payload) => {
    try {
      // 先清理之前的连接
      cleanup();

      // 创建新的 AbortController
      const newCtrl = new AbortController();
      ctrlRef.current = newCtrl;

      setLoading(true);
      setData([]); // 重置数据

      let fetchUrl = url;
      if (options?.method === "GET") {
        fetchUrl +=
          "?" +
          new URLSearchParams(params as Record<string, string>).toString();
      }

      const events: EventSourceMessage[] = [];
      await fetchEventSource(fetchUrl, {
        method: options?.method || "POST",
        signal: newCtrl.signal,
        headers: {
          AccessToken: LocalStorage.get("accessToken") || "",
          "Content-Type": "application/json",
        },
        body: options?.method === "GET" ? undefined : JSON.stringify(params),
        async onopen(response) {
          options?.onOpen?.(response);
        },
        onmessage(event) {
          events.push(event);
          setData((prev) => [...prev, event]);
        },
        onerror(error) {
          console.error("SSE onerror:", error);
          setLoading(false);
          cleanup();
        },
        onclose() {
          setLoading(false);
          // 正确获取最新的 data 状态
          setData((currentData) => {
            options?.onComplete?.(currentData);
            return currentData;
          });
          cleanup();
        },
      });
      return events;
    } catch (error) {
      console.error("SSE error:", error);
      setLoading(false);
      cleanup();
    }
  };

  const cancel = () => {
    cleanup();
    setLoading(false);
  };

  return {
    data,
    loading,
    run,
    cancel,
  };
}
