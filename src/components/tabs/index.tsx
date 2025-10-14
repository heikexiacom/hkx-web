import { useState, useRef, useEffect, type ReactNode } from "react";

export interface TabOption {
  title: string | ReactNode;
  key: string;
  onClick?: (key: string) => void;
}

export interface TabsProps {
  options: TabOption[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  activeBgColor?: string;
  activeTextColor?: string;
  className?: string;
}

export default function Tabs(props: TabsProps) {
  const {
    options,
    defaultActiveKey = options[0]?.key,
    onChange,
    activeBgColor = "bg-blue-500/20",
    activeTextColor = "text-blue-600",
    className = "",
  } = props;

  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [activeBgStyle, setActiveBgStyle] = useState({});
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.activeKey) {
      setActiveKey(props.activeKey);
    }
  }, [props.activeKey]);

  // 处理选项卡点击
  const handleTabClick = (key: string) => {
    if (props.activeKey) return;
    if (key !== activeKey) {
      setActiveKey(key);
      if (onChange) {
        onChange(key);
      }
    }
  };

  // 设置活动背景的位置
  const setActiveBgPosition = () => {
    const activeTab = tabRefs.current[activeKey];
    if (activeTab && containerRef.current) {
      const rect = activeTab.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setActiveBgStyle({
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        left: `${rect.left - containerRect.left}px`,
        top: `${rect.top - containerRect.top}px`,
      });
    }
  };

  // 监听活动键变化
  useEffect(() => {
    setActiveBgPosition();
  }, [activeKey]);

  // 确保在DOM加载完成后设置初始位置
  useEffect(() => {
    // 当DOM更新后设置位置
    const timer = setTimeout(() => {
      setActiveBgPosition();
    }, 0);

    // 监听窗口大小变化
    const handleResize = () => {
      setActiveBgPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [options, activeKey]);

  const selected = options.find((item) => item.key === activeKey);

  return (
    <div
      className={`flex flex-wrap justify-between items-center relative ${className}`}
      ref={containerRef}
    >
      <div className="flex flex-wrap items-center gap-20px">
        {options.map((item) => (
          <div
            key={item.key}
            ref={(el) => {
              tabRefs.current[item.key] = el;
            }}
            onClick={() => handleTabClick(item.key)}
            className={`relative flex items-center z-10 cursor-pointer inline-block transition-all duration-300 ${
              activeKey === item.key ? activeTextColor : "text-gray-600"
            } hover:text-gray-800`}
          >
            {item.title}
          </div>
        ))}
      </div>
      {/* 通过 CSS 类控制显示/隐藏和动画效果 */}
      <div
        className={`active-bg absolute ${activeBgColor} transition-all duration-300 ease-out rounded-md transform origin-left ${
          selected ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
        style={activeBgStyle}
      ></div>
    </div>
  );
}
