import { get, post, type Records, type SearchParams } from "./request";

export type sceneDetail = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: string;
  sceneId: string;
  cameras: string;
  designIds: string;
  sceneGltf: string;
  remark: string;
  memberId: string;
  viewSort: string;
  sceneVersion: string;
  sceneName: string;
  sceneSnapshot: string;
  designSnapshot: string;
  otherContent: string;
  coverImg: string;
  hdr: string;
};

/**
 * 场景列表
 * @returns
 */
export const sceneListGet = get<
  SearchParams & { sceneName?: string },
  Records<sceneDetail>
>("/buyer/scene/model/getByPage");

/**
 * 场景更新
 * @returns
 */
export const sceneUpdate = post<Partial<sceneDetail>, sceneDetail>(
  "/buyer/scene/model/update"
);

export type sceneModelDetail = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: boolean;
  cateId: string;
  cateName: string;
  cateType: number;
  image: string;
  tags: string;
  scale: string;
  data: string;
  title: string;
  keywrods: string;
  remark: string;
  userId: string;
  viewSort: number;
  sourceSys: string;
};

/**
 * 场景模型列表
 * @returns
 */
export const sceneModelGet = get<
  SearchParams & { sceneName?: string },
  Records<sceneModelDetail>
>("/buyer/scene/model/commom/getByPage");

/**
 * 场景模型设置
 * @returns
 */
export const getSceneModelSetting = get<void, string>(
  "/buyer/scene/model/scenemodel/setting"
);

/*
 * 场景删除
 * @param ids 场景id
 * @returns
 */
export const sceneDel = post<{ ids: string[] }, string>(
  "/buyer/scene/model/delByIds"
);
