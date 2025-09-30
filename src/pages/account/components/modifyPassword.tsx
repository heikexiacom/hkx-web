import { updateMemberPassword } from "@/api/member";
import { Form, Input, Modal } from "antd";
import useApp from "antd/es/app/useApp";
import react, { useState } from "react";

export default function ModifyPassword() {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const open = () => {
    setVisible(true);
  };

  const { message } = useApp();
  const onOk = async () => {
    const validate = await form.validateFields();
    console.log(validate);
    if (!validate) {
      return;
    }
    const values = form.getFieldsValue();
    if (values.newPassword !== values.confirmPassword) {
      message.error("两次输入密码不一致");
      return;
    }

    try {
      await updateMemberPassword(values);
      message.success("修改成功");
      setVisible(false);
    } catch (error) {}
  };

  const node = (
    <Modal
      title="修改密码"
      open={visible}
      onOk={onOk}
      maskClosable
      onCancel={() => setVisible(false)}
      width={300}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          name="password"
          label="旧密码"
          rules={[
            { required: true, message: "请输入旧密码" },
            { min: 6, message: "密码长度不能小于6位" },
          ]}
        >
          <Input.Password autoComplete="false" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码长度不能小于6位" },
          ]}
        >
          <Input.Password autoComplete="false" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认密码"
          rules={[
            { required: true, message: "请输入确认密码" },
            { min: 6, message: "密码长度不能小于6位" },
          ]}
        >
          <Input.Password autoComplete="false" />
        </Form.Item>
      </Form>
    </Modal>
  );

  return {
    open,
    node,
  };
}
