import { Modal, Typography } from "antd";
import React, { useState } from "react";
import "./index.scss";
export default function index(props: { children?: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  return (
    <>
      <Modal
        title="用户协议"
        open={visible}
        onOk={close}
        onCancel={close}
        footer={null}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          margin: 0,
          padding: 0,
          maxWidth: "100%",
        }}
        className="w-screen! h-screen! agreement-modal"
      >
        <Typography>用户协议</Typography>
      </Modal>
      <span onClick={() => setVisible(true)}>{props.children}</span>
    </>
  );
}
