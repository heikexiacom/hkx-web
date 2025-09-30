import { useState } from "react";

import { App, Form, Input, Modal } from "antd";
import { object_xor, withMinDelay } from "@/utils";
import { useRequest } from "ahooks";
import { sceneUpdate, type sceneDetail } from "@/api/scene";

export default function useEditModal(props: { refresh: () => void }) {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<sceneDetail>();
  const { message } = App.useApp();
  const [scene, setScene] = useState<sceneDetail>();
  const edit = (d: sceneDetail) => {
    setVisible(true);
    setScene(d);
    form.setFieldsValue(d);
  };

  const editRequest = useRequest(withMinDelay(sceneUpdate, 1000), {
    manual: true,
    onSuccess: () => {
      message.success("保存成功");
      props.refresh();
    },
  });

  const submit = () => {
    const values = form.getFieldsValue();
    const [a] = object_xor(values, scene);
    if (Object.keys(a).length && scene?.id && a.sceneName) {
      editRequest
        .runAsync({
          id: scene?.id,
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
        <Form.Item label="名称" name="sceneName">
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
