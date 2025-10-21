import {
  delText2img,
  getText2imgList,
  imageToImageFileUpload,
  imageToPrompt,
  jmImg2img,
  type Text2imgItem,
  type text2imgItemLastOutItem,
} from "@/api/ai";
import { downloadUrlFile, gcd } from "@/utils";
import { Copy, Delete, LoadingFour, Plus, Text } from "@icon-park/react";
import { useInfiniteScroll, useRequest, useThrottleEffect } from "ahooks";
import { Button, Image, Input, Select, Slider, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import useApp from "antd/es/app/useApp";
import dayjs from "dayjs";

import { imageOssProcess } from "@/utils/oss";
import InfiniteSpinnerImg from "@/components/image/infiniteSpinner";
import ErrorImage from "@/components/image/error";

import CollectCard from "@/components/card/collectCard";
import calendar from "dayjs/plugin/calendar";
import useLogin from "@/utils/hooks/useLogin";

dayjs.extend(calendar);

type px = {
  "1k": [number, number];
  "2k": [number, number];
};

const ratioOpts: Record<
  string,
  {
    ratio: [number, number];
    label: string;
    opt: px;
  }
> = {
  "1:1": {
    label: "正方形 1:1",
    ratio: [1, 1],
    opt: {
      "1k": [1328, 1328],
      "2k": [2048, 2048],
    },
  },
  "4:3": {
    label: " 4:3",
    ratio: [4, 3],
    opt: {
      "1k": [1472, 1104],
      "2k": [2304, 1728],
    },
  },
  "3:4": {
    label: "3:4",
    ratio: [3, 4],
    opt: {
      "1k": [1104, 1472],
      "2k": [1728, 2304],
    },
  },
  "3:2": {
    label: "3:2",
    ratio: [3, 2],
    opt: {
      "1k": [1584, 1056],
      "2k": [2496, 1664],
    },
  },
  "2:3": {
    label: "2:3",
    ratio: [2, 3],
    opt: {
      "1k": [1056, 1584],
      "2k": [1664, 2496],
    },
  },
  "16:9": {
    label: "16:9",
    ratio: [16, 9],
    opt: {
      "1k": [1664, 936],
      "2k": [2560, 1440],
    },
  },
  "9:16": {
    label: "9:16",
    ratio: [9, 16],
    opt: {
      "1k": [936, 1664],
      "2k": [1440, 2560],
    },
  },
  "21:9": {
    label: "21:9",
    ratio: [21, 9],
    opt: {
      "1k": [2016, 864],
      "2k": [3024, 1296],
    },
  },
  "9:21": {
    label: "9:21",
    ratio: [9, 21],
    opt: {
      "1k": [864, 2016],
      "2k": [1296, 3024],
    },
  },
};

function Img2ImgCard(props: {
  data: Omit<Text2imgItem, "lastOut"> & {
    lastOut: text2imgItemLastOutItem[];
  };
  showDay?: boolean;
  onDel: (id: string) => void;
  onCopy: (text: string) => void;
}) {
  const { data, onDel, onCopy } = props;
  const pixelRatio = gcd(data.pxRatioX, data.pxRatioY);
  const aspectRatio = `${data.pxRatioX / pixelRatio || 1}:${
    data.pxRatioY / pixelRatio || 1
  }`;

  const { imgContent } = JSON.parse(data.inputJson || "{}") as {
    imgContent: string;
  };

  const pixel = Math.max(data.pxRatioX, data.pxRatioY) / 200;
  const w = data.pxRatioX / pixel;
  const h = data.pxRatioY / pixel;
  const { message } = useApp();
  const download = async (url: string) => {
    try {
      await downloadUrlFile(url, data.showName);
      message.success("下载成功");
    } catch (e) {
      message.error("下载失败");
    }
  };

  return (
    <div className="px-2 ">
      {props.showDay && (
        <div className="text-2rem ">
          {dayjs(data.createTime).calendar(null, {
            sameDay: "[今天]",
            nextDay: "[明天]",
            nextWeek: "MM-DD",
            lastDay: "[昨天]",
            lastWeek: "MM-DD",
            sameElse: "MM-DD",
          })}
        </div>
      )}

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <Image
            width={60}
            height={60}
            title="参考图片"
            src={imageOssProcess(imgContent, "2webp")}
            className="w-60px h-60px min-w-60px min-h-60px cursor-pointer rounded-md object-cover overflow-hidden border-1 border-[#f5f5f5] border-solid "
            preview={{
              mask: false,
            }}
          />
          <div className="text-l font-mid">{data.prompt}</div>
        </div>

        <div className="flex flex-row gap-1rem items-center">
          <div className="text-l text-gray-800 px-2 py-1 bg-gray-200 rounded-md">
            {aspectRatio}
          </div>
          <div onClick={() => onCopy(data.prompt)} className="cursor-pointer">
            <Copy />
          </div>
          <div onClick={() => onDel(data.id)} className="cursor-pointer">
            <Delete />
          </div>
        </div>
      </div>
      <div className="p-t-2">
        {data.picStatus === "ERROR" ? (
          <ErrorImage
            width={w}
            height={h}
            text="生成失败"
            className="rounded-md bg-white border border-[#e5e5e5]"
          />
        ) : (
          <>
            {data.lastOut.length
              ? data.lastOut.map((e) => {
                  return (
                    <CollectCard
                      key={e.imageId}
                      data={e}
                      width={w}
                      height={h}
                      download={download}
                    />
                  );
                })
              : Array.from({ length: data.imageNum }).map((_, index) => (
                  <div key={data.id + "-temp-" + index}>
                    <InfiniteSpinnerImg
                      width={w}
                      height={h}
                      className="rounded-md bg-white border border-[#e5e5e5]"
                    />
                  </div>
                ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function index() {
  const { ready: login, reset: openModal } = useLogin();

  const [imageSrc, setImageSrc] = useState("");
  const [referenceIntensity, setReferenceIntensity] = useState(0.5);
  const [prompt, setPrompt] = useState("");
  const [wh, setWh] = useState<[number, number]>([1328, 1328]);
  const container = useRef<HTMLDivElement>(null);
  const { modal, message } = useApp();
  const data = useInfiniteScroll(
    async (params) => {
      const { pageSize, pageNumber } = params ?? {
        pageSize: 10,
        pageNumber: 0,
      };
      const { records: result, total } = await getText2imgList({
        pageSize,
        pageNumber: pageNumber + 1,
        imageType: 1,
      });
      return {
        list: result,
        pageSize,
        pageNumber: pageNumber + 1,
        total,
      };
    },
    {
      target: container,
      direction: "bottom",
      manual: true,

      isNoMore: (payload) => {
        if (!payload) {
          return true;
        }
        return payload.list.length >= payload.total;
      },
    }
  );

  const imagePrompt = useRequest(imageToImageFileUpload, {
    manual: true,
    onBefore: () => {
      message.loading({
        content: "上传中",
        key: "imagePrompt",
        duration: 0,
      });
    },
    onFinally: () => {
      message.destroy("imagePrompt");
    },
  });

  const toPrompt = useRequest(imageToPrompt, {
    manual: true,
    onSuccess: (data) => {
      message.success("转换成功");
      setPrompt(data);
    },

    throttleWait: 1000,
  });
  const toPromptFile = toPrompt.params?.[0]?.urlOrIdOrMd5;

  const list = data.data?.list as
    | (Omit<Text2imgItem, "lastOut"> & {
        lastOut: text2imgItemLastOutItem[];
      })[]
    | undefined;

  const img2img = useRequest(jmImg2img, {
    manual: true,
    onSuccess: data.reload,
  });

  const del = (id: string) => {
    modal.confirm({
      title: "确认删除吗？",
      okText: "确认",
      okType: "danger",
      onOk: async () => {
        await delText2img({ ids: [id] });
        message.success("删除成功");
        data.reload();
      },
    });
  };

  useThrottleEffect(
    () => {
      if (list?.some((e) => e.picStatus === "HANDLE")) {
        data.reload();
      }
    },
    [data],
    {
      leading: false,
      trailing: true,
      wait: 5000,
    }
  );

  const dayMap = list?.reduce((prev, cur) => {
    const day = dayjs(cur.createTime).format("YYYY-MM-DD");
    if (prev[day]) {
      return prev;
    }
    prev[day] = cur.id;
    return prev;
  }, {} as Record<string, string>);

  const showDay = Object.values(dayMap || {});

  const submit = async () => {
    if (!login) {
      openModal();
      return;
    }
    if (!imageSrc) {
      message.error("请上传参考图片");
      return;
    }
    if (!prompt) {
      message.error("请输入描述词");
      return;
    }
    img2img.run({
      imgContent: imagePrompt.data?.url || "",
      prompt,
      scale: referenceIntensity,
      width: wh[0],
      height: wh[1],
    });
  };

  const imageUrl = imageSrc.startsWith("http")
    ? imageSrc
    : imagePrompt.data?.url;

  useEffect(() => {
    if (!login) {
      openModal();
    } else {
      data.reload();
    }
  }, [login]);

  return (
    <div className="w-full h-full flex flex-row ">
      <div className="w-300px min-w-300px p-2 bg-[#fff] flex flex-col gap-1rem">
        <div className="w-full flex flex-col gap-0.5rem">
          <div>参考图片</div>
          <div className="w-full flex flex-row gap-0.5rem">
            <div>
              <Upload
                className="cursor-pointer"
                accept=".jpg,.png,.jpeg"
                maxCount={1}
                showUploadList={false}
                beforeUpload={async (file) => {
                  const blob = new Blob([file], {
                    type: file.type,
                  });
                  imagePrompt.runAsync({ file });
                  setImageSrc(URL.createObjectURL(blob));
                  return false;
                }}
              >
                {imageSrc ? (
                  <img
                    className="w-100px h-100px object-contain bg-[#ECF0F1] p-2 rounded-lg border-1 border-[#999] border-solid"
                    src={imageSrc}
                  />
                ) : (
                  <div className="flex flex-col w-100px h-100px bg-[#ECF0F1] p-2 rounded-lg border-1 border-[#999] border-solid flex items-center justify-center">
                    <Plus />
                    <div className="text-[#999] text-sm">上传图片</div>
                  </div>
                )}
              </Upload>
            </div>
            <div>
              <Button
                size="small"
                type="primary"
                icon={<Text />}
                disabled={
                  (!Boolean(imageSrc) && toPromptFile === imageUrl) ||
                  imagePrompt.loading
                }
                loading={toPrompt.loading}
                onClick={() => {
                  if (!login) {
                    openModal();
                    return;
                  }
                  toPrompt.runAsync({
                    urlOrIdOrMd5: imageUrl || "",
                  });
                }}
              >
                转描述词
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div>参考强度</div>
          <div>
            <Slider
              value={referenceIntensity}
              min={0}
              max={1}
              step={0.1}
              onChange={setReferenceIntensity}
              tooltip={{
                formatter: (value) => `${value ? value * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex flex-row items-center gap-0.5rem py-2 cursor-default">
            <div>描述词</div>
            {imagePrompt.loading && (
              <div className="flex flex-row items-center gap-0.5rem">
                <div>
                  <LoadingFour className="keyframes-spin-1s block" />
                </div>
                {/* <div>生成中</div> */}
              </div>
            )}
          </div>
          <div>
            <Input.TextArea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoSize={{ minRows: 10, maxRows: 10 }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1rem">
          <div>图片比例</div>
          <div>
            <Select
              className="w-full"
              options={Object.keys(ratioOpts).map((e) => ({
                label: e,
                value: e,
              }))}
              defaultValue="1:1"
              onChange={(e) => {
                setWh(ratioOpts[e].opt["1k"]);
              }}
            />
          </div>
        </div>
        <div>
          <Button type="primary" block onClick={submit}>
            生成图片
          </Button>
        </div>
      </div>
      <div
        className="flex flex-col gap-1rem w-full  p-2 h-[calc(100vh-64px)] overflow-auto"
        ref={container}
      >
        {list?.map((e) => {
          return (
            <Img2ImgCard
              key={e.id}
              onDel={del}
              data={e}
              onCopy={setPrompt}
              showDay={showDay.includes(e.id)}
            />
          );
        })}
        {!list?.length && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div
              className="flex flex-col items-center justify-center gap-2 bg-[#fff] p-2 rounded-lg cursor-pointer"
              onClick={() =>
                setImageSrc(
                  "https://staticsh.zxdz.vip/0aee41b22b1a4d4a88f6b1f4feffcd58.png"
                )
              }
            >
              <img
                className="max-w-200px max-h-200px rounded-lg"
                src="https://staticsh.zxdz.vip/0aee41b22b1a4d4a88f6b1f4feffcd58.png"
                alt=""
              />
              <div className="text-[#999] text-sm">茉莉花茶</div>
            </div>

            <div>导入图片, 生成类似AI图片</div>
          </div>
        )}
      </div>
    </div>
  );
}
