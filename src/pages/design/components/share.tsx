import { convertLongToShort } from "@/api/common";
import type { designDetail } from "@/api/design";
import { useRequest } from "ahooks";
import { Button, Input, Modal } from "antd";
import { useRef, useState } from "react";
import logoHKX from "@/assets/logohkx.png";
import QRCode from "react-qrcode-logo";
import { setClipboard } from "@/utils";
import { message } from "antd";
import { Download } from "@icon-park/react";

export default function useShareModal() {
  const [visible, setVisible] = useState(false);
  const [design, setDesign] = useState<designDetail>();

  const shareUrl = useRequest(convertLongToShort, {
    manual: true,
  });
  const share = (d: designDetail) => {
    if (d.id !== design?.id) {
      setDesign(d);
      shareUrl.run({ longUrl: `https://design.heikexia.com/share?id=${d.id}` });
    }
    setVisible(true);
  };
  const longUrl = `https://design.heikexia.com/share?id=${design?.id}`;

  const QrCodeRef = useRef<QRCode>(null);
  const node = (
    <Modal
      onCancel={() => setVisible(false)}
      open={visible}
      title="设计分享"
      footer={false}
      maskClosable
      width={500}
    >
      <div>
        <Input
          value={shareUrl.data || longUrl}
          readOnly
          addonBefore="分享链接"
          addonAfter={
            <div
              className="cursor-pointer"
              onClick={() => {
                setClipboard(shareUrl.data || longUrl);
                if (setClipboard(shareUrl.data || longUrl)) {
                  message.success("复制成功");
                }
              }}
            >
              复制
            </div>
          }
        />
        <div className="flex flex-row justify-center gap-4 pt-4">
          <div>
            <QRCode
              ref={QrCodeRef}
              value={longUrl}
              logoImage={logoHKX}
              logoHeight={50}
              logoWidth={50}
              size={200}
              ecLevel="M"
              qrStyle="squares"
            />
          </div>
          <div className="flex flex-col justify-between py-2">
            <div>
              <div>设计名称: {design?.name}</div>
              <div>更新时间: {design?.updateTime || design?.createTime}</div>
            </div>
            <div>
              <div className="text-sm mb-2">扫码分享或下载二维码转发</div>
              <Button
                onClick={() => {
                  QrCodeRef.current?.download(
                    "webp",
                    `设计${design?.name} 二维码`
                  );
                }}
                icon={<Download />}
                type="primary"
              >
                下载二维码
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
  return {
    share,
    node,
  };
}
