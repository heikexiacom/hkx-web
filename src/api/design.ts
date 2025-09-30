import { get, post, type Records, type SearchParams } from "./request";

export type designDetail = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: boolean;
  name: string;
  goodsId: string;
  modelId: string;
  gltf: string;
  layout: string;
  memberId: string;
  storeId: string;
  storeName: string;
  type: string;
  feedsImg: string;
  desJson: string;
  previewModelImg: string;
  originId: string;
  gltfMdfive: string;
  manualUrl: string;
  drawArea: string;
  originName: string;
  ppmm: number;
  auxiliaryLine: string;
  pid: string;
  designStyle: string;
  teaVariety: string;
  nodryLabel: string;
  modelType: string;
  modelStandard: string;
  viewCount: number;
  feedsTrImg: string;
  recommend: string;
  audit: number;
  auditContent: string;
  proxy: string;
  sampleBook: string;
  area: string;
  videoFaceImg: string;
  videoUrl: string;
  arContent: string;
  modelKey: string;
  modelConfig: string;
  editable: number;
  dieline: string;
  designType: number;
  renderingPic: string;
  viewScale: number;
  editConfig: string;
  parameters: string;
  engine: string;
  engineDevice: string;
  labelJson: string;
  modelVersion: string;
  designVersion: string;
  modelName: string;
};

/**
 * 设计列表
 * @param params 搜索参数
 * @returns 设计列表
 */
export const designListGet = get<
  SearchParams & { name?: string },
  Records<designDetail>
>("/buyer/goods/design/getMineDesign");

/**
 * 设计删除
 * @param id 设计id
 * @returns 删除结果
 */
export const designDel = post<{ id: string }>("/buyer/goods/design/delById");

/**
 * 设计更新
 * @param data 设计数据
 * @returns 更新后的设计
 */
export const designUpdate = post<Partial<designDetail>, designDetail>(
  "/buyer/goods/design/edit"
);

/**
 * 复制设计
 * @param id 设计id
 * @returns 复制后的设计
 */
export const designReplicate = get<{ id: string }, designDetail>(
  "/buyer/goods/design/replicate"
);

/**
 * 设计详情
 * @param id 设计id
 * @returns 设计详情
 */
export const designGet = get<{ id: string }, designDetail>(
  "/buyer/goods/design/get"
);

/**
 * 设计克隆
 * @param id 设计id
 * @param phone 目标用户手机号
 * @returns 设计详情
 */
export const designClone = get<{ id: string; phone: string }, designDetail>(
  "/buyer/goods/design/clone"
);
