import { useAtom, useAtomValue } from "jotai";
import { isLogin, openLoginModal } from "@/store";
export default function useLogin() {
  const login = useAtomValue(isLogin);
  const [loginModal, setOpenLoginModal] = useAtom(openLoginModal);
  const openModal = () => {
    if (!loginModal) setOpenLoginModal(true);
  };

  return {
    ready: login,
    reset: openModal,
  };
}
