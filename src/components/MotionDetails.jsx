import { useLayoutEffect, useEffect, useRef } from "react";
export default function MotionDetails({
  open,
  onToggleOpen,
  summary,
  children,
  className,
  immediate = false,
}) {
  const ref = useRef(null),
    first = useRef(true),
    desired = useRef(open),
    animation = useRef(null);
  const finish = () => {
    if (animation.current) {
      animation.current.onfinish = null;
      animation.current.cancel();
      animation.current = null;
    }
    if (ref.current) {
      ref.current.open = desired.current;
      ref.current.style.removeProperty("overflow");
    }
  };
  useLayoutEffect(() => {
    if (!first.current && desired.current === open && !immediate) return;
    const el = ref.current,
      start = el.getBoundingClientRect().height;
    desired.current = open;
    finish();
    if (first.current) {
      first.current = false;
      return;
    }
    if (
      immediate ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("print").matches ||
      !el.animate
    )
      return;
    const end = el.getBoundingClientRect().height;
    el.open = true;
    el.style.overflow = "hidden";
    animation.current = el.animate(
      [{ height: `${start}px` }, { height: `${end}px` }],
      { duration: 260, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
    );
    animation.current.onfinish = finish;
  }, [open, immediate]);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)"),
      print = matchMedia("print");
    const media = () => {
      if (m.matches || print.matches) finish();
    };
    m.addEventListener("change", media);
    print.addEventListener("change", media);
    window.addEventListener("resize", finish);
    window.addEventListener("beforeprint", finish);
    return () => {
      m.removeEventListener("change", media);
      print.removeEventListener("change", media);
      window.removeEventListener("resize", finish);
      window.removeEventListener("beforeprint", finish);
      finish();
    };
  }, []);
  return (
    <details ref={ref} className={className}>
      <summary
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          onToggleOpen(!open);
        }}
      >
        {summary}
      </summary>
      <div inert={!open}>{children}</div>
    </details>
  );
}
