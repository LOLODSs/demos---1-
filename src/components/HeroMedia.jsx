import { useEffect, useRef, useState } from "react";
import { img } from "../data";
import Icon from "./Icon";

export default function HeroMedia() {
  const frame = useRef(null);
  const video = useRef(null);
  const manualPause = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const media = matchMedia(
      "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () =>
      setEnabled(media.matches && !navigator.connection?.saveData);
    update();
    media.addEventListener("change", update);
    navigator.connection?.addEventListener?.("change", update);
    return () => {
      media.removeEventListener("change", update);
      navigator.connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!enabled || !element || failed) return;
    let inView = true;
    const sync = () => {
      if (document.hidden || !inView || manualPause.current) element.pause();
      else element.play().catch(() => setPlaying(false));
    };
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          sync();
        },
        { threshold: 0.1 },
      );
      observer.observe(frame.current);
    }
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      element.pause();
    };
  }, [enabled, failed]);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      manualPause.current = false;
      element.play().catch(() => setPlaying(false));
    } else {
      manualPause.current = true;
      element.pause();
    }
  };

  return (
    <div ref={frame} className="hero__image hero__film">
      <picture>
        <source
          media="(max-width:760px)"
          srcSet={img("hero-pets-compact.webp")}
          width="674"
          height="588"
        />
        <img
          src={img("hero-film-poster.webp")}
          width="1280"
          height="720"
          alt="Собака и кошка в светлой приёмной"
          fetchPriority="high"
        />
      </picture>
      {enabled && !failed && (
        <>
          <video
            ref={video}
            className={"hero__video " + (ready ? "is-ready" : "")}
            src={globalThis.__LESNAYA_VIDEO__ || "./videos/hero-pets.mp4"}
            poster={img("hero-film-poster.webp")}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            onLoadedData={() => setReady(true)}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => {
              setFailed(true);
              setReady(false);
            }}
          />
          <button
            type="button"
            className="hero__video-toggle"
            onClick={toggle}
            aria-label={playing ? "Приостановить видео" : "Воспроизвести видео"}
          >
            <Icon name={playing ? "pause" : "play"} size={18} />
          </button>
        </>
      )}
    </div>
  );
}
