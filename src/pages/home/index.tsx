import router from "@/router";
import useLogin from "@/utils/hooks/useLogin";
import { Sender } from "@ant-design/x";

export default function index() {
  const { ready: login, reset: openLogin } = useLogin();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex flex-col gap-1 m-b-2">
        <div>
          <div className="text-3xl font-bold text-align-center">
            欢迎来到HKX
          </div>
        </div>
        <div>
          <div className="text-lg font-bold">一个基于AI的图片生成平台</div>
        </div>
      </div>
      <div>
        <Sender
          className="min-w-600px bg-[#fff]"
          autoSize={{ minRows: 4, maxRows: 4 }}
          placeholder="请输入画面描述"
          onSubmit={(m) => {
            if (!login) {
              openLogin();
              return;
            }
            router.navigate(`/inspiration?q=${m}`);
          }}
        />
      </div>
    </div>
  );
}
