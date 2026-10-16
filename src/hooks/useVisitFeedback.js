import { useEffect, useRef } from "react";

// Selection feedback only: no idle loop, scroll listener, or forced scrolling.
export default function useVisitFeedback({ pet, repeat, sceneRef, ticketRef }) {
  const previous = useRef(`${pet}:${repeat}`);
  useEffect(() => {
    const key = `${pet}:${repeat}`;
    if (previous.current === key) return;
    previous.current = key;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const print = matchMedia("print");
    if (
      reduced.matches ||
      print.matches ||
      document.hidden ||
      !Element.prototype.animate
    )
      return;
    const scene = sceneRef.current;
    const ticket = ticketRef.current;
    if (!scene || !ticket) return;
    const animations = [];
    const play = (element, frames, options) => {
      if (element && element.getClientRects().length)
        animations.push(
          element.animate(frames, { iterations: 1, fill: "none", ...options }),
        );
    };
    play(
      scene.querySelector("img.is-active"),
      [
        { opacity: 0.58, transform: "translateY(4px) scale(.992)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 440, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    play(
      scene.querySelector(".visit-scene__caption"),
      [{ opacity: 0.55 }, { opacity: 1 }],
      { duration: 280, easing: "ease-out" },
    );
    const track = scene.querySelector(".visit-scene__journey");
    const distance = Math.max(0, (track?.clientWidth || 0) - 6);
    play(
      scene.querySelector(".visit-scene__runner"),
      [
        { transform: "translateX(0px)", opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.12 },
        { opacity: 1, offset: 0.84 },
        { transform: `translateX(${distance}px)`, opacity: 0, offset: 1 },
      ],
      { duration: 620, easing: "cubic-bezier(.35,0,.25,1)" },
    );
    play(
      ticket,
      [
        { boxShadow: "0 0 0 0 rgba(177,119,50,0)" },
        {
          boxShadow: "0 0 0 3px rgba(177,119,50,.10)",
          offset: 0.35,
        },
        { boxShadow: "0 0 0 0 rgba(177,119,50,0)" },
      ],
      { duration: 460, delay: 160, easing: "ease-out" },
    );
    play(
      ticket.querySelector("#visit-ticket-title"),
      [
        { opacity: 0.6, transform: "translateY(2px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 240, delay: 140, easing: "ease-out" },
    );
    const stop = () => animations.forEach((animation) => animation.cancel());
    const preferenceChanged = () => {
      if (reduced.matches || print.matches) stop();
    };
    const visibilityChanged = () => {
      if (document.hidden) stop();
    };
    reduced.addEventListener("change", preferenceChanged);
    print.addEventListener("change", preferenceChanged);
    window.addEventListener("beforeprint", stop);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      stop();
      reduced.removeEventListener("change", preferenceChanged);
      print.removeEventListener("change", preferenceChanged);
      window.removeEventListener("beforeprint", stop);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [pet, repeat, sceneRef, ticketRef]);
}
