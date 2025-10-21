import { getModelList, getModelTag, type ModelDetail } from "@/api/model";
import ImageCard from "@/components/card/imageCard";
import IframeModal from "@/components/modal/iframe";
import { imageOssProcess } from "@/utils/oss";
import { LocalStorage } from "@/utils/storage";
import { usePagination, useRequest } from "ahooks";
import { Input, Layout, Menu, Pagination } from "antd";

import React from "react";
import { openDesign } from "@/utils/open";
import useLogin from "@/utils/hooks/useLogin";

function ModelCard(props: {
  data: ModelDetail;
  onClick?: (data: ModelDetail) => void;
}) {
  const { data, onClick } = props;
  return (
    <ImageCard
      imageSrc={imageOssProcess(data.previewModelImg, "w400h300")}
      imageOnClick={() => onClick?.(data)}
      bottomChildren={
        <div className="text-[#666] font-size-1rem cursor-default">
          {data.modelName}
        </div>
      }
    />
  );
}

const ModelPage: React.FC = React.memo(() => {
  const { ready: login, reset: openLogin } = useLogin();

  const tags = useRequest(getModelTag);

  const data = usePagination(
    async (
      { current, pageSize },
      search?: {
        labelId?: string;
        keyWord?: string;
      }
    ) => {
      const res = await getModelList({
        pageNumber: current,
        pageSize,
        ...search,
      });
      return {
        ...res,
        list: res.records,
      };
    },
    {
      defaultPageSize: 15,
      throttleWait: 1000,
      throttleLeading: false,
      throttleTrailing: true,
    }
  );
  const [_, search] = data.params;

  const handleMsg = (data: any) => {
    if (data.handleMsg === "response" && data.data) {
      openDesign(data.data);
    }
  };

  const {
    open,
    node: IframeNode,
    postMessage,
  } = IframeModal<ModelDetail>({
    url: import.meta.env.VITE_APP_DESIGN_URL + "/params",
    modalProps: {
      width: "80vw",
      height: "80vh",
      title: "模型参数编辑器",
    },
    handleMsg,
  });

  const openModal = (data: ModelDetail) => {
    if (!login) {
      openLogin();
      return;
    }
    open(data);
    postMessage({
      requestCata: "data",
      id: data.designDefaultId,
      type: "model",
      accessToken: LocalStorage.get("accessToken"),
    });
  };

  const menu = tags.data?.map((e) => {
    if (e.children) {
      return {
        key: e.key,
        label: <div>{e.labelName}</div>,
        children: e.children.map((c) => {
          return {
            key: c.key,
            label: (
              <div>
                {c.labelName}
                <span className="text-[#999] font-size-0.8rem m-l-2 cursor-default">
                  {c.modelTotal || 0}
                </span>
              </div>
            ),
          };
        }),
      };
    } else {
      return {
        key: e.key,
        label: (
          <div>
            {e.labelName}
            <span className="text-[#999] font-size-0.8rem m-l-2 cursor-default">
              {e.modelTotal || 0}
            </span>
          </div>
        ),
      };
    }
  });
  menu?.unshift({
    key: "",
    label: (
      <div>
        全部
        <span className="text-[#999] font-size-0.8rem m-l-2 cursor-default">
          {tags.data?.reduce((pre, cur) => pre + (cur.modelTotal || 0), 0) || 0}
        </span>
      </div>
    ),
  });

  return (
    <Layout className="h-full">
      <Layout.Sider>
        <div>
          <Menu
            mode="inline"
            items={menu}
            defaultSelectedKeys={[search?.labelId || ""]}
            onClick={({ key }) => {
              data.run(
                {
                  current: 1,
                  pageSize: data.pagination.pageSize,
                },
                {
                  ...search,
                  labelId: key,
                }
              );
            }}
          />
        </div>
      </Layout.Sider>
      <Layout.Content className="bg-[#fff]">
        {IframeNode}
        <div className="bg-[#fff] px-2  py-2 flex flex-row items-center justify-between">
          <div className="text-[#222] text-xl font-bold">模型</div>
          <div>
            <Input.Search
              width={200}
              placeholder="搜索"
              allowClear
              enterButton
              loading={data.loading}
              onClear={data.refresh}
              onSearch={(value) => {
                if (value !== search?.keyWord) {
                  data.run(
                    {
                      current: 1,
                      pageSize: data.pagination.pageSize,
                    },
                    {
                      ...search,
                      keyWord: value,
                    }
                  );
                }
              }}
            />
          </div>
        </div>
        <div className="bg-[#f5f5f5] flex flex-row flex-wrap justify-start px-2 py-2">
          {data.data?.list.map((item) => {
            return <ModelCard key={item.id} data={item} onClick={openModal} />;
          })}
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
      </Layout.Content>
    </Layout>
  );
});

export default ModelPage;
