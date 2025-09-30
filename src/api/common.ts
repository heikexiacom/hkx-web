import { post } from "./request";

export const convertLongToShort = post<{ longUrl: string }, string>(
  "common/shortlink/convert/longToShort"
);
