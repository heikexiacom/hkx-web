import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "virtual:uno.css";
import "@/styles/index.css";
import router from "@/router";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {},
      components: {
        Layout: {
          headerBg: "#fff",
          siderBg: "#fff",
        },
        Card: {
          bodyPadding: 0,
        },
      },
    }}
  >
    <RouterProvider router={router} />
  </ConfigProvider>
  // </StrictMode>
);
