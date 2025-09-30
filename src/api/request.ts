import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { message } from "antd";
import { LocalStorage } from "@/utils/storage";
import { logout } from "@/utils";
const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

export type Records<Item> = {
  current: number;
  pages: number;
  records: Item[];
  size: number;
  total: number;
};

export type SearchParams = {
  pageNumber?: number;
  pageSize?: number;
  order?: "asc" | "desc"; // 排序方式
  sort?: string; // 排序字段
  notConvert?: boolean;
};

const http = axios.create({
  baseURL,
});

function ErrorMessage(msg: string) {
  message.error({
    content: msg,
    key: "requestError",
  });
}

type BaseResponse = {
  success: boolean;
  timestamp: number;
  code: number;
  message: string | null;
  msg: string | null;
  result: unknown;
  status: number;
  data?: unknown;
};

const ERROR_MSG = new Proxy(
  {
    400: "请求错误",
    401: "未授权，请重新登录",
    403: "拒绝访问",
    404: "请求出错",
    408: "请求超时",
    429: "系统繁忙，请稍后重试",
    500: "服务器错误",
    502: "网络错误",
    503: "服务不可用",
    504: "网络超时",
  },
  {
    get(target, propKey) {
      return Reflect.get(target, propKey) || `未知错误(${String(propKey)})!`;
    },
  }
);

export const getHeaders = (): Record<string, string | undefined | null> => ({
  accessToken: LocalStorage.get("accessToken"),
});

function handleResponseError(res: BaseResponse): never {
  const errMsg = res.message || res.msg;
  switch (res.code) {
    case 200400:
    case 403:
      break;
    default:
      if (errMsg) {
        ErrorMessage(errMsg);
      }
      break;
  }
  // const err = new Error(res.msg || res.message || JSON.stringify(res));
  throw res;
}

http.interceptors.request.use(
  (config) => {
    Object.assign(config.headers || {}, getHeaders());
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
let isRefreshing = false;
let requests: Array<(token: string) => void> = [];

// 在BaseResponse类型后添加
type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const refreshToken = LocalStorage.get("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.get<BaseResponse>(
      `${baseURL}/buyer/passport/member/refresh/${refreshToken}`
    );

    return response.data.data as RefreshTokenResponse;
  } catch (error) {
    throw new Error("Refresh token failed");
  }
}

async function refresh(originalRequest: InternalAxiosRequestConfig) {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const { accessToken, refreshToken } = await refreshAccessToken();
      LocalStorage.set("accessToken", accessToken);
      LocalStorage.set("refreshToken", refreshToken);

      // 重试队列中的请求
      requests.forEach((cb) => cb(accessToken));
      requests = [];
      return http(originalRequest!);
    } catch (refreshError) {
      // 刷新失败跳转登录
      LocalStorage.remove("accessToken");
      LocalStorage.remove("refreshToken");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  // 返回未解析的Promise，加入重试队列
  return new Promise((resolve) => {
    requests.push((token: string) => {
      originalRequest!.headers!.Authorization = token;
      resolve(http(originalRequest!));
    });
  });
}

// 在响应拦截器中修改错误处理部分
http.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const res = response.data;
    if (res.success === true) {
      if (responseCovertMap.has(response.config.url!)) {
        const handle = responseCovertMap.get(response.config.url!)!;
        return handle(res.result || res.data);
      }
      return res.result || res.data;
    } else if (res.code === 200) {
      if (responseCovertMap.has(response.config.url!)) {
        const handle = responseCovertMap.get(response.config.url!)!;
        return handle(res.data || res.result);
      }
      return res.data || res.result;
    } else if (res.code === 20003) {
      logout();
      return refresh(response.config);
    }

    ErrorMessage(res.message || res.msg || "");
  },
  async (error: AxiosError<BaseResponse>) => {
    const status = error?.response?.status ?? Symbol("unknown");

    const originalRequest = error.config;
    if (originalRequest?.headers?.allowFail === "true") {
      return Promise.reject(error);
    }

    // 处理401 token过期
    if (
      originalRequest &&
      originalRequest?.headers?.allowFail !== "true" &&
      status === 403 &&
      originalRequest?.url !== "/labelpro/user/refresh"
    ) {
      return refresh(originalRequest);
    }

    // 原有错误处理
    if (error.response?.data) {
      handleResponseError(error.response.data as BaseResponse);
    }
    ErrorMessage(Reflect.get(ERROR_MSG, status));
    return Promise.reject(error);
  }
);

export default http;

type AnyObj = Record<string, any>;
const responseCovertMap = new Map<string, (data: any) => any>();

type CacheItem = {
  data: any;
  expire: number;
};
const API_CACHE = new Map<string, CacheItem>();
const CACHE_EXPIRE = 60 * 1000; // 1分钟缓存

function generateCacheKey(url: string, params: any) {
  const sortedParams = Object.keys(params || {})
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  return `${url}_${JSON.stringify(sortedParams)}`;
}

