import { useDebounceEffect, useSet } from "ahooks";
import { Modal, type ModalProps } from "antd";
import { useLayoutEffect, useRef, useState } from "react";

export default function IframeModal<T>(props: {
  url?: string;
  urlFun?: (data: T | undefined) => string;
  modalProps?: ModalProps;
  onOk?: (data: T | undefined) => Promise<void>;
  handleMsg?: (data: any) => void;
}) {
  const { url, urlFun, modalProps, onOk, handleMsg } = props;
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<T>();
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useSet();
  const iframeUrl = new URL(url ?? urlFun?.(data) ?? "");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const open = (data: T) => {
    setData(data);
    setVisible(true);
  };

  const postMessage = (data: any) => {
    setMsg.add(data);
  };

  useDebounceEffect(() => {
    if (ready && iframeRef.current) {
      msg.forEach((item) => {
        iframeRef.current?.contentWindow?.postMessage(item, "*");
      });
      setMsg.reset();
    }
  }, [ready, msg]);

  const handleMessage = (e: MessageEvent) => {
    if (e.origin !== iframeUrl.origin) return;

    if (e.data.handleMsg === "ready" || e.data.k === "load") {
      setReady(true);
    } else if (handleMsg) {
      handleMsg(e.data);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const node = (
    <Modal
      open={visible}
      onCancel={() => {
        setVisible(false);
      }}
      onOk={async () => {
        if (onOk) {
          await onOk(data);
        }
        setVisible(false);
      }}
      {...modalProps}
      height={modalProps?.height ?? 500}
      footer={null}
    >
      <iframe
        ref={iframeRef}
        src={iframeUrl.href}
        className="w-full h-full"
        style={{
          height: modalProps?.height ?? "auto",
        }}
      />
    </Modal>
  );

  return {
    open,
    node,
    postMessage,
  };
}
