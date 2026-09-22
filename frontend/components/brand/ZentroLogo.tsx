interface ZentroLogoProps {
  className?: string;
}

export default function ZentroLogo({ className = "h-9 w-9" }: ZentroLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 10H56L46 22H30L20 42H48L56 52H8L18 40H34L44 22H18L8 10Z"
        fill="currentColor"
      />
    </svg>
  );
}
