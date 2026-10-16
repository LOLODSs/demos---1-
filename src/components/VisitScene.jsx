import { img } from "../data";

export default function VisitScene({ pet, repeat, sceneRef }) {
  return (
    <figure
      ref={sceneRef}
      className={`visit-scene ${repeat ? "visit-scene--return" : ""}`}
    >
      <div className="visit-scene__art">
        {["cat", "dog"].map((kind) => (
          <img
            key={kind}
            className={pet === kind ? "is-active" : ""}
            src={img(`visit-${kind}-illustration-cutout.webp`)}
            width="1440"
            height="960"
            loading="lazy"
            decoding="async"
            alt={
              pet === kind
                ? kind === "cat"
                  ? "Рисованная кошка на пледе рядом с переноской; охристая нить связывает композицию."
                  : "Рисованная собака на пледе рядом с поводком; охристая нить связывает композицию."
                : ""
            }
            aria-hidden={pet !== kind}
          />
        ))}
      </div>
      <figcaption className="visit-scene__caption">
        <span className="visit-scene__dot" aria-hidden="true" />
        <span>
          {pet === "cat" ? "Кошка" : "Собака"} ·{" "}
          {repeat ? "продолжаем знакомство" : "знакомимся впервые"}
        </span>
        <span className="visit-scene__edition" aria-hidden="true">
          {pet === "cat" ? "01" : "02"} / 02
        </span>
      </figcaption>
      <ol className="visit-scene__journey" aria-label="Путь вашего визита">
        <li className="visit-scene__runner" aria-hidden="true" />
        <li>
          <span>01</span>
          <strong>{repeat ? "Возвращаемся" : "Знакомимся"}</strong>
        </li>
        <li>
          <span>02</span>
          <strong>Разбираемся</strong>
        </li>
        <li>
          <span>03</span>
          <strong>С планом домой</strong>
        </li>
      </ol>
    </figure>
  );
}
