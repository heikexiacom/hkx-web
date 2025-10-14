import { get, post } from "./request";
import { hexMD5 } from "@/utils/md5";
import { LocalStorage } from "@/utils/storage";

export type verificationEnums =
  | "LOGIN"
  | "REGISTER"
  | "FIND_USER" // 找回密码
  | "BIND_USER"
  | "UNBIND_USER"
  | "UPDATE_PASSWORD" // 更新密码
  | "WALLET_PASSWORD"; // 钱包密码

export type verificationData = {
  backImage: string;
  effectiveTime: number;
  key: string;
  originalHeight: number;
  originalWidth: number;
  randomY: number;
  sliderHeight: number;
  sliderWidth: number;
  slidingImage: string;
};

export const getVerifyImg = (verification: verificationEnums = "LOGIN") => {
  return get<void, verificationData>(`/common/common/slider/${verification}`, {
    headers: {
      uuid: LocalStorage.get("uuid") || "",
    },
  })();
};

export const postVerifyImg = (
  verification: verificationEnums,
  xPos: number
) => {
  return post<void, void>(
    `/common/common/slider/${verification}?verificationEnums=${verification}&xPos=${xPos}`,
    {
      headers: {
        uuid: LocalStorage.get("uuid") || "",
      },
    }
  )();
};

export const getSmsCode = (
  mobile: string,
  verification: verificationEnums = "LOGIN"
) => {
  return get<
    {
      mobile: string;
      verificationEnums: verificationEnums;
    },
    void
  >(`/common/common/sms/${verification}/${mobile}`, {
    headers: {
      uuid: LocalStorage.get("uuid") || "",
    },
  })({
    mobile,
    verificationEnums: verification,
  });
};

export function userLogin(props: { username: string; password: string }) {
  return post<
    {
      username: string;
      password: string;
    },
    {
      accessToken: string;
      refreshToken: string;
    }
  >("/buyer/passport/member/userLogin", {
    convertRequest: (data) => {
      return {
        username: data.username,
        password: hexMD5(data.password),
      };
    },
    formData: true,
    headers: {
      uuid: LocalStorage.get("uuid") || "",
    },
  })(props);
}

export function smsLogin(props: { mobile: string; code: string }) {
  return post<
    {
      mobile: string;
      code: string;
    },
    {
      accessToken: string;
      refreshToken: string;
    }
  >("/buyer/passport/member/smsLogin", {
    formData: true,
    headers: {
      uuid: LocalStorage.get("uuid") || "",
    },
  })(props);
}

type webLoginType = "WECHAT_PC" | "QQ";

export function webLogin(
  type: webLoginType = "WECHAT_PC",
  redirect = window.location.href
) {
  window.open(
    `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/buyer/passport/connect/connect/login/web/${type}?redirect=${redirect}`,
    "_self"
  );
}

export const webLoginCallback = get<
  {
    state: string;
  },
  {
    accessToken: string;
    refreshToken: string;
  }
>("/buyer/passport/connect/connect/result");

export function register(data: {
  username?: string;
  password: string;
  mobilePhone: string;
  code: string;
  parentId?: string;
}) {
  return post<
    {
      username?: string;
      password: string;
      mobilePhone: string;
      code: string;
      parentId?: string;
    },
    {
      accessToken: string;
      refreshToken: string;
    }
  >("/buyer/passport/member/register", {
    convertRequest: (data) => {
      return {
        ...data,
        password: hexMD5(data.password),
      };
    },
    formData: true,
    headers: {
      uuid: LocalStorage.get("uuid") || "",
    },
  })(data);
}

export function resetPassword(data: {
  mobile: string;
  code: string;
  password: string;
}) {
  return post<
    {
      mobile: string;
      code: string;
      password: string;
    },
    {
      accessToken: string;
      refreshToken: string;
    }
  >("/buyer/passport/member/resetByMobile", {
    convertRequest: (data) => {
      return {
        ...data,
        password: hexMD5(data.password),
      };
    },
    formData: true,
    headers: {
      uuid: LocalStorage.get("uuid") || "",
    },
  })(data);
}
