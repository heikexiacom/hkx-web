import { del, get, post, type Records, type SearchParams } from "./request";

export type renderDetail = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: string;
  memberId: string;
  designId: string;
  picName: string;
  pxRatio: string;
  showName: string;
  downloadUrl: string;
  renderId: string;
  mdFive: string;
  finalCost: string;
  timeCost: string;
  renderStatus: "HANDLE" | "SUCCESS" | "ERROR";
  remark: string;
  thumbnail: string;
  sceneId: string;
  speedInfo: string;
};
export type speedInfoType = {
  msg: string;
  over: string;
  code: string;
  time: string;
  taskid: string;
};

/**
 * 渲染列表
 */
export const renderListGet = get<
  SearchParams & { name?: string },
  Records<renderDetail>
>("buyer/goods/design/getMineRender");

/**
 * 渲染删除
 */
export const renderDel = (id: string) => {
  return del<void, void>(`buyer/goods/design/deleteRender/${id}`)();
};

/**
 * 渲染更新名称
 */
export const renderUpdateRenderName = post<
  { renderId: string; picName: string },
  renderDetail
>("/buyer/scene/model/updateRenderName");
