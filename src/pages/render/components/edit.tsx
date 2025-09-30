import { useState } from "react";

import { App, Form, Input, Modal } from "antd";
import { object_xor, withMinDelay } from "@/utils";
import { useRequest } from "ahooks";
import { renderUpdateRenderName, type renderDetail } from "@/api/render";

export default function useEditModal(props: { refresh: () => void }) {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<renderDetail>();
  const { message } = App.useApp();
  const [render, setRender] = useState<renderDetail>();
  const edit = (d: renderDetail) => {
    setVisible(true);
    setRender(d);
    form.setFieldsValue(d);
  };

  const editRequest = useRequest(withMinDelay(renderUpdateRenderName, 1000), {
    manual: true,
    onSuccess: () => {
      message.success("保存成功");
      props.refresh();
    },
  });

  const submit = () => {
    const values = form.getFieldsValue();
    const [a] = object_xor(values, render);
    if (Object.keys(a).length && render?.renderId && a.picName) {
      editRequest
        .runAsync({
          renderId: render?.renderId,
          picName: a.picName,
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
        <Form.Item label="名称" name="picName">
          <Input placeholder="请输入名称" />
        </Form.Item>
      </Form>
    </Modal>
  );

  return {
    edit,
    node,
  };
}
