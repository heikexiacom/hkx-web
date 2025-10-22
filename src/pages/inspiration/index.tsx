import {
  chatFileUpload,
  conversationList,
  conversationMessageList,
  conversationRemove,
  designStyleList,
  imageTool,
  type chatItem,
  type content_object,
  type ConversationItem,
  type toolIdEnum,
} from "@/api/ai";
import {
  EnterOutlined,
  MoreOutlined,
  RedoOutlined,
  UserOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";
import { Bubble, Prompts, Sender, Suggestion, Welcome } from "@ant-design/x";
import { Check, Close, UploadPicture } from "@icon-park/react";
import { useInfiniteScroll, useRequest } from "ahooks";
import {
  Avatar,
  Button,
  Layout,
  Spin,
  Typography,
  Image,
  Space,
  FloatButton,
  Dropdown,
  Upload,
  Flex,
  Popover,
} from "antd";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { nanoid } from "nanoid";
import { useCozeChat } from "@/utils/hooks/useCozeChat";
import Markdown from "react-markdown";

import hkxLogo from "@/assets/logohkx.png";
import "./index.scss";
import useApp from "antd/es/app/useApp";
import rehypeRaw from "rehype-raw";
import useUrlState from "@ahooksjs/use-url-state";
import { urlTransform, imageToMd, isImageUrl } from "@/utils/md";
import UserAvatar from "@/components/avatar";
import useLogin from "@/utils/hooks/useLogin";
import { getStyleFromPrompt } from "@/utils";
import useUploadImage from "@/utils/hooks/useUploadImage";
const helpTips = [
  "帮我设计一款铁观音泡袋包装",
  "给我一些设计建议",
  "我要一款茶叶礼盒包装",
];

const imageBoxTools: Record<
  toolIdEnum,
  {
    label: string;
  }
> = {
  "1": { label: "提取主平图" },
  "2": { label: "描述图片" },
  "3": { label: "生成相似图" },
  "4": { label: "叠加内容" },
  "5": { label: "更换包装配色" },
  "6": { label: "图片质感增强" },
  "7": { label: "局部修改" },
  "8": { label: "提取包装元素" },
};

const renderMarkdown = (content: string) => {
  return (
    <Typography>
      <div className="chat-content">
        <Markdown
          urlTransform={urlTransform}
          rehypePlugins={[rehypeRaw]}
          // skipHtml={true}
          components={{
            p: ({ node, ...props }) => {
              return <div {...props} />;
            },
            br: ({ node, ...props }) => {
              return <br {...props} />;
            },
            h1: ({ node, ...props }) => {
              return <strong {...props} />;
            },
            h2: ({ node, ...props }) => {
              return <strong {...props} />;
            },
            a: ({ node, ...props }) => {
              return <a {...props} target="_blank" />;
            },
            img: ({ node, ...props }) => {
              const isUrl = isImageUrl(props.src || "");
              if (!isUrl) {
                return null;
              }
              return (
                <div className="py-2">
                  <div className="rounded-lg overflow-hidden line-height-0 max-h-200px max-w-200px">
                    <Image
                      src={props.src}
                      className="max-w-200px max-h-200px  "
                    />
                  </div>
                </div>
              );
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    </Typography>
  );
};

const renderMarkdownTyping = (content: string) => {
  return (
    <Typography>
      <div className="chat-content">
        <Markdown
          urlTransform={urlTransform}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => {
              return <div {...props} />;
            },
            a: ({ node, ...props }) => {
              return <a {...props} target="_blank" />;
            },
            h1: ({ node, ...props }) => {
              return <strong {...props} />;
            },
            h2: ({ node, ...props }) => {
              return <strong {...props} />;
            },
            img: () => {
              return (
                <div className="py-2">
                  <div className="rounded-lg bg-gray-200 overflow-hidden h-200px w-200px flex items-center justify-center">
                    <span>加载中</span>
                  </div>
                </div>
              );
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    </Typography>
  );
};

function parserContent(data: chatItem) {
  if (data.content_type === "object_string") {
    try {
      const obj = JSON.parse(data.content) as content_object[];
      const text = obj.find((e) => e.type === "text")?.text || "";
      const image = obj.find((e) => e.type === "image");
      if (image) {
        return imageToMd(image.file_url, image.name) + text;
      }
      return text;
    } catch (e) {
      return data.content;
    }
  }
  return data.content;
}

function chatItemToMD(data: chatItem): {
  id: string;
  role: "user" | "assistant";
  content: string;
  chatid?: string;
} {
  return {
    id: data.id,
    role: data.role,
    content: parserContent(data),
  };
}

function Chat(props: {
  defaultItems?: chatItem[];
  conversationId?: string;
  setCurrentConversationId: (id: string) => void;
}) {
  const styles = useRequest(designStyleList);

  const { ready: login, reset: openModal } = useLogin();
  const { defaultItems, conversationId, setCurrentConversationId } = props;

  const {
    file,
    node: uploadNode,
    clear: clearUploadFile,
    setFile: setUploadFile,
  } = useUploadImage({
    width: 64,
    height: 64,
  });

  const [imageBox, setImageBox] = useState<{
    key: toolIdEnum;
    value: string;
  }>();

  const [state, setState] = useUrlState({ q: "" });
  const { q } = state;
  const [showBottom, setShowBottom] = useState(false);
  const [value, setValue] = useState("");
  const [currentAnswerId, setCurrentAnswerId] = useState("");
  const [typing, setTyping] = useState(false);

  const [openHeader, setOpenHeader] = useState(false);

  // const pageSize = 10;
  // const [pageNo, setPageNo] = useState(1);
  const [items, setItems] = useState<
    {
      id: string;
      role: "user" | "assistant";
      content: string;
      chatid?: string;
    }[]
  >(defaultItems?.map(chatItemToMD) ?? []);

  const cozeChat = useCozeChat();

  const scrollToBottom = () => {
    document.getElementById("chat-content-bottom")?.scrollIntoView({
      behavior: "smooth",
    });
    setShowBottom(false);
  };

  const imageBoxRequest = useRequest(imageTool, {
    manual: true,
    onSuccess(data) {
      setItems((prev) => {
        const item = prev.find((item) => item.id === currentAnswerId);
        if (item) {
          let d = data || "解析失败";
          if (isImageUrl(d)) {
            item.content = imageToMd(d);
          } else {
            item.content = d;
          }
        }
        return prev;
      });
    },
    onError() {
      setItems((prev) => {
        const item = prev.find((item) => item.id === currentAnswerId);
        if (item) {
          item.content = "解析失败";
        }
        return prev;
      });
    },
  });

  // 切换对话
  useEffect(() => {
    if (defaultItems) {
      setItems(defaultItems.map(chatItemToMD));
      cozeChat.cancel();
      cozeChat.reset();

      setTyping(false);
    }
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [defaultItems]);

  // 新建对话
  useEffect(() => {
    if (!conversationId) {
      setItems([]);
      cozeChat.reset();
      cozeChat.cancel();
      setTyping(false);
    }
  }, [conversationId]);

  // 收到回答后，更新items
  useEffect(() => {
    if (cozeChat.data.answer && currentAnswerId) {
      const { answer, chatid } = cozeChat.data;
      setItems((prev) => {
        const item = prev.find((item) => item.id === currentAnswerId);
        if (item) {
          item.content = answer;
          item.chatid = chatid;
        }
        return prev;
      });
    }
  }, [cozeChat.data, currentAnswerId]);

  // 新建对话完成后，设置当前对话id
  useEffect(() => {
    if (cozeChat.data.chatInfo && !conversationId) {
      setCurrentConversationId(cozeChat.data.chatInfo.conversation_id);
    }
  }, [cozeChat.data, conversationId]);

  const submitQuestion = async (q: string, chat_id?: string) => {
    const question = q.trim();
    if (!question) {
      return;
    }
    if (imageBox && !file) {
      message.error("请上传图片");
      return;
    }
    setTyping(true);

    let fileIdOrUrl: string | undefined;
    try {
      if (file) {
        const res = await chatFileUpload({
          file: file.file,
        });
        if (res) {
          fileIdOrUrl = res.url;
        }
      }
      const id = nanoid();
      setCurrentAnswerId(id);
      let content = file?.url
        ? imageToMd(file.url, file.file.name) + question
        : question;
      setItems((prev) => [
        { id: id, role: "assistant", content: "" },
        { id: nanoid(), role: "user", content },
        ...prev,
      ]);
      setTimeout(() => {
        scrollToBottom();
      }, 500);

      if (imageBox) {
        imageBoxRequest.run({
          imgUrlOrIdOrMd5: fileIdOrUrl ?? "",
          prompt: question,
          sessionId: chat_id ?? conversationId ?? "",
          toolId: imageBox.key,
        });
        setImageBox(undefined);
      } else {
        cozeChat.run({
          conversationId: chat_id ?? conversationId ?? "",
          question,
          fileIdOrUrl,
        });
      }
      setValue("");
      setOpenHeader(false);
      setTimeout(() => {
        clearUploadFile();
      }, 500);
    } catch (error) {
      console.error(error);
      setTyping(false);
    }
  };
  const submit = useRequest(submitQuestion, {
    manual: true,
    throttleWait: 500,
    onBefore() {
      if (!login) {
        message.error("请先登录");
        openModal();
        throw new Error("请先登录");
      }
    },
  });

  // 搜索框内容变化时，提交问题
  useEffect(() => {
    if (q) {
      setCurrentConversationId("");
      submit.run(q, "");
      setState({ q: undefined });
    }
  }, [q]);
  const { message } = useApp();

  useEffect(() => {
    if (imageBox) {
      setOpenHeader(true);
    }
  }, [imageBox]);

  const isInAnswerProgress = cozeChat.loading || typing;

  const cancelChat = async () => {
    submit.cancel();
    if (cozeChat.loading) {
      await cozeChat.cancel();
      setTimeout(() => {
        setTyping(false);
        scrollToBottom();
      }, 100);
    }
  };

  useEffect(() => {
    if (!imageBox && !file && openHeader) {
      setTimeout(() => {
        setOpenHeader(false);
      }, 500);
    }
  }, [imageBox, file]);

  return (
    <div className="w-full h-full relative bg-[#fff] chat-container">
      {import.meta.env.MODE === "dev" && (
        <FloatButton
          tooltip="打印数据"
          onClick={() => {
            console.log("items-->", items);
            console.log("cozeChat-->", cozeChat);
            console.log("typing-->", typing);
          }}
        ></FloatButton>
      )}
      <div className="flex flex-col h-full relative">
        <InfiniteScroll
          // ref={infScrollRef}
          onScroll={(e) => {
            const ele = e.target as HTMLElement;
            setShowBottom(Math.abs(ele.scrollTop) > 10);
          }}
          className="overflow-y-scroll w-full py-2 flex flex-col-reverse"
          height={"calc(100% - 0px)"}
          next={() => {
            console.log("next");
            return items;
          }}
          endMessage="没有更多了"
          hasMore={true}
          loader={<div>加载中...</div>}
          dataLength={items.length}
        >
          <FloatButton
            icon={<VerticalAlignBottomOutlined />}
            onClick={scrollToBottom}
            tooltip="滚动到底部"
            className={`absolute transition-all duration-300 top-2 left-50% ease-in-out ${
              showBottom
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 pointer-events-none"
            } transform translate-x-[-50%]`}
          >
            底部
          </FloatButton>
          <div className="h-full" id="chat-content-bottom"></div>
          <div className="w-960px mx-auto py-2">
            {items.length ? (
              <div className="flex flex-col-reverse gap-1rem px-2 pb-1rem ">
                {!isInAnswerProgress && (
                  <Prompts
                    className="m-l-44px"
                    onItemClick={(item) => {
                      submit.run(item.data.key);
                    }}
                    vertical
                    items={cozeChat.data.suggestion.map((e) => ({
                      key: e,
                      icon: (
                        <EnterOutlined className="transform scale-x-[-1]" />
                      ),
                      label: e,
                    }))}
                  />
                )}
                {items.map((item) => {
                  const isInProgress = item.id === currentAnswerId;
                  if (!isInAnswerProgress || !isInProgress) {
                    return (
                      <Bubble
                        key={item.id}
                        role={item.role}
                        onTypingComplete={() => {
                          if (isInProgress) {
                            setTyping(false);
                          }
                        }}
                        className={`chat-bubble ${
                          item.role === "user"
                            ? "slide-in-right"
                            : "slide-in-left"
                        }`}
                        content={item.content}
                        messageRender={renderMarkdown}
                        placement={item.role === "user" ? "end" : "start"}
                        avatar={{
                          size: 46,
                          icon:
                            item.role === "user" ? (
                              <UserAvatar size={46} />
                            ) : (
                              <img
                                src={hkxLogo}
                                className="w-48px! h-48px! object-cover"
                              />
                            ),
                        }}
                      />
                    );
                  }

                  return (
                    <Bubble
                      key={item.id}
                      typing={typing}
                      role={item.role}
                      loading={
                        !Boolean(cozeChat.data.think) && !Boolean(item.content)
                      }
                      onTypingComplete={() => {
                        setTyping(false);
                      }}
                      className={`chat-bubble chat-typing ${
                        item.role === "user"
                          ? "slide-in-right"
                          : "slide-in-left"
                      }`}
                      content={cozeChat.data.think}
                      messageRender={renderMarkdownTyping}
                      placement={item.role === "user" ? "end" : "start"}
                      avatar={{
                        size: 46,
                        icon:
                          item.role === "user" ? (
                            <UserOutlined size={46} />
                          ) : (
                            <img
                              src={hkxLogo}
                              className="w-48px! h-48px! object-cover"
                            />
                          ),
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <Space direction="vertical">
                <Welcome
                  icon={<img src={hkxLogo} alt="HKX" className="w-14! h-14!" />}
                  title="欢迎来到HKX"
                  description="嗨，你好！我是HKX，你的智能助手。我专注于打造独特设计，对创意有着无限追求。请问有什么可以帮助您的呢？"
                />
                <Prompts
                  title="你或许想问"
                  onItemClick={(item) => {
                    submit.run(item.data.key);
                  }}
                  vertical
                  items={helpTips.map((e) => {
                    return {
                      key: e,
                      label: e,
                    };
                  })}
                />
              </Space>
            )}
          </div>
        </InfiniteScroll>
        <div className="w-960px mx-auto m-b-2 absolute p-r-6px bottom-0 left-50% translate-x--50%">
          <div className="absolute w-full h-2rem bg-gradient-to-t from-white to-transparent top--2rem"></div>
          <Suggestion
            items={Object.entries(imageBoxTools).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
            onSelect={(key) => {
              const k = key as keyof typeof imageBoxTools;
              const v = imageBoxTools[k].label;
              setImageBox({
                key: k,
                value: v,
              });
            }}
          >
            {({ onTrigger }) => {
              return (
                <Sender
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  value={value}
                  loading={isInAnswerProgress}
                  onChange={setValue}
                  placeholder="请输入问题"
                  onSubmit={submit.run}
                  onCancel={cancelChat}
                  prefix={
                    <div className="flex items-center">
                      {imageBox && (
                        <Button
                          variant="filled"
                          type="primary"
                          onClick={onTrigger}
                          icon={
                            <Close
                              onClick={() => {
                                setImageBox(undefined);
                              }}
                            />
                          }
                          iconPosition="end"
                        >
                          {imageBox?.value}
                        </Button>
                      )}
                    </div>
                  }
                  actions={false}
                  footer={({ components }) => {
                    const { SendButton, LoadingButton, ClearButton } =
                      components;
                    return (
                      <Flex justify="space-between" align="center">
                        <Flex gap="small" align="center">
                          <Popover
                            content={
                              <div className="flex flex-col gap-2">
                                {styles.data?.map((e, _, arr) => {
                                  const active = value.includes(e.name);
                                  return (
                                    <div
                                      key={e.id}
                                      className="flex flex-row items-center gap-2 cursor-pointer"
                                      onClick={() => {
                                        if (active) {
                                          return;
                                        }
                                        const s = arr.find((e) =>
                                          value.includes(e.name)
                                        );
                                        if (s) {
                                          setValue(
                                            value.replace(s.name, e.name)
                                          );
                                        } else {
                                          const style =
                                            getStyleFromPrompt(value);
                                          if (style) {
                                            setValue(
                                              value.replace(style, e.name)
                                            );
                                          } else {
                                            setValue(
                                              (pre) => pre + `风格为${e.name}.`
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      <img
                                        src={e.image}
                                        alt={e.name}
                                        className="max-w-50px max-h-50px rounded-md"
                                      />
                                      <div>{e.name}</div>
                                      <div>
                                        <Check
                                          className={active ? "" : "op-0"}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            }
                          >
                            <Button>风格</Button>
                          </Popover>
                          <Button onClick={onTrigger}>智能编辑</Button>
                        </Flex>
                        <Flex align="center">
                          <Space>
                            <ClearButton type="text" variant="text" />
                            <Upload
                              accept=".jpg,.jpeg,.png"
                              maxCount={1}
                              showUploadList={false}
                              beforeUpload={(f) => {
                                const isJpgOrPng =
                                  f.type === "image/jpeg" ||
                                  f.type === "image/png";
                                if (!isJpgOrPng) {
                                  message.error("上传图片仅支持 JPG/PNG 格式");
                                }
                                const isLt2M = f.size / 1024 / 1024 < 2;
                                if (!isLt2M) {
                                  message.error("上传图片大小不能超过 2MB");
                                }
                                if (file) {
                                  URL.revokeObjectURL(file.url);
                                }
                                setUploadFile({
                                  url: URL.createObjectURL(f),
                                  file: f,
                                });
                                setOpenHeader(true);
                                return false;
                              }}
                            >
                              <Button
                                icon={<UploadPicture />}
                                type="link"
                                variant="text"
                              />
                            </Upload>
                            {isInAnswerProgress ? (
                              <LoadingButton type="primary" />
                            ) : (
                              <SendButton />
                            )}
                          </Space>
                        </Flex>
                      </Flex>
                    );
                  }}
                  header={
                    <>
                      <div
                        className={`transition-all bg-[#fff] duration-300 ease-in-out transform origin-top overflow-hidden ${
                          openHeader
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4">{uploadNode}</div>
                      </div>
                    </>
                  }
                />
              );
            }}
          </Suggestion>
        </div>
      </div>
    </div>
  );
}

export default function index() {
  const currentConversationData = useRequest(conversationMessageList, {
    manual: true,
    throttleWait: 1500,
  });
  const { ready: login, reset: openModal } = useLogin();

  const data = useInfiniteScroll<{
    list: ConversationItem[];
    pageSize: number;
    pageNumber: number;
    total: number;
  }>(
    async (params) => {
      const { pageSize, pageNumber } = params ?? {
        pageSize: 15,
        pageNumber: 0,
      };
      const { records: result, total } = await conversationList({
        pageSize,
        pageNumber: pageNumber + 1,
        imageType: 1,
      });
      return {
        list: result,
        pageSize,
        pageNumber: pageNumber + 1,
        total,
      };
    },
    {
      manual: true,
      isNoMore: (payload) => {
        if (!payload) {
          return true;
        }
        return payload.list.length >= payload.total;
      },
      onBefore: () => {
        if (!login) {
          openModal();
          throw new Error("请先登录");
        }
      },
    }
  );

  const [conversationId, setCurrentConversationId] = useState("");
  const { message, modal } = useApp();

  const deleteConversation = async (d: ConversationItem) => {
    const { showName } = d;
    modal.confirm({
      title: `确认删除对话${showName}吗？`,
      okText: "确认",
      okType: "danger",
      onOk: async () => {
        const res = await conversationRemove({
          sessionId: d.sessionId,
        });
        if (res) {
          message.open({
            type: "success",
            content: "删除成功",
            key: "deleteConversation",
            duration: 3,
          });
          data.reload();
        } else {
          message.open({
            type: "error",
            content: "删除失败",
            key: "deleteConversation",
            duration: 3,
          });
        }
      },
    });
  };

  useEffect(() => {
    if (login) {
      data.reload();
    } else {
      openModal();
    }
  }, [login]);

  return (
    <Layout className="w-full h-full inspiration-page">
      <Layout.Sider width={250}>
        <InfiniteScroll
          dataLength={data.data?.list?.length ?? 0}
          next={data.loadMore}
          height={"calc(100vh - 64px)"}
          hasMore={!data.noMore}
          loader={
            <div className="text-center p-b-4">
              <Spin indicator={<RedoOutlined spin />} size="small" />
            </div>
          }
          scrollableTarget="scrollableDiv"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="px-2 py-2 flex flex-col gap-2">
            <Button
              type="primary"
              block
              onClick={() => {
                if (conversationId) {
                  setCurrentConversationId("");
                } else {
                  message.open({
                    type: "success",
                    content: "已是最新对话",
                    key: "newConversation",
                    duration: 3,
                  });
                }
              }}
            >
              新建对话
            </Button>
            {data.data?.list.map((e) => {
              const selected = e.sessionId === conversationId;
              return (
                <div
                  className={`flex flex-row items-center justify-between  cursor-pointer p-2 group rounded-md hover:bg-gray-200 ${
                    selected ? "bg-gray-200" : ""
                  }`}
                  key={e.id}
                >
                  <div
                    className="flex flex-row items-center gap-2"
                    onClick={() => {
                      if (conversationId !== e.sessionId) {
                        setCurrentConversationId(e.sessionId);
                        currentConversationData.run({
                          conversationId: e.sessionId,
                        });
                      }
                    }}
                  >
                    <div>
                      <Avatar size={36} src={e.imgUrl} shape="square">
                        {e.showName.slice(0, 1)}
                      </Avatar>
                    </div>
                    <div>
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-100px">
                        {e.showName}
                      </div>
                      <div>{e.createTime}</div>
                    </div>
                  </div>

                  <div className="group-hover:visible invisible">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "delete",
                            label: "删除",
                            onClick: () => {
                              deleteConversation(e);
                            },
                          },
                        ],
                      }}
                      placement="bottom"
                    >
                      <MoreOutlined />
                    </Dropdown>
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      </Layout.Sider>
      <Layout.Content>
        <Chat
          defaultItems={currentConversationData.data?.iterator}
          conversationId={conversationId}
          setCurrentConversationId={(id) => {
            setCurrentConversationId(id);
            data.reload();
          }}
        />
      </Layout.Content>
    </Layout>
  );
}
