import { get, post, type SearchParams, type Records } from "./request";

/* 文生图 即梦
 * @param params
 * @returns 任务id
 */
export const jmText2img = post<
  {
    height: number; // 图片高度
    width: number; // 图片宽度
    logoContent?: string; // 水印
    prompt: string; // 提示词
    seed?: number; // 随机种子
    usePreLlm?: boolean; // 文本拓写
  },
  string // 任务id
>("/buyer/aiart/design/tool/textCreateImage/jm");

export const jmImg2img = post<
  {
    height: number;
    imgContent: string;
    logoContent?: string;
    prompt: string;
    scale: number;
    seed?: number;
    width: number;
  },
  string // 任务id
>("/buyer/aiart/design/tool/imageCreateImage/jm");

export type text2imgItemLastOutItem = {
  orig_prompt: string; // 原始提示词
  actual_prompt: string; // 实际提示词
  url: string; // 图片url
  imageId: string;
  id: string;
  collectStatus: string;
};
/* 文生图 即梦 状态查询
 * @param params
 * @returns 图片信息
 */
export const jmText2imgStatus = get<
  {
    taskId: string; // 任务id
  },
  text2imgItemLastOutItem[]
>("/buyer/aiart/design/task/fetchImageInfo");

export type Text2imgItem = {
  id: string;
  createTime: string;
  updateTime: string;
  deleteFlag: boolean;
  memberId: string;
  prompt: string;
  downloadUrl: string;
  txtContent: string;
  inputJson: string;
  createSource: string;
  timeCost: string;
  picStatus: "HANDLE" | "SUCCESS";
  remark: string;
  keepDays: number;
  taskId: string;
  localUrl: string;
  pxRatioX: number;
  pxRatioY: number;
  imgContent: string;
  imageNum: number;
  imgSyn: number;
  aiType: number;
  inputImage: string;
  sessionId: string;
  imgStyle: string;
  speedInfo: string;
  finalCost: string;
  lastOut: string;
  showName: string;
  designId: string;
  formatOut: number;
};

export const getText2imgList = get<
  SearchParams & {
    name?: string; // 任务id
    imageType: 0 | 1;
  },
  Records<Text2imgItem>,
  SearchParams & {
    name?: string;
    imageType: 0 | 1;
  },
  Records<
    Omit<Text2imgItem, "lastOut"> & {
      lastOut: text2imgItemLastOutItem[];
    }
  >
>("/buyer/aiart/design/images/getByPage", {
  convertResponse(response) {
    const res = response.records.map((e) => {
      const lastOut = JSON.parse(
        e.lastOut || "[]"
      ) as text2imgItemLastOutItem[];
      return {
        ...e,
        lastOut,
      };
    });
    return {
      ...response,
      records: res,
    };
  },
});

/*
 * 文生图 即梦 删除
 * @param params
 * @returns 是否删除成功
 */
export const delText2img = post<
  {
    ids: string[]; // 图片id
  },
  boolean
>("/buyer/aiart/design/images/delByIds");

/* 文生图 即梦 收藏图片
 * @param params
 * @returns 是否收藏成功
 */
export const collectImg = post<
  {
    collectStatus: "1" | "2"; //1 收藏 2 取消收藏
    id: string;
    imageId: string;
  },
  void
>("/buyer/aiart/design/tool/imageCollectToMaterial");

/* 文生图 即梦 图片获取信息
 * @param params
 * @returns 图片信息
 */
export const imageToImageFileUpload = post<
  {
    file: File;
  },
  {
    id: string;
    createTime: string;
    updateTime: string;
    name: string;
    newName: string;
    fileSize: string;
    fileType: string;
    url: string;
    localUrl: string;
    ownerId: string;
    createPrompt: string;
    toPrompt: string;
    remark: string;
    deleteStatus: number;
    mdFive: string;
  }
>("/buyer/aiart/design/tool/imageToImageFileUpload", {
  formData: true,
});

/* 文生图 即梦 图片获取提示词
 * @param params
 * @returns 提示词
 */
export const imageToPrompt = get<{ urlOrIdOrMd5: string }, string>(
  "/buyer/aiart/design/tool/imageToPrompt"
);

//coze

/**
 * coze 创建对话
 * @returns
 */
export const conversationCreate = post<
  void,
  {
    id: string;
    created_at: number;
    meta_data: {
      userId: string;
    };
    last_section_id: string;
  }
>("/buyer/aiart/agent/conversationCreate");

