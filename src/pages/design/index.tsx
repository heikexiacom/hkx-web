import {
  designDel,
  designListGet,
  designReplicate,
  type designDetail,
} from "@/api/design";
import { imageOssProcess } from "@/utils/oss";
import { usePagination } from "ahooks";
import { App, Button, Input, Pagination, Space } from "antd";
import React from "react";
import "./index.scss";
import { Copy, Delete, Send, ShareTwo, Write } from "@icon-park/react";
import useShareModal from "./components/share";
import useEditModal from "./components/edit";
import usePushModal from "./components/push";
import ImageCard from "@/components/card/imageCard";
import { openDesign } from "@/utils/open";
import { getMapName } from "@/utils";

function DesignCard(props: {
  data: designDetail;
  copy: (id: string, name: string) => void;
  delete: (id: string, name: string) => void;
  share: (d: designDetail) => void;
  edit: (d: designDetail) => void;
  push: (d: designDetail) => void;
}) {
  const { data, copy, delete: del, share, edit, push } = props;

  const mapName = getMapName(data.feedsImg);
  const layout = JSON.parse(data.layout) as {
    displayName: string;
    fill?: string;
  }[];
  const currentLayout = layout.find((item) => item.displayName === mapName);
  const fill = currentLayout?.fill;

  return (
    <ImageCard
      backgroundColor={fill}
      imageOnClick={() => openDesign(data.id)}
      imageSrc={imageOssProcess(
        data.feedsImg || data.feedsTrImg,
        "w400h300noColor"
      )}
      bottomChildren={
        <div>
          <div
            className="text-[#222] w-min text-l font-bold group flex flex-row items-center cursor-pointer"
            onClick={() => edit(data)}
            title="编辑名称"
          >
            <div className="w-max group-hover:underline group-hover:underline-offset-4">
              {data.name}
            </div>
            <Write className="ml-1 op-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="text-[#999] text-sm cursor-default flex flex-row items-center justify-between">
            <div>{data.createTime}</div>
            <div>{data.modelName}</div>
          </div>
        </div>
      }
      className="designCard"
      topRightChildren={
        <Space>
          {[
            {
              icon: <Copy />,
              title: "复制",
              onClick: () => copy(data.id, data.name),
            },
            {
              icon: <ShareTwo />,
              title: "分享",
              onClick: () => share(data),
            },
            {
              icon: <Send />,
              title: "推送",
              onClick: () => push(data),
            },
            {
              icon: <Delete />,
              title: "删除",
              onClick: () => del(data.id, data.name),
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
    />
  );
}

const DesignPage: React.FC = () => {
  const data = usePagination(
    async ({ current, pageSize }, search?: string) => {
      const res = await designListGet({
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
  const { share, node: shareModal } = useShareModal();
  const { edit, node: editModal } = useEditModal({
    refresh: data.refresh,
  });
  const { push, node: pushModal } = usePushModal();
  const { message, modal } = App.useApp();

  const designCopy = async (id: string, name: string) => {
    modal.confirm({
      title: `复制设计 [${name}]`,
      content: "确定复制设计吗？",
      okText: "确定",
      cancelText: "取消",
      maskClosable: true,
      onOk: async () => {
        await designReplicate({ id });
        message.success("复制成功");
        data.refresh();
      },
    });
  };

  const designDelete = async (id: string, name: string) => {
    modal.confirm({
      title: `删除设计 [${name}]`,
      content: "确定删除设计吗？",
      okText: "确定",
      cancelText: "取消",
      maskClosable: true,
      onOk: async () => {
        await designDel({ id });
        message.success("删除成功");
        data.refresh();
      },
    });
  };

  return (
    <div className="w-full h-full bg-[#fff]">
      {shareModal}
      {editModal}
      {pushModal}
      <div className="h-[calc(100%-0px)] overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="bg-[#fff] px-2 py-2 flex flex-row items-center justify-between">
            <div className="text-[#222] text-xl font-bold">我的设计</div>
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
                <DesignCard
                  key={e.id}
                  data={e}
                  copy={designCopy}
                  delete={designDelete}
                  share={share}
                  edit={edit}
                  push={push}
                ></DesignCard>
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

export default DesignPage;
