import { get } from "./request";
export interface Auth {
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

export const getStsAuth = get<void, Auth>("/common/common/sts/auth");
