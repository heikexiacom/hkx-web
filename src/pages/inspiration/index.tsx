import {
  conversationCreate,
  conversationList,
  conversationMessageList,
  type chatItem,
  type ConversationItem,
} from "@/api/ai";
import { RedoOutlined, UserOutlined } from "@ant-design/icons";
import { Bubble, Prompts, Sender, type BubbleProps } from "@ant-design/x";
import { Brain, User } from "@icon-park/react";
import { useInfiniteScroll, useRequest } from "ahooks";
import { Avatar, Button, Divider, Layout, Spin, Typography, Image } from "antd";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { nanoid } from "nanoid";
import { useCozeChat } from "@/utils/hooks/useCozeChat";
import Markdown from "react-markdown";

import "./index.scss";

const renderMarkdown = (content: string) => {
  return (
    <Typography>
      <div className="chat-content">
        <Markdown
          components={{
            p: ({ node, ...props }) => {
              return <div {...props} />;
            },
            img: ({ node, ...props }) => {
              return (
                <div className="py-2">
                  <div className="rounded-lg overflow-hidden line-height-0 h-200px w-200px">
                    <Image
                      src={props.src}
                      className="max-w-200px max-h-200px  "
                      placeholder="图片加载中..."
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

const renderMarkdownRender = (content: string) => {
  return (
    <Typography>
      <div className="chat-content">
        <Markdown
          components={{
            p: ({ node, ...props }) => {
              return <div {...props} />;
            },
            img: ({ node, ...props }) => {
              return (
                <div className="py-2">
                  <div className="rounded-lg overflow-hidden line-height-0 h-200px w-200px">
                    图片加载中
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

function Chat(props: { defaultItems?: chatItem[]; conversationId?: string }) {
  const { defaultItems, conversationId } = props;

  const [value, setValue] = useState("");
  const [currentAnswerId, setCurrentAnswerId] = useState("");
  const [typing, setTyping] = useState(false);
  const [items, setItems] = useState<
    {
      id: string;
      role: "user" | "assistant";
      content: string;
      chatid?: string;
    }[]
  >(defaultItems ?? []);

  const cozeChat = useCozeChat();

  useEffect(() => {
    if (defaultItems) {
      setItems(defaultItems);
      cozeChat.resetValues();
    }
  }, [defaultItems]);

  console.log("cozeChat.Render");
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

  const isInAnswerProgress = cozeChat.loading || typing;

  const submitQuestion = (q: string) => {
    const question = q.trim();
    if (!question) {
      return;
    }
    const id = nanoid();
    setCurrentAnswerId(id);
    setItems((prev) => [
      { id: id, role: "assistant", content: "" },
      { id: nanoid(), role: "user", content: question },
      ...prev,
    ]);
    cozeChat.run({
      conversationId: conversationId ?? "",
      question,
    });
    setValue("");
    setTyping(true);
  };

  return (
    <div className="w-full h-full relative ">
      <div className="h-[calc(100vh-150px)] overflow-auto flex flex-col-reverse  ">
        <div className="flex flex-col-reverse gap-1rem px-2 min-h-[calc(100vh-150px)]">
          {!isInAnswerProgress && (
            <Prompts
              onItemClick={(item) => {
                submitQuestion(item.data.key);
              }}
              items={cozeChat.data.suggestion.map((e) => ({
                key: e,
                label: e,
              }))}
            />
          )}
          <div className=" h-full"></div>

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
                  content={item.content}
                  messageRender={renderMarkdown}
                  placement={item.role === "user" ? "end" : "start"}
                  avatar={{
                    icon:
                      item.role === "user" ? (
                        <UserOutlined size={32} />
                      ) : (
                        <Brain size={32} />
                      ),
                  }}
                />
              );
            }
            const content = isInProgress ? cozeChat.data.think : item.content;
            return (
              <Bubble
                key={item.id}
                typing={isInProgress}
                role={item.role}
                loading={!Boolean(content)}
                onTypingComplete={() => {
                  setTyping(false);
                }}
                content={content}
                messageRender={renderMarkdownRender}
                placement={item.role === "user" ? "end" : "start"}
                avatar={{
                  icon:
                    item.role === "user" ? (
                      <UserOutlined size={32} />
                    ) : (
                      <Brain size={32} />
                    ),
                }}
              />
            );
          })}
        </div>
      </div>
      <Sender
        className=" absolute bottom-0 w-full"
        value={value}
        loading={isInAnswerProgress}
        onChange={setValue}
        onSubmit={submitQuestion}
      />
    </div>
  );
}

export default function index() {
  const data = useInfiniteScroll<{
    list: ConversationItem[];
    pageSize: number;
    pageNumber: number;
    total: number;
  }>(
    async (params) => {
      const { pageSize, pageNumber } = params ?? {
        pageSize: 10,
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
      isNoMore: (payload) => {
        if (!payload) {
          return false;
        }
        return payload.list.length >= payload.total;
      },
    }
  );

  const currentConversation = useRequest(conversationMessageList, {
    manual: true,
  });
  const conversationId = currentConversation.params[0]?.conversationId;

  return (
    <Layout className="w-full h-full">
      <Layout.Sider>
        <InfiniteScroll
          dataLength={data.data?.list?.length ?? 0}
          next={data.loadMore}
          hasMore={!data.noMore}
          loader={
            <div style={{ textAlign: "center" }}>
              <Spin indicator={<RedoOutlined spin />} size="small" />
            </div>
          }
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          scrollableTarget="scrollableDiv"
          style={{ overflow: "hidden", height: "calc(100vh - 64px)" }}
        >
          <div className="px-2 py-2 flex flex-col gap-2">
            <Button
              type="primary"
              block
              onClick={() => {
                conversationCreate().then(() => {
                  data.reload();
                });
              }}
            >
              新建对话
            </Button>
            {data.data?.list.map((e) => {
              return (
                <div
                  className="flex flex-row items-center gap-2 cursor-pointer"
                  key={e.id}
                  onClick={() => {
                    currentConversation.run({
                      conversationId: e.sessionId,
                    });
                  }}
                >
                  <div>
                    <Avatar size={36} src={e.imgUrl} shape="square">
                      {e.showName.slice(0, 1)}
                    </Avatar>
                  </div>
                  <div>
                    <div>{e.prompt.slice(0, 6)}</div>
                    <div>{e.createTime}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      </Layout.Sider>
      <Layout.Content>
        <Chat
          defaultItems={currentConversation.data?.iterator}
          conversationId={conversationId}
        />
      </Layout.Content>
    </Layout>
  );
}
