import { object_xor } from "@/utils";
import {
  Form,
  Input,
  Modal,
  type FormItemProps,
  type FormProps,
  type ModalProps,
} from "antd";
import { useState } from "react";

export default function Edit<T = Record<string, unknown>>(props: {
  refresh?: () => void;
  onOk: (data: T) => Promise<void>;
  modalProps?: ModalProps;
  formProps?: FormProps;
  itemProps?: FormItemProps;
  opts: {
    key: string;
    label: string;
  }[];
}) {
  const { refresh, onOk, opts, modalProps, formProps, itemProps } = props;

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<T>();
  const [originalData, setOriginalData] = useState<T>();
  const open = (data: T) => {
    setVisible(true);
    setOriginalData(data);
    form.setFieldsValue(data as any);
  };

  const node = (
    <Modal
      {...modalProps}
      open={visible}
      onOk={async () => {
        setLoading(true);
        try {
          const values = form.getFieldsValue();
          const [a] = object_xor(values, originalData);
          if (Object.keys(a).length) {
            await onOk(a as T);
          }
          setLoading(false);
          setVisible(false);
          refresh?.();
        } catch (error) {
          setLoading(false);
        }
      }}
      confirmLoading={loading}
      onCancel={() => setVisible(false)}
    >
      <Form
        form={form}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
        {...formProps}
      >
        {opts.map((item) => (
          <Form.Item
            key={item.key}
            name={item.key}
            label={item.label}
            {...itemProps}
          >
            <Input />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );

  return {
    open,
    node: node,
  };
}
