import { useState } from "react";

import { designUpdate, type designDetail } from "@/api/design";
import { App, Form, Input, Modal } from "antd";
import { object_xor, withMinDelay } from "@/utils";
import { useRequest } from "ahooks";

export default function useEditModal(props: { refresh: () => void }) {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<designDetail>();
  const { message } = App.useApp();
  const [design, setDesign] = useState<designDetail>();
  const edit = (d: designDetail) => {
    setVisible(true);
    setDesign(d);
    form.setFieldsValue(d);
  };

  const editRequest = useRequest(withMinDelay(designUpdate, 1000), {
    manual: true,
    onSuccess: () => {
      message.success("保存成功");
      props.refresh();
    },
  });

  const submit = () => {
    const values = form.getFieldsValue();
    const [a] = object_xor(values, design);

    if (Object.keys(a).length && design?.id && a.name) {
      editRequest
        .runAsync({
          id: design?.id,
          ...a,
        })
        .then(() => {
          setVisible(false);
        });
    } else {
      setVisible(false);
    }
  };

  const node = (
    <Modal
      onCancel={() => setVisible(false)}
      open={visible}
      title="编辑"
      maskClosable
      width={500}
      okText="保存"
      cancelText="取消"
      confirmLoading={editRequest.loading}
      onOk={submit}
    >
      <Form form={form}>
        <Form.Item label="设计名称" name="name">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );

  return {
    edit,
    node,
  };
}
