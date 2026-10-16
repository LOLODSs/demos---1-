import { useEffect, useRef, useImperativeHandle } from "react";
import Icon from "./Icon";
export default function Modal({
  ref: controllerRef,
  children,
  onClose,
  titleId,
  className = "",
  onKeyDown,
}) {
  const ref = useRef(null),
    closing = useRef(false),
    exitAnimation = useRef(null),
    pending = useRef(null);
  const dismiss = (after) => {
    if (closing.current) return;
    const dialog = ref.current;
    if (!dialog) return;
    closing.current = true;
    const finish = () => {
      pending.current = null;
      onClose();
      if (typeof after === "function") after();
    };
    pending.current = finish;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !dialog.animate ||
      matchMedia("print").matches
    ) {
      finish();
      return;
    }
    dialog.classList.add("is-closing");
    const style = getComputedStyle(dialog);
    exitAnimation.current = dialog.animate(
      [
        { opacity: style.opacity, translate: style.translate },
        {
          opacity: 0,
          translate: dialog.classList.contains("dialog--menu")
            ? "12px 0"
            : "0 6px",
        },
      ],
      { duration: 140, easing: "ease-in", fill: "both" },
    );
    exitAnimation.current.onfinish = finish;
  };
  useImperativeHandle(controllerRef, () => ({ dismiss }));
  useEffect(() => {
    const dialog = ref.current;
    closing.current = false;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = () => {
      if (preference.matches && pending.current) pending.current();
    };
    preference.addEventListener("change", reduce);
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const raf = requestAnimationFrame(() =>
      (
        dialog.querySelector("[data-autofocus]") ||
        dialog.querySelector("button")
      )?.focus(),
    );
    return () => {
      preference.removeEventListener("change", reduce);
      pending.current = null;
      if (exitAnimation.current) {
        exitAnimation.current.onfinish = null;
        exitAnimation.current.cancel();
      }
      cancelAnimationFrame(raf);
      dialog.close();
      document.body.style.overflow = oldOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  const handleKeyDown = (event) => {
    if (closing.current) {
      event.preventDefault();
      return;
    }
    if (event.key === "Tab") {
      const items = [
        ...ref.current.querySelectorAll(
          'summary,a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ].filter(
        (el) => el.getClientRects().length && !el.closest("[hidden],[inert]"),
      );
      const first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !ref.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !ref.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    onKeyDown?.(event);
  };
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`dialog ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="dialog__controls">
        <button
          type="button"
          className="icon-button dialog__close"
          aria-label="Закрыть окно"
          onClick={() => dismiss()}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="dialog__box">
        {children}
      </div>
    </dialog>
  );
}
