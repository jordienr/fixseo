type IconProps = {
  name: "clipboard" | "check";
  size?: number;
  color?: string;
};
export function Icon({ name, size = 21, color = "currentColor" }: IconProps) {
  const icons = {
    clipboard: (
      <g fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10 2H14H16V4H18H20V20V22H18H6H4V20V4H6H8V2H10ZM16 6V8H14H10H8V6H6V20H18V6H16ZM14 6V4H10V6H14Z"
          fill={color}
        ></path>
      </g>
    ),
    check: (
      <g fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18 6H20V8H18V6ZM16 10V8H18V10H16ZM14 12V10H16V12H14ZM12 14H14V12H12V14ZM10 16H12V14H10V16ZM8 16V18H10V16H8ZM6 14H8V16H6V14ZM6 14H4V12H6V14Z"
          fill={color}
        ></path>
      </g>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <title>{name} icon</title>
      {icons[name]}
    </svg>
  );
}