export function get<
  Request = AnyObj,
  Response = AnyObj,
  ConvertedRequest = Request,
  ConvertedResponse = Response
>(
  url: string,
  config?: {
    convertResponse?: (response: Response) => ConvertedResponse;
    convertRequest?: (request: Request) => ConvertedRequest;
    headers?: Record<string, string>;
    cache?: boolean; // 新增缓存配置
  }
) {
  if (config?.convertResponse) {
    responseCovertMap.set(url, config.convertResponse);
  }
  return (params?: Request) => {
    const cacheKey = generateCacheKey(url, params);

    // 检查缓存
    if (config?.cache && API_CACHE.has(cacheKey)) {
      const cached = API_CACHE.get(cacheKey)!;
      if (Date.now() < cached.expire) {
        return Promise.resolve(cached.data as ConvertedResponse);
      }
      API_CACHE.delete(cacheKey);
    }

    let payload;
    try {
      if (config?.convertRequest) {
        payload = config.convertRequest(params || ({} as Request));
      } else {
        payload = params;
      }
    } catch (error) {
      console.error(error);
    }

    return http
      .get<Response, ConvertedResponse>(url, {
        params: payload ?? {},
        headers: config?.headers,
      })
      .then((response) => {
        // 缓存响应
        if (config?.cache) {
          API_CACHE.set(cacheKey, {
            data: response,
            expire: Date.now() + CACHE_EXPIRE,
          });
        }
        return response;
      });
  };
}

function toFormData(data?: AnyObj) {
  if (!data) {
    return new FormData();
  }
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return formData;
}

export function post<
  Request = AnyObj,
  Response = AnyObj,
  ConvertedRequest = Request,
  ConvertedResponse = Response
>(
  url: string,
  config?: {
    convertResponse?: (response: Response) => ConvertedResponse;
    convertRequest?: (request: Request) => ConvertedRequest;
    headers?: Record<string, string>;
    formData?: boolean;
  }
) {
  if (config?.convertResponse) {
    responseCovertMap.set(url, config.convertResponse);
  }
  return (data: Request) => {
    let payload;
    try {
      if (config?.convertRequest) {
        payload = config.convertRequest(data || ({} as Request));
      } else {
        payload = data;
      }
    } catch (error) {
      console.error(error);
    }
    if (config?.formData) {
      payload = toFormData(payload as AnyObj);
    }
    const headers = {
      ...config?.headers,
      "Content-Type": config?.formData
        ? "multipart/form-data"
        : "application/json",
    };
    return http.post<Response, ConvertedResponse>(url, payload ?? undefined, {
      headers,
    });
  };
}

export function put<
  Request = AnyObj,
  Response = AnyObj,
  ConvertedRequest = Request,
  ConvertedResponse = Response
>(
  url: string,
  config?: {
    convertResponse?: (response: Response) => ConvertedResponse;
    convertRequest?: (request: Request) => ConvertedRequest;
    headers?: Record<string, string>;
    formData?: boolean;
  }
) {
  if (config?.convertResponse) {
    responseCovertMap.set(
      import.meta.env.VITE_APP_API_BASE_URL + url,
      config.convertResponse
    );
  }
  return (data: Request) => {
    let payload;
    try {
      if (config?.convertRequest) {
        payload = config.convertRequest(data || ({} as Request));
      } else {
        payload = data;
      }
    } catch (error) {
      console.error(error);
    }
    if (config?.formData) {
      payload = toFormData(payload as AnyObj);
    }
    const headers = {
      ...config?.headers,
      "Content-Type": config?.formData
        ? "multipart/form-data"
        : "application/json",
    };
    return http.put<Response, ConvertedResponse>(url, payload ?? undefined, {
      headers,
    });
  };
}

export function del<
  Request = AnyObj,
  Response = AnyObj,
  ConvertedRequest = Request,
  ConvertedResponse = Response
>(
  url: string,
  config?: {
    convertResponse?: (response: Response) => ConvertedResponse;
    convertRequest?: (request: Request) => ConvertedRequest;
    headers?: Record<string, string>;
    formData?: boolean;
  }
) {
  if (config?.convertResponse) {
    responseCovertMap.set(
      import.meta.env.VITE_APP_API_BASE_URL + url,
      config.convertResponse
    );
  }
  return (data: Request) => {
    let payload;
    try {
      if (config?.convertRequest) {
        payload = config.convertRequest(data || ({} as Request));
      } else {
        payload = data;
      }
    } catch (error) {
      console.error(error);
    }
    if (config?.formData) {
      payload = toFormData(payload as AnyObj);
    }
    const headers = {
      ...config?.headers,
      "Content-Type": config?.formData
        ? "multipart/form-data"
        : "application/json",
    };
    return http.delete<Response, ConvertedResponse>(url, {
      params: payload ?? {},
      headers,
    });
  };
}
