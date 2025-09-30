import { get, put } from "@/api/request";
import { LocalStorage, Session } from "@/utils/storage";
import { hexMD5 } from "@/utils/md5";

export interface IResponse {
  body: Body;
  headers: Headers;
  statusCode: number;
}

interface Body {
  assumedRoleUser: AssumedRoleUser;
  credentials: Credentials;
  requestId: string;
}

interface AssumedRoleUser {
  arn: string;
  assumedRoleId: string;
}

interface Credentials {
  accessKeyId: string;
  accessKeySecret: string;
  expiration: string;
  securityToken: string;
}

type Headers = Record<string, never>;

const getStsAuth = get<void, IResponse>("/common/common/sts/auth");
export default getStsAuth;

export interface MemberInfo {
  selfColor: null | string;
}

export interface MemberColor {
  colorStr: string;
}

// export const putMemberPrivate = putForm<MemberColor, void>(
//   '/buyer/member/private',
// )

export const getSelfColor = (type: "buyer" | "store") => {
  return get<void, string>(
    `${
      type === "buyer" ? "/buyer/passport/member" : "/store/member/user"
    }/getSelfColor`
  );
};

export const updateSelfColor = put<MemberColor, void>(
  "/buyer/passport/member/updateSelfColor",
  {
    formData: true,
  }
);

// export const getMember = get<void, MemberInfo>('/buyer/passport/member')

export interface UserInfo {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: boolean;
  username: string;
  password: string;
  nickName: string;
  sex: number;
  birthday: string;
  regionId: string;
  region: string;
  mobile: string;
  point: number;
  totalPoint: number;
  face: string;
  disabled: boolean;
  haveStore: boolean;
  storeId: string;
  clientEnum: string;
  lastLoginDate: string;
  gradeId: string;
  experience: string;
  cancelStatus: string;
  cancelTime: string;
  selfColor: string;
  parentId: string;
  sBookExpireTime: string;
  bind: boolean;
  sbookType: string;
  sbookStatus: string;
  sbookExpireTime: string;
}

export const getMember = async (
  storage: "Session" | "LocalStorage" = "Session"
) => {
  const userInfo = await get<void, UserInfo>("/buyer/passport/member")();
  if (storage === "LocalStorage") {
    LocalStorage.set("userInfo", userInfo);
  } else {
    Session.set("userInfo", userInfo);
  }
  return userInfo;
};

/**
 * 更新用户信息
 */
export const updateMember = put<
  Partial<Pick<UserInfo, "nickName" | "face" | "sex">>,
  void
>("/buyer/passport/member/editOwn", {
  formData: true,
});

/**
 * 更新用户密码
 */
export const updateMemberPassword = put<
  {
    password: string;
    newPassword: string;
  },
  void
>("/buyer/passport/member/modifyPass", {
  formData: true,
  convertRequest: (data) => {
    return {
      password: hexMD5(data.password),
      newPassword: hexMD5(data.newPassword),
    };
  },
});

export const mobileBindThird = (
  type: "QQ" | "WECHAT" | "WECHAT_PC",
  params: {
    userid: string;
    userFlag: string;
    redirect: string;
  }
) => {
  window.open(
    `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/buyer/passport/member/mobileBindThird/${type}?redirect=${
      params.redirect
    }&userid=${params.userid}`,
    "blank"
  );
};

export const mobileUnBindThird = get<
  {
    code: string;
    mobile: string;
  },
  void
>("/buyer/passport/member/mobileUnBindThird");
