import { MaterialThree, NewPicture, Text } from "@icon-park/react";
import { Layout } from "antd";
import React from "react";
import { NavLink } from "react-router";
import { Outlet } from "react-router";

export default function index() {
  const menu = [
    {
      title: "文生图",
      key: "text2img",
      icon: <Text size={36} />,
    },
    {
      title: "图生图",
      key: "img2img",
      icon: <NewPicture size={36} />,
    },
    {
      title: "我的收藏",
      key: "collect",
      icon: <MaterialThree size={36} />,
    },
  ];

  return (
    <Layout className="h-full w-full">
      <Layout.Sider width={"7rem"} className="px-1rem h-full ">
        <div className="flex flex-col gap-1rem">
          {menu.map((e) => {
            return (
              <NavLink
                to={e.key}
                key={e.key}
                className={({ isActive }) => {
                  return (
                    " rounded-lg overflow-hidden block text-gray-400 text-base hover:decoration-none select-none " +
                    (isActive
                      ? "bg-[#f3f3f3] text-[#000]! hover:text-[#000] active:text-[#000] "
                      : " hover:text-gray-400 active:text-gray-400 ")
                  );
                }}
              >
                <div className="w-5rem h-5rem user-select-none flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:bg-[#f5f5f5]">
                  <div>{e.icon}</div>
                  <div className="ext-gray-400 text-sm font-bold ">
                    {e.title}
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </Layout.Sider>
      <Layout.Content>
        <Outlet />
      </Layout.Content>
    </Layout>
  );
}
