import { ArrowLeft } from "@icon-park/react";
import { Button, Form, Input } from "antd";
import { useRef, useState } from "react";
import { getSmsCode, resetPassword } from "@/api/login";
import { useUuid } from "@/utils/hooks/useUuid";
import { useCountDown, useRequest } from "ahooks";
import useApp from "antd/es/app/useApp";
import Verify, { type VerifyRef } from "../verify";

type FieldType = {
  mobile: string;
  code: string;
  sendStatus: boolean;
  verify: boolean;
  password: string;
  confirmPassword: string;
};
export default function FindPassword(props: { onBack: () => void }) {
  const [form] = Form.useForm<FieldType>();
  const verify = Form.useWatch("verify", form);

  const [targetDate, setTargetDate] = useState<number>();
  const verifyRef = useRef<VerifyRef>(null);

  const [countdown, countdown2] = useCountDown({
    targetDate,
    onEnd: () => {
      form.setFieldValue("sendStatus", false);
    },
  });

  const { uuid, reset } = useUuid();
  const { message } = useApp();
  const submit = useRequest(
    async () => {
      await form.validateFields();
      const values = await form.validateFields();
      await resetPassword({
        mobile: values.mobile,
        code: values.code,
        password: values.password,
      });
    },
    {
      onSuccess: () => {
        message.success("密码重置成功");
        props.onBack();
      },
      manual: true,
      refreshDeps: [uuid, form],
      onFinally: reset,
    }
  );
  const getCode = useRequest(getSmsCode, {
    throttleWait: 1000,
    manual: true,
    onSuccess() {
      form.setFieldValue("sendStatus", true);
      message.success("验证码发送成功");
      setTargetDate(Date.now() + 60000);
    },
    refreshDeps: [uuid],
  });

  async function sendCode() {
    await form.validateFields(["mobile"]);
    if (verify) {
      const mobile = form.getFieldValue("mobile") as string;
      getCode.run(mobile, "FIND_USER");
    } else {
      verifyRef?.current?.open();
      console.log("verifyRef?.current?.open");
    }
  }
  return (
    <div>
      <div className="w-full flex flex-row justify-center items-center relative">
        <Button
          onClick={props.onBack}
          icon={<ArrowLeft />}
          variant="link"
          type="link"
          className="px-0 absolute top-0 left-0"
        >
          返回
        </Button>

        <div className="text-l font-bold m-b-2 line-height-2rem">找回密码</div>
      </div>
      <div>
        <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} form={form}>
          <Form.Item
            label="手机号"
            name="mobile"
            rules={[
              {
                required: true,
                message: "请输入手机号",
              },
              {
                validator(_, value, callback) {
                  if (!value) {
                    callback();
                    return;
                  }
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
          >
            <Input minLength={11} maxLength={11} />
          </Form.Item>

          <Form.Item
            name="verify"
            className="h-0 m-b-0"
            rules={[{ required: true }]}
          >
            <div className="relative w-full">
              <Verify
                verification="FIND_USER"
                ref={verifyRef}
                placement="bottom"
                value={verify}
                onChange={(v) => {
                  form.setFieldValue("verify", v);
                  if (v) {
                    form.validateFields(["mobile"]).then(() => {
                      const mobile = form.getFieldValue("mobile") as string;
                      getCode.run(mobile, "FIND_USER");
                    });
                  }
                }}
              >
                <></>
              </Verify>
            </div>
          </Form.Item>
          <Form.Item
            label="验证码"
            name="code"
            rules={[
              {
                required: true,
                message: "请输入验证码",
              },
              {
                validator(_, value, callback) {
                  if (!value) {
                    callback();
                    return;
                  }
                  const reg = /^[0-9]{6}$/;
                  if (value) {
                    if (reg.test(value)) {
                      callback();
                    } else {
                      callback("请输入6位验证码");
                    }
                  } else {
                    callback("请输入验证码");
                  }
                },
                message: "请输入正确格式的验证码",
              },
            ]}
          >
            <Input
              minLength={6}
              maxLength={6}
              autoComplete="off"
              suffix={
                <div>
                  <Button
                    type="link"
                    variant="link"
                    className="px-0"
                    disabled={Boolean(countdown)}
                    size="small"
                    onClick={sendCode}
                  >
                    {countdown ? `${countdown2.seconds}秒后重试` : "获取"}
                  </Button>
                </div>
              }
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              {
                required: true,
                message: "请输入密码",
              },
              {
                validator(_, value, callback) {
                  if (!value) {
                    callback();
                    return;
                  }
                  const reg = /^[a-zA-Z0-9_]{6,}$/;
                  if (value) {
                    if (reg.test(value)) {
                      callback();
                    } else {
                      callback("请输入6位以上密码");
                    }
                  } else {
                    callback("请输入密码");
                  }
                },
                message: "请输入正确格式的密码",
              },
            ]}
          >
            <Input.Password autoComplete="" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "请输入确认密码",
              },
              {
                validator(_, value, callback) {
                  if (!value) {
                    callback();
                    return;
                  }
                  const password = form.getFieldValue("password") as string;
                  if (value) {
                    if (value === password) {
                      callback();
                    } else {
                      callback("两次输入密码不一致");
                    }
                  } else {
                    callback("请输入确认密码");
                  }
                },
                message: "两次输入密码不一致",
              },
            ]}
          >
            <Input.Password autoComplete="" />
          </Form.Item>
          <Button type="primary" block onClick={submit.run}>
            找回密码
          </Button>
        </Form>
      </div>
    </div>
  );
}
