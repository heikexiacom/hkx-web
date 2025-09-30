import { LocalStorage } from "@/utils/storage";
import { atom } from "jotai";

const isLogin = atom(Boolean(LocalStorage.get("accessToken")));
const openLoginModal = atom(false);
export { isLogin, openLoginModal };
