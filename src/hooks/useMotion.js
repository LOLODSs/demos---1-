import { useEffect } from "react";

// One observer, no scroll handlers. Content is visible by default.
export default function useMotion() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const selectors = [
      ".section-heading",
      ".service-card",
      ".visit-builder__left",
      ".visit-ticket",
      ".doctor-card",
      ".reviews__intro",
      ".review-card",
      ".gallery-item",
      ".faq__intro",
      ".faq-list",
      ".contacts__details",
      ".map-card",
    ];
    const elements = [...document.querySelectorAll(selectors.join(","))];
    const show = (element, immediately = false) => {
      if (immediately) element.style.setProperty("--reveal-delay", "0ms");
      element.classList.add("is-revealed");
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
    );
    const showAll = () => elements.forEach((element) => show(element, true));
    const sync = () => {
      if (preference.matches) {
        document.documentElement.classList.remove("has-motion");
        showAll();
        return;
      }
      elements.forEach((element) => {
        element.dataset.reveal = "";
        if (element.matches(".service-card,.doctor-card,.gallery-item")) {
          const index = [...element.parentElement.children].indexOf(element);
          element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
        }
        if (!element.classList.contains("is-revealed"))
          observer.observe(element);
      });
      document.documentElement.classList.add("has-motion");
    };
    const focus = (event) => {
      const element = event.target.closest("[data-reveal]");
      if (element) show(element, true);
    };
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("focusin", focus);
    window.addEventListener("beforeprint", showAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("focusin", focus);
      window.removeEventListener("beforeprint", showAll);
      document.documentElement.classList.remove("has-motion");
      elements.forEach((element) => {
        delete element.dataset.reveal;
        element.classList.remove("is-revealed");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, []);
}
