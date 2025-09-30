import { LocalStorage } from "./storage";

let otherWindow: Window | null = null;

const handleMessage = (e: MessageEvent) => {
  if (e.data.handleMsg === "ready" || e.data.k === "load") {
    otherWindow?.postMessage?.(
      { k: "setToken", v: LocalStorage.get("accessToken") },
      "*"
    );
    otherWindow?.postMessage?.(
      {
        k: "setUserInfo",
        v: JSON.stringify(LocalStorage.get("userInfo") || {}),
      },
      "*"
    );
  }
};

window.addEventListener("message", handleMessage);
window.oncancel = () => {
  window.removeEventListener("message", handleMessage);
};
window.onclose = () => {
  window.removeEventListener("message", handleMessage);
};
export function openDesign(id: string) {
  otherWindow = window.open(
    import.meta.env.VITE_APP_DESIGN_URL + "/buyer-design?id=" + id,
    "_blank"
  );
}

export function openScene(id: string) {
  otherWindow = window.open(
    import.meta.env.VITE_APP_DESIGN_URL + "/render?id=" + id,
    "_blank"
  );
}
