import { Modal, Tabs } from "antd";
import { useEffect, useState } from "react";
import { Wechat } from "@icon-park/react";
import { webLogin } from "@/api/login";
import AccountLogin from "./accountLogin";
import CodeLogin from "./smsLogin";
import { NavLink } from "react-router";
import { useAtom } from "jotai";
import { isLogin, openLoginModal } from "@/store";
import Register from "./register";
import FindPassword from "./findPassword";

function LoginTab(props: {
  onLoginSuccess: () => void;
  setTabKey: (key: "login" | "register" | "findPassword") => void;
}) {
  return (
    <div>
      <Tabs
        size="small"
        items={[
          {
            key: "account",
            label: "账号登录",
            children: <AccountLogin onLoginSuccess={props.onLoginSuccess} />,
          },
          {
            key: "sms",
            label: "短信登录",
            children: <CodeLogin onLoginSuccess={props.onLoginSuccess} />,
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

        <div className="line flex flex-row gap-2">
          <div
            onClick={() => props.setTabKey("register")}
            className="cursor-pointer"
          >
            注册账号
          </div>
          <div
            onClick={() => props.setTabKey("findPassword")}
            className="cursor-pointer"
          >
            忘记密码
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalTab(props: {
  onLoginSuccess: () => void;
  tabKey: "login" | "register" | "findPassword";
  setTabKey: (key: "login" | "register" | "findPassword") => void;
}) {
  if (props.tabKey === "login") {
    return (
      <LoginTab
        onLoginSuccess={props.onLoginSuccess}
        setTabKey={props.setTabKey}
      />
    );
  }
  if (props.tabKey === "register") {
    return <Register onBack={() => props.setTabKey("login")} />;
  }
  if (props.tabKey === "findPassword") {
    return <FindPassword onBack={() => props.setTabKey("login")} />;
  }
  return null;
}

export default function Index() {
  const [open, setOpen] = useAtom(openLoginModal);
  const [login, setLogin] = useAtom(isLogin);
  const [tabKey, setTabKey] = useState<"login" | "register" | "findPassword">(
    "login"
  );

  useEffect(() => {
    if (open) {
      setTabKey("login");
    }
  }, [open]);

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

  const handleLoginSuccess = () => {
    setOpen(false);
    setLogin(true);
  };

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
        <ModalTab
          onLoginSuccess={handleLoginSuccess}
          tabKey={tabKey}
          setTabKey={setTabKey}
        />
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
