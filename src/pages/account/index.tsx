import { mobileBindThird, updateMember, type UserInfo } from "@/api/member";
import Edit from "@/components/modal/edit";
import { blobToBase64, hiddenPhone } from "@/utils";
import { uploadFileReturnUrl } from "@/utils/oss";
import { LocalStorage } from "@/utils/storage";
import { Avatar, Button, Upload } from "antd";
import useApp from "antd/es/app/useApp";
import { useState } from "react";
import ModifyPassword from "./components/modifyPassword";

export default function index() {
  const [useInfo, setUseInfo] = useState<UserInfo | null>(
    LocalStorage.get("userInfo")
  );
  const { message } = useApp();

  const { open, node: editNode } = Edit<UserInfo>({
    onOk: async (data) => {
      await updateMember(data);
      LocalStorage.set("userInfo", {
        ...useInfo,
        ...data,
      });
      setUseInfo((pre) => {
        return { ...pre, ...data };
      });
    },
    modalProps: {
      title: "个人信息",
      okText: "保存",
      cancelText: "取消",
    },
    opts: [
      {
        key: "nickName",
        label: "昵称",
      },
    ],
  });

  const { open: openModifyPassword, node: modifyPasswordNode } =
    ModifyPassword();

  const bindWechat = async () => {
    try {
      mobileBindThird("WECHAT_PC", {
        userFlag: "",
        userid: useInfo?.id || "",
        redirect: location.href,
      });
    } catch (error) {}
  };

  if (!useInfo) return null;

  return (
    <div className="p-4 bg-[#fff] w-full h-full">
      {editNode}
      {modifyPasswordNode}
      <div className="w-50%">
        <div className="text-[#222] text-xl font-bold mb-1rem">个人信息</div>

        <div>
          <Upload
            showUploadList={false}
            maxCount={1}
            accept=".png,.jpg,.webp"
            beforeUpload={async (file) => {
              message.loading({
                key: "upload",
                content: "上传头像中...",
                duration: 0,
              });
              try {
                const blob = new Blob([file], {
                  type: file.type,
                });
                const url = await uploadFileReturnUrl(
                  blob,
                  `avatar/${useInfo.id}`
                );
                await updateMember({
                  face: url,
                });
                LocalStorage.set("userInfo", {
                  ...useInfo,
                  face: url,
                } as UserInfo);
                setUseInfo((pre) => {
                  if (!pre) return null;
                  return { ...pre, face: url };
                });
                message.success({
                  key: "upload",
                  content: "上传成功",
                  duration: 3,
                });
              } catch (error) {
                message.error({
                  key: "upload",
                  content: "上传失败",
                  duration: 3,
                });
              }

              return false;
            }}
          >
            <Avatar size={64} src={useInfo?.face} className="cursor-pointer">
              {useInfo?.nickName?.[0] || "HKX"}
            </Avatar>
          </Upload>
        </div>
        <div className="flex flex-col gap-2 py-4 border-b-1 border-[#f2f2f2] border-solid">
          <div className="text-[#222] text-l font-bold">用户ID:</div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-[#666] text-l">{useInfo?.id}</div>
            <Button type="primary" onClick={openModifyPassword}>
              修改密码
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 py-4 border-b-1 border-[#f2f2f2] border-solid">
          <div className="text-[#222] text-l font-bold">昵称:</div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-[#666] text-l">
              {useInfo?.nickName || "HKX"}
            </div>
            <Button type="primary" onClick={() => open(useInfo)}>
              修改
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 py-4 border-b-1 border-[#f2f2f2] border-solid">
          <div className="text-[#222] text-l font-bold">手机号:</div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-[#666] text-l">
              {hiddenPhone(useInfo?.mobile) || "未绑定"}
            </div>
            {/* <Button type="primary">修改</Button> */}
          </div>
        </div>
        <div className="flex flex-col gap-2 py-4 border-b-1 border-[#f2f2f2] border-solid">
          <div className="text-[#222] text-l font-bold">微信:</div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-[#666] text-l">
              {useInfo?.bind ? "已绑定" : "未绑定"}
            </div>
            <Button type="primary" onClick={bindWechat}>
              {useInfo?.bind ? "解绑" : "绑定"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
