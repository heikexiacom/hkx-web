import { logout } from "@/utils";
import { LocalStorage } from "@/utils/storage";
import {
  DownPicture,
  Logout,
  MaterialThree,
  Mountain,
  Setting,
} from "@icon-park/react";
import { Avatar, Layout, Space } from "antd";
import useApp from "antd/es/app/useApp";
import { NavLink, Outlet } from "react-router";

export default function index() {
  const useInfo = LocalStorage.get("userInfo");

  const siderMenu = [
    {
      icon: <MaterialThree />,
      path: "/workspace/design",
      name: "我的设计",
    },
    {
      icon: <Mountain />,
      path: "/workspace/scene",
      name: "我的场景",
    },
    { icon: <DownPicture />, path: "/workspace/render", name: "我的渲染" },
  ];

  const { modal } = useApp();

  const logOut = () => {
    modal.confirm({
      title: "确认退出登录吗？",
      okText: "确认",
      maskClosable: true,
      okType: "danger",
      cancelText: "取消",
      onOk: logout,
    });
  };

  return (
    <Layout className="w-full h-full">
      <Layout.Sider>
        <div className="flex flex-col justify-between h-full p-b-8 px-4 ">
          <div>
            {useInfo && (
              <div className="flex flex-row items-center px-4 py-2 gap-0.5rem">
                <div>
                  <Avatar src={useInfo.face}>{useInfo.nickName[0]}</Avatar>
                </div>
                <div>{useInfo.nickName}</div>
              </div>
            )}
            <div className="flex flex-col gap-10px ">
              {siderMenu.map((e) => {
                return (
                  <NavLink
                    key={e.path}
                    to={e.path}
                    className={({ isActive }) => {
                      return (
                        " rounded-md block text-[#00000080] px-4 py-2 text-base hover:decoration-none select-none " +
                        (isActive
                          ? "bg-[#f3f3f3] text-[#000]! hover:text-[#000] active:text-[#000] "
                          : " hover:text-[#00000080] active:text-[#00000080] ")
                      );
                    }}
                  >
                    <Space>
                      {e.icon}
                      {e.name}
                    </Space>
                  </NavLink>
                );
              })}
            </div>
          </div>
          <div>
            <NavLink
              to="/workspace/account"
              className={({ isActive }) => {
                return (
                  (isActive
                    ? "bg-[#f3f3f3] text-[#000]!  hover:text-[#000] active:text-[#000] "
                    : " hover:text-[#00000080] active:text-[#00000080] ") +
                  " rounded-md text-[#00000080] block px-4 py-2 text-base hover:decoration-none select-none"
                );
              }}
            >
              <Space>
                <Setting />
                账户设置
              </Space>
            </NavLink>
            <div
              onClick={logOut}
              className=" rounded-md text-[#00000080] block px-4 py-2 text-base hover:decoration-none select-none cursor-pointer"
            >
              <Space>
                <Logout />
                退出登录
              </Space>
            </div>
          </div>
        </div>
      </Layout.Sider>

      <Layout.Content>
        <Outlet />
      </Layout.Content>
    </Layout>
  );
}
