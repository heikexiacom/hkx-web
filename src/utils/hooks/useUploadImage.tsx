import { Close, Plus } from "@icon-park/react";
import { Upload } from "antd";
import useApp from "antd/es/app/useApp";
import { useState } from "react";

export default function useUploadImage(data?: {
  width?: number;
  height?: number;
  maxSize?: number;
  uploadNode?: React.ReactNode;
  imageNode?: (src: string) => React.ReactNode;
}) {
  const {
    width = 200,
    height = 200,
    maxSize = 2 * 1024 * 1024,
    uploadNode,
    imageNode,
  } = data || {};
  const w = width + "px",
    h = height + "px";
  const [file, setFile] = useState<{
    url: string;
    file: File;
  }>();

  const clear = () => {
    setFile(undefined);
  };

  const { message } = useApp();

  const defaultUploadNode = (
    <div
      style={{ width: w, height: h }}
      className="flex items-center justify-center rounded-md cursor-pointer bg-[#f3f3f3]"
    >
      <Plus />
    </div>
  );
  const defaultImageNode = (
    <div className=" relative group w-max">
      <div
        className="absolute top-0 right-0 bg-[#00000080] text-white text-ms p-0.5 rounded-full cursor-pointer translate-x-1/2 translate-y--1/2 group-hover:visible invisible"
        onClick={clear}
      >
        <Close />
      </div>
      <div className="rounded-md overflow-hidden border border-[#f3f3f3] border-solid w-max">
        <img
          style={{
            maxWidth: w,
            maxHeight: h,
            objectFit: "contain",
          }}
          src={file?.url}
        />
      </div>
    </div>
  );

  const node = (
    <div>
      <Upload
        accept=".jpg,.jpeg,.png"
        maxCount={1}
        showUploadList={false}
        beforeUpload={(f) => {
          const isJpgOrPng = f.type === "image/jpeg" || f.type === "image/png";
          if (!isJpgOrPng) {
            message.error("上传图片仅支持 JPG/PNG 格式");
          }
          const isLtMaxSize = f.size < maxSize;
          if (!isLtMaxSize) {
            message.error(`上传图片大小不能超过 ${maxSize / 1024 / 1024}MB`);
          }
          if (file) {
            URL.revokeObjectURL(file.url);
          }
          const data = {
            url: URL.createObjectURL(f),
            file: f,
          };
          setFile(data);
          return false;
        }}
      >
        {!file && (uploadNode ? uploadNode : defaultUploadNode)}
      </Upload>
      {file && (imageNode ? imageNode(file.url) : defaultImageNode)}
    </div>
  );
  return {
    file,
    node,
    clear,
    setFile,
  };
}
