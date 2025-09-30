import { getStsAuth } from "@/api/oss";
import { checkWebUrl } from "..";
import OSS from "ali-oss";
import { Session } from "../storage";
import { nanoid } from "nanoid";
import mime from "mime";
import { isString } from "lodash";

const imagePresetsOptions = {
  "2webp": "image/format,webp",
  "2png": "image/format,png",
  w400h300:
    "image/auto-orient,1/resize,m_pad,w_400,h_300,color_ECF0F1/format,webp",
  w400h300noColor: "image/auto-orient,1/resize,m_pad,w_400,h_300/format,webp",
  w100h100: "image/auto-orient,1/resize,m_lfit,w_100,h_100/format,webp",
  w200h100: "image/auto-orient,1/resize,m_lfit,w_200,h_100/format,webp",
  w100: "image/auto-orient,1/resize,m_lfit,w_100/format,webp",
  w200: "image/auto-orient,1/resize,m_lfit,w_200/format,webp",
  wm: "style/wm",
};

export function imageOssProcess(
  url: string,
  preset?: keyof typeof imagePresetsOptions
) {
  if (!checkWebUrl(url)) {
    return url;
  }
  const type = preset ?? "2webp";
  const newUrl = new URL(url);
  newUrl.searchParams.delete("x-oss-process");
  newUrl.searchParams.append("x-oss-process", imagePresetsOptions[type]!);
  return newUrl.toString();
}

type exifValue = {
  value: string;
};
type exif = {
  FileSize: exifValue;
  Format: exifValue;
  FrameCount: exifValue;
  ImageHeight: exifValue;
  ImageWidth: exifValue;
  ResolutionUnit: exifValue;
  XResolution?: exifValue;
  YResolution?: exifValue;
};
export async function getImageInfo(url: string) {
  const info: exif = await fetch(
    `${url}${url.includes("?") ? "&" : "?"}x-oss-process=image/info`,
    {
      cache: "no-store",
      mode: "cors",
    }
  ).then((response) => {
    return response.json();
  });
  return info;
}

async function getOssClient() {
  const {
    body: { credentials },
  } = await getStsAuth();
  return new OSS({
    accessKeyId: credentials.accessKeyId,
    accessKeySecret: credentials.accessKeySecret,
    stsToken: credentials.securityToken,
    secure: true,
    bucket: "zxdz",
    endpoint: "oss-cn-shanghai.aliyuncs.com",
    region: "oss-cn-shanghai.aliyuncs.com",
    refreshSTSToken: async () => {
      const {
        body: { credentials: newCredentials },
      } = await getStsAuth();
      return {
        accessKeyId: newCredentials.accessKeyId,
        accessKeySecret: newCredentials.accessKeySecret,
        stsToken: newCredentials.securityToken,
      };
    },
  });
}
export function getImageWidthAndHeight(payload: File | string | Blob) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    if (isString(payload)) {
      img.src = payload;
    } else {
      const fr = new FileReader();
      fr.addEventListener("load", () => {
        img.src = fr.result as string;
      });
      fr.readAsDataURL(payload);
    }
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (error) => {
      console.error(error);

      reject(new Error("img get error"));
    };
  });
}

export function getImageRatio(payload: File | string | Blob) {
  return new Promise<number>((resolve, reject) => {
    getImageWidthAndHeight(payload)
      .then(({ width, height }) => {
        resolve(width / height);
      })
      .catch(reject);
  });
}

export async function uploadFile(
  file: File | Blob,
  notCallBack?: true,
  options?: Exclude<OSS.MultipartUploadOptions, "headers" | "callback">,
  path: string = nanoid(),
  needEnv: boolean = true
) {
  const extName = mime.getExtension(file.type) ?? "unknown";
  const fileName = file instanceof File ? file.name : `${path}.${extName}`;
  const ossClient = await getOssClient();
  const headers = {
    // save file name
    "Content-Disposition": `attachment; filename=${encodeURIComponent(
      fileName
    )}`,
  };
  const PATH_PREFIX = import.meta.env.VITE_APP_OSS_PATH;
  let imgRatio = -1;
  if (file.type.startsWith("image") && !notCallBack) {
    imgRatio = await getImageRatio(file);
  }
  return ossClient.multipartUpload(
    `${needEnv ? `/${PATH_PREFIX}` : ""}${
      path.startsWith("/") ? "" : "/"
    }${path}`,
    file,
    {
      ...options,
      headers,
      callback:
        notCallBack === true
          ? undefined
          : {
              url: `${
                import.meta.env.VITE_APP_OSS_CALLBACK_URL
              }/${window.location.hostname.replaceAll(".", "_")}`,
              // eslint-disable-next-line no-template-curly-in-string
              body: "bucket=${bucket}&object=${object}&mimeType=${mimeType}&imageInfo.format=${imageInfo.format}&userToken=${x:token}&imgRatio=${x:imgRatio}",
              contentType: "application/x-www-form-urlencoded",
              customValue: {
                token: Session.get("accessToken") ?? "",
                imgRatio: `${imgRatio}`,
              },
            },
    }
  );
}

export async function uploadFileReturnUrl(
  file: File | Blob,
  fileName?: string,
  needEnv: boolean = true,
  v: string | boolean = nanoid()
) {
  const result = await uploadFile(file, true, undefined, fileName, needEnv);
  return `${import.meta.env.VITE_APP_BASE_OSS_URL}${result.name}${
    v ? `?v=${v}` : ""
  }`;
}
