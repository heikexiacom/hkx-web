import { del, get, type Records, type SearchParams } from "./request";

export type picItem = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: boolean;
  name: string;
  type: string;
  url: string;
  imgRatio: number;
  userId: string;
  viewSort: number;
};

export const picListGet = get<
  SearchParams & {
    name?: string;
  },
  Records<picItem>
>("/common/common/file/getFileListDesign");

export const picDelByIds = (ids: string[]) =>
  del<void, void>(`/common/common/file/delete/${ids.join(",")}`)();
