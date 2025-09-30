import { collectImg, type text2imgItemLastOutItem } from "@/api/ai";
import React, { useState } from "react";
import ImageCard from "../imageCard";
import { Like } from "@icon-park/react";
import { Button, Space, Image } from "antd";
import { imageOssProcess } from "@/utils/oss";
import {
  DownloadOutlined,
  SwapOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomOutOutlined,
  ZoomInOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import { throttle } from "lodash";

export default function index(props: {
  data: text2imgItemLastOutItem;
  width: number | string;
  height: number | string;
  download: (url: string) => void;
}) {
  const { data, width, height, download } = props;

  const [collect, setCollect] = useState(Boolean(Number(data.collectStatus)));

  const submit = useRequest(collectImg, {
    manual: true,
    throttleWait: 1000,
  });

  const onCollect = () => {
    setCollect(!collect);
    submit.run({
      collectStatus: collect ? "2" : "1",
      id: data.id,
      imageId: data.imageId,
    });
  };
  return (
    <ImageCard
      key={data.imageId}
      noPadding
      style={{ width, height }}
      imageSrc={"1"}
      topRightChildrenLock={collect}
      topRightChildren={
        <Button
          variant="link"
          icon={<Like theme={collect ? "filled" : "outline"} fill="#FF4D4F" />}
          shape="circle"
          title={collect ? "取消收藏" : "收藏"}
          onClick={onCollect}
        />
      }
      topLeftChildren={
        <Button
          variant="link"
          icon={<DownloadOutlined />}
          shape="circle"
          title="下载"
          onClick={throttle(() => download(data.url), 1000)}
        />
      }
      imageNode={
        <Image
          width={width}
          height={height}
          className="w-full h-full! bg-[#ECF0F1] rounded-lg border-1 border-[#999] border-solid overflow-hidden"
          src={imageOssProcess(data.url, "wm")}
          preview={{
            src: imageOssProcess(data.url, "wm"),
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: {
                  onFlipY,
                  onFlipX,
                  onRotateLeft,
                  onRotateRight,
                  onZoomOut,
                  onZoomIn,
                  onReset,
                },
              }
            ) => {
              return (
                <Space size={12} className="toolbar-wrapper">
                  <DownloadOutlined
                    onClick={throttle(() => download(data.url), 1000)}
                  />
                  <Like
                    theme={collect ? "filled" : "outline"}
                    fill={collect ? "#FF4D4F" : undefined}
                    className="cursor-pointer"
                    onClick={onCollect}
                  />
                  <SwapOutlined rotate={90} onClick={onFlipY} />
                  <SwapOutlined onClick={onFlipX} />
                  <RotateLeftOutlined onClick={onRotateLeft} />
                  <RotateRightOutlined onClick={onRotateRight} />
                  <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                  <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                  <UndoOutlined onClick={onReset} />
                </Space>
              );
            },
          }}
        />
      }
    />
  );
}
