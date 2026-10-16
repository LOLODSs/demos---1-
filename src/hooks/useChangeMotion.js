import { useEffect, useLayoutEffect, useRef } from "react";
export default function useChangeMotion(ref, key, { immediate = false } = {}) {
  const previous = useRef(null),
    running = useRef([]);
  const stop = () => {
    running.current.forEach((a) => a.cancel());
    running.current = [];
    if (ref.current) ref.current.style.removeProperty("overflow");
  };
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = running.current.some((a) => a.playState === "running")
      ? el.getBoundingClientRect().height
      : previous.current;
    stop();
    const end = el.getBoundingClientRect().height;
    previous.current = end;
    if (
      immediate ||
      start === null ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("print").matches ||
      !el.animate ||
      document.hidden
    )
      return;
    if (Math.abs(end - start) > 1) {
      el.style.overflow = "hidden";
      const a = el.animate([{ height: `${start}px` }, { height: `${end}px` }], {
        duration: 260,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "none",
      });
      a.onfinish = () => {
        el.style.removeProperty("overflow");
      };
      running.current.push(a);
    }
    running.current.push(
      el.animate([{ opacity: 0.62 }, { opacity: 1 }], {
        duration: 220,
        easing: "ease-out",
        fill: "none",
      }),
    );
  }, [key, immediate]);
  useEffect(() => {
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            if (
              ref.current &&
              !running.current.some((a) => a.playState === "running")
            )
              previous.current = ref.current.getBoundingClientRect().height;
          })
        : null;
    if (ref.current) observer?.observe(ref.current);
    const m = matchMedia("(prefers-reduced-motion: reduce)"),
      print = matchMedia("print");
    const media = () => {
      if (m.matches || print.matches) stop();
    };
    const resize = () => {
      stop();
      if (ref.current)
        previous.current = ref.current.getBoundingClientRect().height;
    };
    m.addEventListener("change", media);
    print.addEventListener("change", media);
    window.addEventListener("resize", resize);
    window.addEventListener("beforeprint", stop);
    return () => {
      observer?.disconnect();
      m.removeEventListener("change", media);
      print.removeEventListener("change", media);
      window.removeEventListener("resize", resize);
      window.removeEventListener("beforeprint", stop);
      stop();
    };
  }, []);
}
