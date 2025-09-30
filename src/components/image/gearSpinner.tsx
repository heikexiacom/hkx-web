export default function GearSpinnerImg(props: {
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  color?: string;
  text?: string;
}) {
  const { width, height, className, onClick, color, text } = props;
  const strokeColor = color || "#1677FF";

  return (
    <svg
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
    >
      <path
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth="15"
        transform-origin="center"
        d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"
      >
        <animateTransform
          type="rotate"
          attributeName="transform"
          dur="5"
          attributeType="XML"
          from="0"
          to="360"
          repeatCount="indefinite"
        ></animateTransform>
      </path>
      {text && (
        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="middle"
          fill={strokeColor}
          fontSize="18"
        >
          {text}
        </text>
      )}
    </svg>
  );
}
