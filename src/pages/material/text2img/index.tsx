import {
  delText2img,
  designStyleList,
  getText2imgList,
  jmText2img,
  type Text2imgItem,
  type text2imgItemLastOutItem,
} from "@/api/ai";
import InfiniteSpinnerImg from "@/components/image/infiniteSpinner";
import ErrorImage from "@/components/image/error";
import { downloadUrlFile, gcd, getStyleFromPrompt } from "@/utils";
import { Copy, Delete } from "@icon-park/react";

import { useInfiniteScroll, useRequest, useThrottleEffect } from "ahooks";
import { Button, Input, Select } from "antd";
import useApp from "antd/es/app/useApp";
import dayjs from "dayjs";
import "./index.scss";
import { useEffect, useRef, useState } from "react";
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

function Text2ImgCard(props: {
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

  const pr = Math.max(data.pxRatioX, data.pxRatioY) / 200;
  const w = data.pxRatioX / pr;
  const h = data.pxRatioY / pr;
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
        <div className="text-l font-mid">{data.prompt}</div>
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
      <div className="p-t-2 w-full">
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
  const [prompt, setPrompt] = useState("");
  const { ready: login, reset: openModal } = useLogin();
  const [wh, setWh] = useState<[number, number]>([1328, 1328]);
  const container = useRef<HTMLDivElement>(null);

  const styles = useRequest(designStyleList);

  const data = useInfiniteScroll(
    async (params) => {
      const { pageSize, pageNumber } = params ?? {
        pageSize: 10,
        pageNumber: 0,
      };
      const { records: result, total } = await getText2imgList({
        pageSize,
        pageNumber: pageNumber + 1,
        imageType: 0,
      });
      return {
        list: result,
        pageSize,
        pageNumber: pageNumber + 1,
        total,
      };
    },
    {
      manual: true,
      target: container,
      direction: "bottom",
      isNoMore: (payload) => {
        if (!payload) {
          return true;
        }
        return payload.list.length >= payload.total;
      },
    }
  );

  const list = data.data?.list as
    | (Omit<Text2imgItem, "lastOut"> & {
        lastOut: text2imgItemLastOutItem[];
      })[]
    | undefined;

  const submit = useRequest(jmText2img, {
    manual: true,
    onSuccess: data.reload,
    onError: (e) => {
      message.error(e.message);
    },
  });

  const { modal, message } = useApp();

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

  useEffect(() => {
    if (login) {
      data.reload();
    } else {
      openModal();
    }
  }, [login]);

  const dayMap = list?.reduce((prev, cur) => {
    const day = dayjs(cur.createTime).format("YYYY-MM-DD");
    if (prev[day]) {
      return prev;
    }
    prev[day] = cur.id;
    return prev;
  }, {} as Record<string, string>);
  const showDay = Object.values(dayMap || {});

  return (
    <div className="flex flex-row w-full h-full">
      <div className="w-300px min-w-300px p-2 bg-[#fff] flex flex-col gap-1rem">
        <div className="flex flex-col gap-1rem">
          <div>设计风格</div>
          <div className="grid grid-cols-3 gap-1rem">
            {styles.data?.map((e, _, arr) => {
              const isActive = prompt.includes(e.name);

              return (
                <div
                  key={e.id}
                  className={`flex flex-col items-center cursor-pointer relative rounded-md ${
                    isActive
                      ? "border-2 border-[#1677ff]"
                      : "border-2 border-[#fff]"
                  }`}
                  onClick={() => {
                    if (isActive) {
                      return;
                    }
                    const s = arr.find((e) => prompt.includes(e.name));
                    if (s) {
                      setPrompt(prompt.replace(s.name, e.name));
                    } else {
                      const style = getStyleFromPrompt(prompt);
                      if (style) {
                        setPrompt(prompt.replace(style, e.name));
                      } else {
                        setPrompt(
                          (pre) => pre + (pre ? "\n" : "") + `风格:${e.name}`
                        );
                      }
                    }
                  }}
                >
                  <img src={e.image} className="w-full h-full " />
                  <div className="text-sm text-center absolute bottom-0 left-0 right-0 bg-[#00000080] text-[#fff]">
                    {e.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1rem">
          <div>描述词</div>
          <Input.TextArea
            rows={4}
            placeholder="请输入画面描述"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            autoSize={{ minRows: 10, maxRows: 10 }}
          />
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
          <Button
            type="primary"
            block
            loading={submit.loading}
            onClick={() => {
              if (!prompt) {
                return;
              }
              if (!login) {
                openModal();
                return;
              }
              submit.run({
                prompt,
                height: wh[1],
                width: wh[0],
              });
              setPrompt("");
            }}
          >
            立即生成
          </Button>
        </div>
      </div>
      <div
        className="flex flex-col gap-1rem w-full  p-2 h-[calc(100vh-64px)] overflow-auto"
        ref={container}
      >
        {list?.map((e) => {
          return (
            <Text2ImgCard
              key={e.id}
              onDel={del}
              data={e}
              onCopy={setPrompt}
              showDay={showDay.includes(e.id)}
            />
          );
        })}

        {!list?.length && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-[#fff] p-2 rounded-md">
              <div className="flex flex-row items-center justify-between cursor-default">
                <div>试试生成这么一个包装设计</div>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    setPrompt(
                      "一个简约的包装设计，产品为矿泉水，品牌名为WATER，包装样式为塑料瓶，设计风格为极简几何风，设计元素为抽象山峰轮廓、渐变水流纹、哑光磨砂质感，主题配色为冰川蓝渐变至墨黑"
                    );
                  }}
                >
                  使用
                </Button>
              </div>
              <div className="cursor-default">
                <p> - **产品**：矿泉水 </p>
                <p>- **品牌名**：WATER -</p>
                <p>- **包装样式**：塑料瓶 -</p>
                <p>- **设计风格**：极简几何风 -</p>
                <p>- **设计元素**：抽象山峰轮廓、渐变水流纹、哑光磨砂质感 -</p>
                <p>- **主题配色**：冰川蓝渐变至墨黑 -</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
