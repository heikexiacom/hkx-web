import { Outlet, useSearchParams } from "react-router";
import { Layout } from "antd";
import Header from "./components/header";
import { App as AntdApp } from "antd";
import { webLoginCallback } from "./api/login";
import { handleLogin } from "./utils";
import { useSetAtom } from "jotai";

import { isLogin } from "./store";

function App() {
  const [search, setSearch] = useSearchParams();
  const setLogin = useSetAtom(isLogin);

  if (search.get("state")) {
    webLoginCallback({
      state: search.get("state") || "",
    }).then((res) => {
      handleLogin(res);
      setLogin(true);
    });
    setSearch((prev) => {
      prev.set("state", "");
      return prev;
    });
  }

  return (
    <AntdApp>
      <Layout className="h-screen">
        <Layout.Header>
          <Header></Header>
        </Layout.Header>
        <Layout.Content>
          <Outlet />
        </Layout.Content>
      </Layout>
    </AntdApp>
  );
}

export default App;
