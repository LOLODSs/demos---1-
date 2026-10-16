import { useEffect } from "react";
// React inserts anchors after the browser's initial fragment-navigation attempt.
export default function useHashNavigation() {
  useEffect(() => {
    let frame;
    const follow = () => {
      cancelAnimationFrame(frame);
      let id;
      try {
        id = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      if (!id) return;
      frame = requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", follow);
    };
  }, []);
}
