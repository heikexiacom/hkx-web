import {
  materialDelByIds,
  materialListGet,
  type materialItem,
  type mtlType,
} from "@/api/material";
import ImageCard from "@/components/card/imageCard";
import { imageOssProcess } from "@/utils/oss";
import { Delete } from "@icon-park/react";
import { usePagination } from "ahooks";
import { Button, Input, Radio, Select } from "antd";
import useApp from "antd/es/app/useApp";
import React from "react";

export default function index() {
  const data = usePagination(
    async (
      { current, pageSize },
      search?: {
        name?: string;
        type?: mtlType;
      }
    ) => {
      console.log(search);
      const res = await materialListGet({
        pageNumber: current,
        pageSize,
        type: search?.type ?? "GENERAL_PIC",
        name: search?.name,
      });
      return {
        ...res,
        list: res.records,
      };
    },
    {
      defaultPageSize: 15,
      throttleWait: 500,
    }
  );
  const [_, searchParams] = data.params;
  const searchName = searchParams?.name || "";
  const searchType = searchParams?.type ?? "GENERAL_PIC";
  const { message, modal } = useApp();
  const del = async (item: materialItem) => {
    modal.confirm({
      title: `确认删除 ${item.name} 吗？`,
      okText: "确认",
      okType: "danger",
      maskClosable: true,
      okButtonProps: {
        type: "primary",
      },
      onOk: async () => {
        await materialDelByIds({ ids: [item.id] });
        message.success("删除成功");
        data.refresh();
      },
    });
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center p-2 bg-white">
        <div>
          <Radio.Group
            buttonStyle="solid"
            optionType="button"
            options={[
              {
                label: "我的图片",
                value: "GENERAL_PIC",
              },
              {
                label: "矢量素材",
                value: "",
              },
            ]}
            defaultValue="GENERAL_PIC"
            onChange={(e) => {
              console.log(e.target.value);
              if (e.target.value !== searchType) {
                data.run(
                  {
                    current: 1,
                    pageSize: 15,
                  },
                  {
                    type: e.target.value,
                    name: searchName,
                  }
                );
              }
            }}
          />
          {searchType !== "GENERAL_PIC" && (
            <Select
              className="m-l-1rem"
              options={[
                {
                  label: "全部",
                  value: "",
                },
                {
                  label: "形状",
                  value: "SHAPE",
                },
                {
                  label: "图标",
                  value: "ICON",
                },
                {
                  label: "插画",
                  value: "ILLUSTRATION",
                },
                {
                  label: "LOGO",
                  value: "LOGO",
                },
              ]}
              defaultValue=""
              onChange={(e) => {
                if (e !== searchType) {
                  data.run(
                    {
                      current: 1,
                      pageSize: 15,
                    },
                    {
                      type: e as mtlType,
                      name: searchName,
                    }
                  );
                }
              }}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-start items-start gap-2 p-2 gap-2">
        {data.data?.list.map((e) => {
          if (searchType === "GENERAL_PIC") {
            return (
              <ImageCard
                className="w-200px "
                key={e.id}
                imageSrc={imageOssProcess(e.url, "wm")}
                backgroundColor="#fff"
                noPadding
                topRightChildren={
                  <div>
                    <Button
                      onClick={() => del(e)}
                      shape="circle"
                      icon={<Delete className="text-red" />}
                    ></Button>
                  </div>
                }
              />
            );
          }
          return (
            <ImageCard
              className="w-200px "
              key={e.id}
              imageSrc={e.url}
              backgroundColor="#fff"
              noPadding
              topRightChildren={
                <div>
                  <Button
                    onClick={() => del(e)}
                    shape="circle"
                    icon={<Delete className="text-red" />}
                  ></Button>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
