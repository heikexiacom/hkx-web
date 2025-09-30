import { get, type Records, type SearchParams } from "./request";

export type modelTag = {
  modelTotal: number;
  labelId: string;
  labelName: string;
  title: string;
  value: string;
  key: string;
  children: modelTag[];
};

export const getModelTag = get<void, modelTag[]>("/buyer/model/labelTreeData");

export type ModelDetail = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: boolean;
  modelName: string;
  gltf: string;
  previewModelImg: string;
  status: string;
  layout: string;
  previewLayoutImg: string;
  manualUrl: string;
  ppmm: number;
  auxiliaryLine: string;
  modelType: string;
  modelStandard: string;
  series: string;
  area: string;
  modelKey: string;
  modelConfig: string;
  editable: number;
  dieline: string;
  designType: number;
  viewScale: number;
  editConfig: string;
  parameters: string;
  pid: string;
  designDefaultId: string;
  engine: string;
  engineDevice: string;
  labelJson: string;
  modelVersion: string;
  recommend: number;
  modelSort: string;
  modelAlias: string;
};
export const getModelList = get<
  SearchParams & {
    keyWord?: string;
    labelId?: string;
  },
  Records<ModelDetail>
>("/buyer/model/getModelLabelByPage");
