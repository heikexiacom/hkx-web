import React from "react";
import ErrorImg from "../../image/error";
import "./index.scss";

export default function ImageCard(props: {
  imageSrc?: string;
  topRightChildren?: React.ReactNode;
  topRightChildrenLock?: boolean;
  bottomChildren?: React.ReactNode;
  className?: string;
  imageOnClick?: () => void;
  imageNode?: React.ReactNode;
  imageErrorNode?: React.ReactNode;
  topLeftChildren?: React.ReactNode;
  topLeftChildrenLock?: boolean;
  noPadding?: boolean;
  backgroundColor?: string;
  style?: React.CSSProperties;
}) {
  const {
    imageSrc,
    topRightChildren,
    topRightChildrenLock,
    bottomChildren,
    className,
    imageOnClick,
    imageNode,
    imageErrorNode,
    topLeftChildren,
    noPadding,
    backgroundColor,
    style,
    topLeftChildrenLock,
  } = props;
  const bgColor = backgroundColor ?? "#ECF0F1";
  return (
    <div className={className ?? "imageCard"} style={style}>
      <div className={"w-full h-full " + (noPadding ? "" : "p-1 ")}>
        <div
          className={
            "flex gap-2 flex-col w-full h-full " + (noPadding ? "" : "p-2")
          }
        >
          <div className="w-full h-full line-height-0 relative group cursor-pointer rounded-lg hover-shadow-lg overflow-hidden">
            {imageSrc
              ? imageNode ?? (
                  <img
                    className={`w-full h-full object-contain  ${
                      noPadding ? "" : "p-2"
                    } rounded-lg border-1 border-[#999] border-solid`}
                    src={imageSrc}
                    onClick={imageOnClick}
                    style={{
                      backgroundColor: bgColor,
                    }}
                  />
                )
              : imageErrorNode ?? (
                  <ErrorImg
                    className={`w-full h-full ${
                      noPadding ? "" : "p-2"
                    } rounded-lg border-1 border-[#999] border-solid`}
                    width={400}
                    height={300}
                    onClick={imageOnClick}
                    style={{
                      backgroundColor: bgColor,
                    }}
                  />
                )}
            <div
              className={
                "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 card-btn " +
                (topRightChildrenLock ? " opacity-100! " : "")
              }
            >
              {topRightChildren}
            </div>
            {topLeftChildren && (
              <div
                className={
                  "absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 card-btn " +
                  (topLeftChildrenLock ? " opacity-100! " : "")
                }
              >
                {topLeftChildren}
              </div>
            )}
          </div>
          <div>{bottomChildren}</div>
        </div>
      </div>
    </div>
  );
}
