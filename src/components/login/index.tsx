import { Modal, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { Wechat } from "@icon-park/react";
import { webLogin } from "@/api/login";
import AccountLogin from "./accountLogin";
import CodeLogin from "./smsLogin";
import { LocalStorage } from "@/utils/storage";
import { NavLink } from "react-router";
import { useAtom } from "jotai";
import { isLogin, openLoginModal } from "@/store";

export default function Index() {
  const [open, setOpen] = useAtom(openLoginModal);
  const [login, setLogin] = useAtom(isLogin);
  function handleMessage(
    event: MessageEvent<{
      target: "LoginModal";
      event: "open" | "close";
    }>
  ) {
    if (event.data.target === "LoginModal") {
      setOpen(event.data.event === "open");
    }
  }

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);
    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, []);
  const baseUrl = `https://${window.location.hostname
    .split(".")
    .slice(1)
    .join(".")}`;
  const webUrl =
    import.meta.env.MODE === "dev" ? "http://localhost:10000" : baseUrl;

  return (
    <div>
      <Modal
        open={open}
        footer={null}
        width={300}
        styles={{
          content: {
            paddingTop: "10px",
            paddingBottom: "10px",
          },
        }}
        onCancel={() => {
          setOpen(false);
        }}
        closable={false}
      >
        <Tabs
          size="small"
          items={[
            {
              key: "account",
              label: "账号登录",
              children: (
                <AccountLogin
                  onLoginSuccess={() => {
                    setOpen(false);
                    setLogin(true);
                  }}
                />
              ),
            },
            {
              key: "sms",
              label: "短信登录",
              children: (
                <CodeLogin
                  onLoginSuccess={() => {
                    setOpen(false);
                    setLogin(true);
                  }}
                />
              ),
            },
          ]}
        />
        <div className="m-t-6px h-min flex flex-row justify-between items-center">
          <div
            className="cursor-pointer"
            title="微信登录"
            onClick={() => {
              webLogin("WECHAT_PC");
            }}
          >
            <Wechat theme="outline" size="24" fill="#09BB07" />
          </div>

          <div className="line">
            <a
              href={`${webUrl}/signUp`}
              target="_blank"
              className="m-r-10px"
              rel="noreferrer"
            >
              注册账号
            </a>
            <a
              href={`${webUrl}/forgetPassword`}
              target="_blank"
              rel="noreferrer"
            >
              忘记密码
            </a>
          </div>
        </div>
      </Modal>
      <div>
        {login ? (
          <NavLink
            className={({ isActive }) => {
              return (
                (isActive ? "bg-#000 " : "bg-transparent ") +
                "block px-4 py-2 rounded-md text-base font-bold text-gray-800 hover:text-gray-600 hover:decoration-none select-none active:text-gray-600"
              );
            }}
            to="/workspace"
          >
            {({ isActive }) => {
              if (isActive) {
                return (
                  <div
                    className={
                      (isActive ? "text-#fff " : "") + "flex items-center"
                    }
                  >
                    工作台
                  </div>
                );
              }
              return <div>工作台</div>;
            }}
          </NavLink>
        ) : (
          <div
            onClick={() => {
              setOpen(true);
            }}
            className="cursor-pointer"
          >
            登录
          </div>
        )}
      </div>
    </div>
  );
}