/**
 * coze 清除对话
 * @param params
 * @returns 是否清除成功
 */
export const conversationClear = post<
  {
    conversationId: string;
  },
  boolean
>("/buyer/aiart/agent/conversationClear");

/*
 * coze 删除对话
 * @param params
 * @returns 是否删除成功
 */
export const conversationRemove = post<
  {
    id: string; //ConversationItem.id
  },
  boolean
>("/buyer/aiart/agent/conversationRemove");

export type ConversationItem = {
  id: string;
  createTime: string;
  updateTime: string;
  deleteFlag: boolean;
  memberId: string;
  sessionId: string;
  prompt: string;
  showName: string;
  txtContent: string;
  createSource: string;
  remark: string;
  keepDays: number;
  agentId: string;
  imgUrl: string;
};

/**
 * coze 对话列表
 * @param params
 * @returns 对话列表
 */
export const conversationList = get<
  SearchParams & {
    imageType?: 0 | 1;
    name?: string;
  },
  Records<ConversationItem>
>("/buyer/aiart/agent/conversationList");

export type content_object =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      file_id: string;
      file_url: string;
      size: number;
      name: string;
    };

export type chatItem = {
  audio: string;
  role: "user" | "assistant";
  type:
    | "question"
    | "answer"
    | "function_call"
    | "tool_response"
    | "follow_up"
    | "verbose";
  content: string;
  content_type: "text" | "object_string" | "card";
  meta_data: Record<string, string>;
  id: string;
  conversation_id: string;
  section_id: string;
  bot_id: string;
  chat_id: string;
  created_at: number;
  updated_at: number;
  reasoning_content: string;
};

/**
 * coze 对话详情
 * @param params
 * @returns 对话详情
 */
export const conversationMessageList = get<
  {
    conversationId: string; //  ConversationItem.sessionId
  },
  {
    total: string;
    items: Array<chatItem>;
    iterator: Array<chatItem>;
    hasMore: boolean; //是否已返回全部消息。
    lastID: string; //返回的消息列表中，最后一条消息的 Message ID。
    firstID: string; //返回的消息列表中，第一条消息的 Message ID。
    logID: string;
  }
>("/buyer/aiart/agent/conversationMessageList");

/*
 * coze 对话显示图片编辑
 * @param params
 * @returns 是否编辑成功
 */
export const conversationEdit = post<
  {
    conversationId: string; //ConversationItem.sessionId
    imgUrl: string;
  },
  boolean
>("/buyer/aiart/agent/conversationEdit");

/*
 * coze 对话文件上传
 * @param params
 * @returns 文件上传信息
 */
export const chatFileUpload = post<
  {
    file: File;
  },
  {
    id: string;
    bytes: number;
    created_at: number;
    file_name: string;
    url: string;
  }
>("/buyer/aiart/agent/chatFileUpload", {
  formData: true,
});

/*
 * coze 取消对话
 * @param params
 * @returns 是否取消成功
 */
export const chatCancel = post<
  {
    conversationId: string; //ConversationItem.sessionId
    chatId: string;
  },
  boolean
>("/buyer/aiart/agent/chatCancel");

export type chatSteamObject =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "file" | "image" | "audio";
      file_id: string;
      file_url: string;
    };

export type eventType =
  | "chatid"
  | "chatInfo"
  | "think"
  | "answer"
  | "verbose"
  | "suggestion"
  | "over";

export type msgEvent = {
  event: eventType;
  data: chatSteamObject;
};

export const cozeChatApi =
  import.meta.env.VITE_APP_API_BASE_URL + "/buyer/aiart/agent/converseChat";

export const cancelChat = post<
  {
    chatId: string;
    conversationId: string;
  },
  {
    logID: string;
    chat: {
      id: string;
      conversation_id: string;
      bot_id: string;
      created_at: number;
      completed_at: number;
      failed_at: string;
      meta_data: string;
      last_error: string;
      status: string;
      required_action: string;
      usage: string;
    };
  }
>("/buyer/aiart/agent/cancelChat");

export const designStyleList = get<
  void,
  Array<{
    id: string;
    name: string;
    image: string;
    remark: string;
  }>
>("/buyer/aiart/design/tool/style/list", {
  cache: true,
});

export type toolIdEnum = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export const imageTool = post<
  {
    imgUrlOrIdOrMd5: string;
    prompt: string;
    sessionId: string;
    toolId: toolIdEnum;
  },
  string
>("/buyer/aiart/design/tool/imageBox");
