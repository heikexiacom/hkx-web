import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { smsLogin, getSmsCode } from "@/api/login";
import { Session, LocalStorage } from "@/utils/storage";
import { useCountDown } from "ahooks";
import { getMember } from "@/api/member";
import Verify from "../verify";
import type { VerifyRef } from "../verify";

type FieldType = {
  mobile: string;
  code: string;
  sendStatus: boolean;
  remember: boolean;
  verify: boolean;
};
export default function CodeLogin(props: {
  children?: React.ReactNode;
  onLoginSuccess?: () => void;
}) {
  const [form] = Form.useForm();
  const [uuid, setUuid] = useState(nanoid());
  const verify = Form.useWatch("verify", form);
  const sendStatus = Form.useWatch("sendStatus", form);

  const verifyRef = useRef<VerifyRef>(null);
  const [targetDate, setTargetDate] = useState<number>();

  const [countdown, countdown2] = useCountDown({
    targetDate,
    onEnd: () => {
      form.setFieldValue("sendStatus", false);
    },
  });

  useEffect(() => {
    LocalStorage.set("uuid", uuid);
  }, [uuid]);

  const submit = useCallback(async () => {
    try {
      await form.validateFields(["mobile", "code"]);
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
      const res = await smsLogin({
        mobile: values.mobile,
        code: values.code,
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

  const openVerify = useCallback(async () => {
    try {
      await form.validateFields(["mobile"]);
      setUuid(nanoid());
    } catch (error) {
      return;
    }
    verifyRef?.current?.open();
  }, [form, verifyRef]);

  const sendCode = useCallback(async () => {
    try {
      await form.validateFields(["mobile"]);
    } catch (error) {
      return;
    }

    try {
      await form.validateFields(["verify"]);
    } catch (error) {
      verifyRef?.current?.open();
      return;
    }

    const mobile = form.getFieldValue("mobile") as string;

    try {
      await getSmsCode(mobile, "LOGIN");
      form.setFieldValue("sendStatus", true);
      message.success("发送成功,请注意查收");
      setTargetDate(Date.now() + 60 * 1000);
    } catch (error) {
      message.error("发送失败");
    }
  }, [form, uuid]);

  form.submit = submit;
  return (
    <Form
      name="smsLogin"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      style={{ maxWidth: 250 }}
      initialValues={{ remember: true }}
      form={form}
    >
      <Form.Item<FieldType>
        label={null}
        name="mobile"
        rules={[
          {
            required: true,
            validator(_, value, callback) {
              const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
              if (value) {
                if (reg.test(value)) {
                  callback();
                } else {
                  callback("请输入11位手机号");
                }
              } else {
                callback("请输入手机号");
              }
            },
            message: "请输入正确格式的手机号",
          },
        ]}
        className="m-b-12px"
      >
        <Input placeholder="手机" maxLength={11} />
      </Form.Item>
      <div className="flex flex-row justify-between">
        <Form.Item<FieldType>
          label={null}
          name="code"
          className="m-b-12px p-r-12px"
          rules={[
            {
              required: true,
              len: 6,
              message: "请输入6位验证码",
            },
          ]}
        >
          <Input maxLength={6} placeholder="验证码" />
        </Form.Item>
        <Form.Item<FieldType>
          label={null}
          name="sendStatus"
          className="m-b-12px"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Button
            type="primary"
            className="w-100p"
            htmlType="submit"
            disabled={Boolean(countdown)}
            onClick={openVerify}
          >
            {countdown ? `${countdown2.seconds}秒后重试` : "获取"}
          </Button>
        </Form.Item>

        <Form.Item<FieldType> label={null} className="m-b-12px">
          <Verify
            verification="LOGIN"
            ref={verifyRef}
            value={verify}
            onChange={() => {
              form.setFieldsValue({ verify: true });
              if (!sendStatus) {
                form.validateFields(["mobile"]).then(() => {
                  sendCode();
                });
              }
            }}
          >
            <></>
          </Verify>
        </Form.Item>
      </div>

      <Form.Item<FieldType>
        name="remember"
        valuePropName="checked"
        label={null}
        className="m-b-12px"
      >
        <Checkbox>记住登录状态</Checkbox>
      </Form.Item>
      {props.children}
      <Form.Item label={null} className="m-b-0">
        <Button type="primary" className="w-100p" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
