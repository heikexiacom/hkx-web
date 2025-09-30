import { getMember } from "@/api/member";
import { LocalStorage, Session } from "./storage";
import mime from "mime";

export function checkWebUrl(url?: string) {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function setClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export function object_xor<T>(a: T, b: T) {
  const result = {
    a: {} as Record<string, any>,
    b: {} as Record<string, any>,
  };

  // 检查a中的键
  if (a && typeof a === "object") {
    Object.keys(a).forEach((key) => {
      // 如果键不在b中，或者值不同，添加到a的结果中
      if (
        !b ||
        typeof b !== "object" ||
        !(key in b) ||
        a[key as keyof T] !== b[key as keyof T]
      ) {
        result.a[key] = a[key as keyof T];
      }
    });
  }

  // 检查b中的键
  if (b && typeof b === "object") {
    Object.keys(b).forEach((key) => {
      // 如果键不在a中，或者值不同，添加到b的结果中
      if (
        !a ||
        typeof a !== "object" ||
        !(key in a) ||
        b[key as keyof T] !== a[key as keyof T]
      ) {
        result.b[key] = b[key as keyof T];
      }
    });
  } else if (b && typeof b !== "object") {
    // 如果b不是对象，直接添加到b的结果中
    result.b = b;
  }

  return [result.a, result.b];
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withMinDelay<T extends any[], R = void>(
  cb: (...args: T) => Promise<R> | R,
  waitTime = 3000
) {
  return async (...p: T): Promise<R> => {
    const n = Date.now();
    const res = await cb(...p);
    const t = Date.now() - n;
    if (t < waitTime) {
      await sleep(waitTime - t);
    }
    return res;
  };
}

export function logout() {
  Session.remove("token");
  Session.remove("accessToken");
  Session.remove("refreshToken");
  Session.remove("userInfo");
  LocalStorage.remove("hideStageTip");
  LocalStorage.remove("uuid");
  LocalStorage.remove("accessToken");
  LocalStorage.remove("refreshToken");
  LocalStorage.remove("userInfo");
  window.location.href = "/home";
}

export function hiddenPhone(phone?: string) {
  if (!phone) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

export const downloadUrlFile = (
  url: string,
  filename = "下载",
  fileType?: string
) => {
  return new Promise<Boolean>((resolve, reject) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(new Blob([blob]));
        const type = fileType
          ? fileType.replace(/^\./, "")
          : mime.getExtension(mime.getType(url) || blob.type || "image/jpeg");
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename + "." + type;
        document.body.appendChild(link);
        link.click();

        URL.revokeObjectURL(blobUrl);
        link.remove();
        resolve(true);
      })
      .catch(reject)
      .catch(reject);
  });
};

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString());
      } else {
        reject(new Error("转换失败"));
      }
    };
  });
}

export function base64ToBlob(base64: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const [, data] = base64.split(",");
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: mime.getType(base64) || "image/jpeg",
    });
    resolve(blob);
  });
}

export async function handleLogin(
  props: {
    accessToken: string;
    refreshToken: string;
  },
  remember: "Session" | "LocalStorage" = "LocalStorage"
) {
  if (remember) {
    LocalStorage.set("accessToken", props.accessToken);
    LocalStorage.set("refreshToken", props.refreshToken);
  } else {
    Session.set("accessToken", props.accessToken);
    Session.set("refreshToken", props.refreshToken);
  }
  await getMember(remember);
}

export function gcd(a: number, b: number) {
  if (b === 0) return a;
  if (a === 0) return b;

  // 确保a和b都是非负数
  a = Math.abs(a);
  b = Math.abs(b);

  // 核心算法：当b不为0时，不断计算a%b并交换a和b的值
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

export function getMapName(url?: string) {
  if (!url) {
    return "";
  }
  const u = new URL(url);
  const parts = u.pathname.split(/[\/-]/g);
  return parts[parts.length - 3] || "";
}
