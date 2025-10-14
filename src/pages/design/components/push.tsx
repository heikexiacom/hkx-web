import { designClone, type designDetail } from "@/api/design";
import { withMinDelay } from "@/utils";
import { useRequest } from "ahooks";
import { Input, Modal } from "antd";
import useApp from "antd/es/app/useApp";
import { useState } from "react";

export default function usePushModal() {
  const [visible, setVisible] = useState(false);
  const [design, setDesign] = useState<designDetail>();
  const [input, setInput] = useState("");

  const push = (d: designDetail) => {
    if (d.id !== design?.id) {
      setDesign(d);
    }
    setInput("");

    setVisible(true);
  };

  const { message } = useApp();

  const pushRequest = useRequest(withMinDelay(designClone), {
    manual: true,
  });

  const onSubmit = async () => {
    if (!design) {
      return;
    }
    const phoneReg = /^1[3456789]\d{9}$/;
    if (!phoneReg.test(input)) {
      message.error("请输入正确的手机号");
      return;
    }
    await pushRequest.runAsync({
      id: design.id,
      phone: input,
    });
    message.success("推送成功");
    setVisible(false);
    setInput("");
  };

  const node = (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      title="推送给他人"
      maskClosable
      confirmLoading={pushRequest.loading}
      onOk={onSubmit}
      okText="推送"
      cancelText="取消"
      width={500}
    >
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="请输入手机号"
        maxLength={11}
      />
    </Modal>
  );

  return {
    node,
    push,
  };
}
