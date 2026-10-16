import { useEffect, useId, useState } from "react";
import Icon from "./Icon";
import MotionCollapse from "./MotionCollapse";

// Compact on phones; full content on larger screens and on paper.
export default function MobileDisclosure({ label, children, className = "" }) {
  const [mobile, setMobile] = useState(() => matchMedia("(max-width: 760px)").matches);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  useEffect(() => {
    const media = matchMedia("(max-width: 760px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const open = !mobile || expanded;
  return (
    <div className={`mobile-disclosure ${className}`}>
      <button className="mobile-disclosure__toggle" type="button"
        aria-expanded={open} aria-controls={id} onClick={() => setExpanded(v => !v)}>
        <span>{label}</span><Icon name="plus" size={18} />
      </button>
      <MotionCollapse className="mobile-disclosure__content" id={id} open={open}>
        {children}
      </MotionCollapse>
    </div>
  );
}
