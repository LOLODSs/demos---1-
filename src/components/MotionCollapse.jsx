import { useLayoutEffect, useEffect, useRef } from "react";
// Keep the region mounted until its closing animation has finished.
export default function MotionCollapse({ open, children, ...props }) {
  const ref = useRef(null),
    first = useRef(true),
    animation = useRef(null),
    desired = useRef(open);
  const finish = () => {
    if (animation.current) {
      animation.current.onfinish = null;
      animation.current.cancel();
      animation.current = null;
    }
    if (ref.current) {
      ref.current.hidden = !desired.current;
      ref.current.style.removeProperty("overflow");
    }
  };
  useLayoutEffect(() => {
    if (!first.current && desired.current === open) return;
    const el = ref.current,
      start = el.getBoundingClientRect().height;
    desired.current = open;
    finish();
    if (first.current) {
      first.current = false;
      return;
    }
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("print").matches ||
      !el.animate ||
      document.hidden
    )
      return;
    el.hidden = false;
    const end = open ? el.getBoundingClientRect().height : 0;
    el.style.overflow = "hidden";
    animation.current = el.animate(
      [
        { height: `${start}px`, opacity: open ? 0.7 : 1 },
        { height: `${end}px`, opacity: open ? 1 : 0 },
      ],
      { duration: 260, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
    );
    animation.current.onfinish = finish;
  }, [open]);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)"), print = matchMedia("print");
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
    <div {...props} ref={ref} hidden aria-hidden={!open} inert={!open}>
      <div className="motion-collapse__inner">{children}</div>
    </div>
  );
}
