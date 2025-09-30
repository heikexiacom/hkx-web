import { imageOssProcess } from "@/utils/oss";
import { Delete, Download, Write } from "@icon-park/react";
import { usePagination } from "ahooks";
import { Input, Pagination, Image, Space, Button } from "antd";
import React from "react";
import useApp from "antd/es/app/useApp";
import {
  renderDel,
  renderListGet,
  type renderDetail,
  type speedInfoType,
} from "@/api/render";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import "./index.scss";
import { downloadUrlFile } from "@/utils";
import ImageCard from "@/components/card/imageCard";
import useEditModal from "./components/edit";
import ErrorImg from "@/components/image/error";
import GearSpinnerImg from "@/components/image/gearSpinner";

function RenderStatus(props: { data: renderDetail; download: () => void }) {
  const { data, download } = props;
  if (data.renderStatus === "HANDLE") {
    const speedInfo = JSON.parse(data.speedInfo) as speedInfoType;
    return (
      <GearSpinnerImg
        className="w-full h-full p-2 rounded-lg border-1 border-[#999] border-solid"
        width={400}
        height={300}
        text={speedInfo.over}
      />
    );
  }
  if (data.renderStatus === "SUCCESS" && data.thumbnail) {
    return (
      <Image
        className="w-full h-full bg-[#ECF0F1] p-2 rounded-lg border-1 border-[#999] border-solid overflow-hidden"
        src={imageOssProcess(data.thumbnail, "w400h300")}
        preview={{
          src: data.thumbnail,
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
                <DownloadOutlined onClick={download} />
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
    );
  }
  return (
    <ErrorImg
      className="w-full h-full bg-[#ECF0F1] p-2 rounded-lg border-1 border-[#999] border-solid"
      width={400}
      height={300}
      text="图片渲染失败"
    />
  );
}

function RenderCard(props: {
  data: renderDetail;
  del: (id: string, name: string) => void;
  edit: (d: renderDetail) => void;
}) {
  const { data, del, edit } = props;

  const { message } = useApp();
  const download = async () => {
    try {
      await downloadUrlFile(data.downloadUrl, data.picName);
      message.success("下载成功");
    } catch (e) {
      message.error("下载失败");
    }
  };

  const btns = data.downloadUrl
    ? [
        {
          icon: <Download />,
          title: "下载",
          onClick: download,
        },
      ]
    : [];

  return (
    <ImageCard
      imageSrc={"1"}
      topLeftChildren={
        data.renderStatus === "HANDLE" ? (
          <div className="px-2 h-1.5rem line-height-1.5rem bg-[#1677FF] text-[#fff] rounded">
            渲染中
          </div>
        ) : undefined
      }
      topLeftChildrenLock
      topRightChildren={
        <Space>
          {[
            ...btns,
            {
              icon: <Delete />,
              title: "删除",
              onClick: () => del(data.id, data.picName),
            },
          ].map((item) => (
            <Button
              key={item.title}
              icon={item.icon}
              title={item.title}
              onClick={item.onClick}
            ></Button>
          ))}
        </Space>
      }
      bottomChildren={
        <div>
          <div
            className="text-[#222] text-l w-min font-bold group flex flex-row items-center cursor-pointer"
            onClick={() => edit(data)}
            title="编辑名称"
          >
            <div className="group-hover:underline group-hover:underline-offset-4 w-max">
              {data.picName}
            </div>
            <Write className="ml-1 op-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="text-[#999] text-sm cursor-default flex flex-row items-center justify-between">
            <div>{data.createTime}</div>
            <div>{data.pxRatio.replace("x", "×")}</div>
          </div>
        </div>
      }
      imageNode={<RenderStatus data={data} download={download} />}
    />
  );
}

const ScenePage: React.FC = () => {
  const data = usePagination(
    async ({ current, pageSize }, search?: string) => {
      const res = await renderListGet({
        pageNumber: current,
        pageSize,
        name: search,
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
  const [_, search] = data.params;

  const { modal, message } = useApp();

  const { edit, node: editNode } = useEditModal({ refresh: data.refresh });

  const deleteRender = async (id: string, name: string) => {
    modal.confirm({
      title: `确认删除渲染图片 ${name} 吗？`,
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      maskClosable: true,
      onOk: async () => {
        await renderDel(id);
        message.success("删除成功");
        data.refresh();
      },
    });
  };

  return (
    <div className="w-full h-full bg-[#fff]">
      {editNode}
      <div className="h-[calc(100%-0px)] overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="bg-[#fff] px-2 py-2 flex flex-row items-center justify-between">
            <div className="text-[#222] text-xl font-bold">我的渲染</div>
            <div>
              <Input.Search
                placeholder="搜索"
                allowClear
                enterButton
                loading={data.loading}
                onClear={data.refresh}
                onSearch={(value) => {
                  if (value !== search) {
                    data.run(
                      {
                        current: 1,
                        pageSize: data.pagination.pageSize,
                      },
                      value
                    );
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-row flex-wrap justify-start px-2 py-2">
            {data.data?.list.map((e) => {
              return (
                <RenderCard
                  key={e.id}
                  data={e}
                  edit={edit}
                  del={deleteRender}
                />
              );
            })}
          </div>
        </div>
        <div className="bg-[#fff] flex items-center justify-end px-2 py-2">
          <Pagination
            total={data.pagination.total}
            current={data.pagination.current}
            pageSize={data.pagination.pageSize}
            showSizeChanger={false}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(current, pageSize) => {
              data.run(
                {
                  current,
                  pageSize,
                },
                search
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScenePage;
