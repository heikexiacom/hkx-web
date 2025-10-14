import { useEffect, useState } from "react";
import { isLogin } from "@/store";
import { useAtomValue } from "jotai";
import { Avatar } from "antd";
import { LocalStorage } from "@/utils/storage";
import { getMember, type UserInfo } from "@/api/member";

export default function index(props: { size?: number; className?: string }) {
  const { size = 64, className } = props;
  const login = useAtomValue(isLogin);

  const avatarSize = size + "px";
  const [userInfo, setUserInfo] = useState<UserInfo | null>(
    LocalStorage.get("userInfo")
  );
  useEffect(() => {
    if (!userInfo && login) {
      getMember().then(setUserInfo);
    }
  }, [userInfo, login]);

  if (!login) {
    return (
      <Avatar
        style={{ width: avatarSize, height: avatarSize }}
        className={className}
      >
        HKX
      </Avatar>
    );
  }

  if (userInfo?.face) {
    return (
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          minWidth: avatarSize,
          minHeight: avatarSize,
          maxWidth: avatarSize,
          maxHeight: avatarSize,
        }}
        className="rounded-full object-cover"
      >
        <img src={userInfo?.face} className={className} />
      </div>
    );
  }

  return (
    <Avatar
      style={{ width: avatarSize, height: avatarSize }}
      className={className}
    >
      {userInfo?.nickName?.[0] || "HKX"}
    </Avatar>
  );
}
