import { sceneDel, sceneListGet, type sceneDetail } from "@/api/scene";
import { imageOssProcess } from "@/utils/oss";
import { Delete, Write } from "@icon-park/react";
import { usePagination } from "ahooks";
import { Button, Input, Pagination, Space } from "antd";
import React from "react";
import useApp from "antd/es/app/useApp";
import ImageCard from "@/components/card/imageCard";
import useEditModal from "./components/edit";
import { openScene } from "@/utils/open";

function SceneCard(props: {
  data: sceneDetail;
  del: (id: string, name: string) => void;
  edit: (d: sceneDetail) => void;
}) {
  const { data, del, edit } = props;

  return (
    <ImageCard
      imageOnClick={() => openScene(data.id)}
      imageSrc={data.coverImg ? imageOssProcess(data.coverImg, "w400h300") : ""}
      topRightChildren={
        <Space>
          <Button
            icon={<Delete />}
            title="删除"
            onClick={() => del(data.id, data.sceneName)}
          ></Button>
        </Space>
      }
      bottomChildren={
        <div className="cursor-default">
          <div
            className="text-[#222] text-l font-bold group w-min flex flex-row items-center cursor-pointer"
            onClick={() => edit(data)}
            title="编辑名称"
          >
            <div className="group-hover:underline w-max group-hover:underline-offset-4">
              {data.sceneName}
            </div>
            <Write className="ml-1 op-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="text-[#999] text-sm">{data.createTime}</div>
        </div>
      }
    />
  );
}

const ScenePage: React.FC = () => {
  const data = usePagination(
    async ({ current, pageSize }, search?: string) => {
      const res = await sceneListGet({
        pageNumber: current,
        pageSize,
        sceneName: search,
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

  const { edit, node: editNode } = useEditModal({
    refresh: data.refresh,
  });

  const deleteScene = async (id: string, name: string) => {
    modal.confirm({
      title: `确认删除场景${name}吗？`,
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await sceneDel({
          ids: [id],
        });
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
            <div className="text-[#222] text-xl font-bold">我的场景</div>
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
                <SceneCard
                  key={e.id}
                  data={e}
                  edit={edit}
                  del={deleteScene}
                ></SceneCard>
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
