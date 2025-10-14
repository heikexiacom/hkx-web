import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { LocalStorage } from "../storage";

export function useUuid() {
  const [uuid, setUuid] = useState(nanoid());

  useEffect(() => {
    LocalStorage.set("uuid", uuid);
  }, [uuid]);

  const reset = () => {
    setUuid(nanoid());
  };
  return {
    uuid,
    reset,
  };
}
