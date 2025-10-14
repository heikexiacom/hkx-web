import Login from "../login";
import { NavLink, useLocation } from "react-router";
import Tabs from "../tabs";

export default function index() {
  const route = [
    {
      path: "/home",
      title: "首页",
      text: "Home",
    },
    {
      path: "/model",
      title: "模型刀版",
      text: "Model",
    },
    {
      path: "/material",
      title: "素材图片",
      text: "Material",
    },
    {
      path: "/inspiration",
      title: "创意设计",
      text: "Inspiration",
    },
  ];
  const location = useLocation();
  return (
    <div className="flex items-center justify-between flex-row h-full">
      <div className="flex items-center flex-row">
        <div
          draggable={false}
          className="text-xl font-bold bg-red text-#fff px-4 py-2 rounded-md mr-2rem select-none"
        >
          HKX
        </div>
        <div>
          <Tabs
            activeBgColor="bg-#000"
            activeTextColor="text-#fff"
            activeKey={
              route.find((item) => location.pathname.startsWith(item.path))
                ?.path || "no-active"
            }
            options={route.map((item) => {
              return {
                key: item.path,
                title: (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    draggable={false}
                    className="block px-4 py-2 text-base font-bold text-gray-800 hover:text-gray-800 hover:decoration-none select-none active:text-gray-600"
                  >
                    {({ isActive }) => {
                      return (
                        <div
                          className={
                            (isActive ? "text-#fff " : "") + "flex items-center"
                          }
                        >
                          {item.title}
                          <span
                            className={`p-l-0.5rem text-sm font-medium transition-all duration-300 ease-out transform origin-left whitespace-nowrap ${
                              isActive
                                ? "translate-x-0 opacity-100 scale-x-100"
                                : "-translate-x-1 opacity-0 scale-x-0 w-0"
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                      );
                    }}
                  </NavLink>
                ),
              };
            })}
          />
        </div>
      </div>
      <div>
        <Login />
      </div>
    </div>
  );
}
