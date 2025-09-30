import { createBrowserRouter, Navigate } from "react-router";
import ModelPage from "@/pages/model";
import DesignPage from "@/pages/design";
import ScenePage from "@/pages/scene";
import RenderPage from "@/pages/render";
import MaterialPage from "@/pages/material";
import InspirationPage from "@/pages/inspiration";
import WorkspacePage from "@/pages/workspace";
import HomePage from "@/pages/home";
import AccountPage from "@/pages/account";
import Text2imgPage from "@/pages/material/text2img";
import Img2imgPage from "@/pages/material/img2img";
import CollectPage from "@/pages/material/collect";

import App from "@/App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "model",
        element: <ModelPage />,
      },
      {
        path: "workspace",
        element: <WorkspacePage />,
        action: async (a) => {
          console.log(a);
        },
        children: [
          {
            index: true,
            element: <Navigate to="design" replace />,
          },
          {
            path: "design",
            element: <DesignPage />,
          },
          {
            path: "scene",
            element: <ScenePage />,
          },
          {
            path: "render",
            element: <RenderPage />,
          },
          {
            path: "account",
            element: <AccountPage />,
          },
        ],
      },
      {
        index: true,
        element: <Navigate to="home" replace />,
      },
      {
        path: "material",
        element: <MaterialPage />,

        children: [
          {
            index: true,
            element: <Navigate to="text2img" replace />,
          },
          {
            path: "text2img",
            element: <Text2imgPage />,
          },
          {
            path: "img2img",
            element: <Img2imgPage />,
          },
          {
            path: "collect",
            element: <CollectPage />,
          },
        ],
      },
      {
        path: "inspiration",
        element: <InspirationPage />,
      },
      {
        path: "*",
        element: <Navigate to="/home" replace />,
      },
    ],
  },
]);

export default router;
