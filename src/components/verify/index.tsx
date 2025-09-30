import { message, Popover } from "antd";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import type { verificationData, verificationEnums } from "@/api/login";
import { getVerifyImg, postVerifyImg } from "@/api/login";
import { useControllableValue, useRequest } from "ahooks";
import { ArrowRight } from "@icon-park/react";
import "./index.scss";
import Loading from "../loading/loading";

function Verify(props: {
  data?: verificationData;
  loading: boolean;
  onEnd: (pos: number) => void;
}) {
  const [pos, setPos] = React.useState(0);
  const [submit, setSubmit] = React.useState(false);
  const data = {
    originalHeight: 150,
    originalWidth: 300,
    randomY: 60,
    sliderHeight: 60,
    sliderWidth: 60,
    ...props.data,
  };

  useEffect(() => {
    setPos(0);
    setSubmit(false);
  }, [props.data]);

  const maxPos = data.originalWidth - data.sliderWidth;

  return (
    <div>
      <div
        className="relative m-b-4px"
        style={{
          width: data.originalWidth,
          height: data.originalHeight,
        }}
      >
        {data?.backImage ? (
          <img
            src={data.backImage}
            className="user-select-none"
            style={{
              width: data.originalWidth,
              height: data.originalHeight,
            }}
            draggable="false"
          />
        ) : (
          <div
            style={{
              width: data.originalWidth,
              height: data.originalHeight,
            }}
          >
            <Loading />
          </div>
        )}
        {data.slidingImage ? (
          <img
            src={data.slidingImage}
            className="absolute "
            style={{
              left: pos,
              top: data.randomY,
              width: data.sliderWidth,
              height: data.sliderHeight,
            }}
          />
        ) : null}
      </div>
      <div className="flex flex-row ">
        <div className="flex-0 bg-#7EE18B">
          <div
            style={{
              width: pos,
            }}
          />
        </div>
        <div
          draggable="false"
          onMouseMove={(e) => {
            if (e.buttons === 1) {
              setPos((v) => Math.min(Math.max(v + e.movementX, 0), maxPos));
            }
          }}
          onMouseUp={() => {
            if (!submit && pos) {
              setSubmit(true);
              props.onEnd(pos);
            }
          }}
          onMouseLeave={() => {
            if (!submit && pos) {
              setSubmit(true);
              props.onEnd(pos);
            }
          }}
          className="cursor-pointer bg-gray-200 flex-0"
        >
          <div className="w-40px h-40px flex justify-center items-center ">
            <ArrowRight theme="outline" size="24" fill="#333" />
          </div>
        </div>
        <div className="flex-2" />
      </div>
    </div>
  );
}

export type VerifyRef = {
  open: () => void;
  close: () => void;
};

type VerifyProps = {
  children?: React.ReactNode;
  verification: verificationEnums;
  value?: boolean;
  id?: string;
  onChange?: (v: boolean) => void;
  onOpen?: () => void;
};
const Index = React.forwardRef<VerifyRef, VerifyProps>(
  (props: VerifyProps, ref) => {
    const { verification } = props;
    const [open, setOpen] = useState(false);
    const verifyData = useRequest(getVerifyImg, {
      manual: true,
      debounceWait: 500,
    });
    const [success, setSuccess] = useControllableValue<boolean>(props);

    const submitData = useCallback(
      async (pos: number) => {
        try {
          await postVerifyImg(verification, pos);
          props.onChange?.(true);
          message.success("验证成功");
          setOpen(false);
          setSuccess(true);
        } catch (error) {
          verifyData.run(verification);
        }
      },
      [verification, verifyData]
    );
    useEffect(() => {
      if (open) {
        verifyData.run(verification);
      }
    }, [open]);

    useImperativeHandle(ref, () => {
      // 需要将暴露的接口返回出去
      return {
        open: () => {
          setOpen(true);
        },
        close: () => {
          setOpen(false);
        },
      };
    });

    return (
      <div id={props.id}>
        <Popover
          open={open}
          trigger={"click"}
          onOpenChange={(e) => {
            if (!e) {
              props.onOpen?.();
              setOpen(false);
            }
          }}
          arrow={false}
          title="请拖动滑块完成拼图"
          content={
            <Verify
              data={verifyData.data}
              loading={verifyData.loading}
              onEnd={submitData}
            />
          }
        >
          <div
            onClick={() => {
              if (!success) setOpen(true);
            }}
            className="w-min cursor-pointer"
          >
            {props.children || (
              <div>
                <div className="checkbox-wrapper-4">
                  <input
                    className="inp-cbx"
                    id="morning"
                    type="checkbox"
                    checked={Boolean(success)}
                    onChange={() => {}}
                  />
                  <label className="cbx" htmlFor="morning">
                    <span>
                      <svg width="12px" height="10px">
                        <use xlinkHref="#check-4" />
                      </svg>
                    </span>
                    <span className={success ? "" : "c-#929293"}>验证</span>
                  </label>
                  <svg className="inline-svg">
                    <symbol id="check-4" viewBox="0 0 12 10">
                      <polyline points="1.5 6 4.5 9 10.5 1" />
                    </symbol>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </Popover>
      </div>
    );
  }
);

Index.displayName = "Verify";

export default Index;
