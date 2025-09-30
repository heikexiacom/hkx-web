import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { userLogin } from "@/api/login";
import { Session, LocalStorage } from "@/utils/storage";
import { getMember } from "@/api/member";
import Verify from "../verify";
import type { VerifyRef } from "../verify";

type FieldType = {
  username: string;
  password: string;
  remember: boolean;
  verify: boolean;
};
export default function AccountLogin(props: {
  children?: React.ReactNode;
  onLoginSuccess?: () => void;
}) {
  const [form] = Form.useForm();
  const [uuid, setUuid] = useState(nanoid());
  const verify = Form.useWatch("verify", form);
  const verifyRef = useRef<VerifyRef>(null);

  const submit = useCallback(async () => {
    try {
      await form.validateFields(["username", "password"]);
    } catch (error) {
      return;
    }
    try {
      await form.validateFields(["verify"]);
    } catch (error) {
      verifyRef?.current?.open();
      return;
    }
    const values = form.getFieldsValue() as FieldType;

    try {
      const res = await userLogin({
        username: values.username,
        password: values.password,
      });
      if (form.getFieldValue("remember")) {
        LocalStorage.set("accessToken", res.accessToken);
        LocalStorage.set("refreshToken", res.refreshToken);
        getMember("LocalStorage");
      } else {
        Session.set("accessToken", res.accessToken);
        Session.set("refreshToken", res.refreshToken);
        getMember("Session");
      }

      message.success("登录成功");
      props.onLoginSuccess?.();
    } catch (error) {
      setUuid(nanoid());
      form.setFieldsValue({ verify: false });
    }
  }, [uuid, form, verifyRef]);

  useEffect(() => {
    LocalStorage.set("uuid", uuid);
  }, [uuid]);

  form.submit = submit;
  return (
    <Form
      name="accountLogin"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      style={{ maxWidth: 250 }}
      initialValues={{ remember: true }}
      form={form}
    >
      <Form.Item<FieldType>
        label={null}
        name="username"
        rules={[{ required: true, message: "请填写账号" }]}
        className="m-b-12px"
      >
        <Input placeholder="账号" />
      </Form.Item>
      <Form.Item<FieldType>
        label={null}
        name="password"
        className="m-b-12px"
        rules={[
          {
            required: true,
            pattern: /^[a-zA-Z0-9_]{6,}$/,
            message: "请输入正确格式密码",
          },
        ]}
      >
        <Input.Password placeholder="密码" />
      </Form.Item>
      <div className="flex flex-row justify-between">
        <Form.Item<FieldType>
          label={null}
          name="verify"
          valuePropName="checked"
          className="m-b-12px"
          rules={[
            {
              required: true,
              validator(_, value, callback) {
                if (value) {
                  callback();
                } else {
                  callback("请完成校验");
                }
              },
              message: "请完成校验",
            },
          ]}
        >
          <Verify
            verification="LOGIN"
            ref={verifyRef}
            value={verify}
            onChange={() => {
              form.setFieldsValue({ verify: true });
              form.validateFields(["username", "password"]).then(() => {
                form.submit();
              });
            }}
          />
        </Form.Item>

        <Form.Item<FieldType>
          name="remember"
          valuePropName="checked"
          label={null}
          className="m-b-12px"
        >
          <Checkbox>记住登录状态</Checkbox>
        </Form.Item>
      </div>
      {props.children}
      <Form.Item label={null} className="m-b-0">
        <Button type="primary" className="w-100p" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
