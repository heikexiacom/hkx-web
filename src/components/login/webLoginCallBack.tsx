import { webLoginCallback } from "@/api/login";
import { getMember } from "@/api/member";
import { LocalStorage } from "@/utils/storage";
import { message } from "antd";
import { useEffect } from "react";

export default function WebLoginCallBack() {
  useEffect(() => {
    const urlState = new URLSearchParams(window.location.search);
    const state = urlState.get("state");
    if (state) {
      webLoginCallback({ state })
        .then((res) => {
          LocalStorage.set("accessToken", res.accessToken);
          LocalStorage.set("refreshToken", res.refreshToken);
          getMember("LocalStorage");
          message.success("登录成功");
        })
        .finally(() => {
          urlState.delete("state");
          window.location.search = urlState.toString();
        });
    }
  }, []);
  return <></>;
}
