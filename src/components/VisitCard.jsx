import { useState } from "react";
import Icon from "./Icon";

export function VisitLine({ pet, repeat }) {
  return (
    <div className="visit-line" key={`${pet}-${repeat}`} aria-hidden="true">
      <svg viewBox="0 0 480 132" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          className="visit-line__thread"
          d={
            repeat
              ? "M60 68C120 68 157 55 240 64S350 70 420 64"
              : "M60 68C120 118 161 8 240 64S354 113 420 64"
          }
        />
        {[60, 240, 420].map((x) => (
          <circle key={x} cx={x} cy="64" r="38" fill="var(--paper)" />
        ))}
        <g
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {pet === "cat" ? (
            <g>
              <path d="M39 65 38 40l16 12h13l15-12-1 25c0 15-10 23-21 23S39 80 39 65Z" />
              <path d="m56 72 4 3 4-3M60 75v5M35 73l11 2M34 81l12-2M75 75l11-2M75 79l12 2" />
              <path d="M50 65h1M70 65h1" />
            </g>
          ) : (
            <g>
              <path d="M45 53c9-9 22-9 30 0l4 21c1 11-6 17-19 17S40 85 41 74l4-21Z" />
              <path d="M45 53c-13-5-19 2-16 16l4 10 10-6M75 53c13-5 19 2 16 16l-4 10-10-6M55 76l5 3 5-3M60 79v5M49 66h1M70 66h1" />
            </g>
          )}
          <circle cx="240" cy="52" r="12" />
          <path d="M218 88v-6c0-13 10-18 22-18s22 5 22 18v6M229 48c4-2 8-5 10-9" />
          <rect x="402" y="42" width="36" height="49" rx="5" />
          <path d="M413 42v-5h14v5M412 57h16M412 65h16M412 73h10" />
        </g>
        <circle
          cx={repeat ? "330" : "142"}
          cy={repeat ? "69" : "57"}
          r="4.5"
          fill="var(--amber)"
        />
      </svg>
      <div className="visit-line__labels">
        <span>Питомец</span>
        <span>Вы</span>
        <span>Врач</span>
      </div>
    </div>
  );
}

export default function VisitCard({ onBook }) {
  const [pet, setPet] = useState("cat");
  const [visit, setVisit] = useState("first");
  const repeat = visit === "repeat";
  const animal = pet === "cat" ? "Кошка" : "Собака";
  const carry =
    pet === "cat"
      ? "Закрытую переноску с привычной подстилкой."
      : "Поводок; намордник — если он нужен для безопасного осмотра.";
  return (
    <section
      className="section about visit-builder"
      id="about"
      aria-labelledby="visit-builder-title"
    >
      <div className="container visit-builder__layout">
        <div className="visit-builder__left">
          <p className="eyebrow">Первый шаг — познакомиться</p>
          <h2 id="visit-builder-title">
            В гости
            <br />в «Лесную»
          </h2>
          <p className="visit-builder__lead">
            Два выбора — и памятка к вашему визиту готова. Без имени, телефона и
            регистрации.
          </p>
          <VisitLine pet={pet} repeat={repeat} />
          <div className="visit-builder__choices">
            <fieldset>
              <legend>Кто к нам собирается?</legend>
              <div className="visit-choice-group">
                <button
                  type="button"
                  aria-pressed={pet === "cat"}
                  onClick={() => setPet("cat")}
                >
                  Кошка
                </button>
                <button
                  type="button"
                  aria-pressed={pet === "dog"}
                  onClick={() => setPet("dog")}
                >
                  Собака
                </button>
              </div>
            </fieldset>
            <fieldset>
              <legend>Уже знакомы?</legend>
              <div className="visit-choice-group">
                <button
                  type="button"
                  aria-pressed={!repeat}
                  onClick={() => setVisit("first")}
                >
                  Первый приём
                </button>
                <button
                  type="button"
                  aria-pressed={repeat}
                  onClick={() => setVisit("repeat")}
                >
                  Повторный
                </button>
              </div>
            </fieldset>
          </div>
        </div>
        <article className="visit-ticket" aria-labelledby="visit-ticket-title">
          <div className="visit-ticket__masthead">
            <span>ЛЕСНАЯ</span>
            <Icon name="leaf" size={23} />
          </div>
          <p className="visit-ticket__eyebrow">Памятка к визиту</p>
          <h3 id="visit-ticket-title" aria-live="polite" aria-atomic="true">
            {animal} · {repeat ? "повторный приём" : "первый приём"}
          </h3>
          <div className="visit-ticket__body" key={`${pet}-${visit}`}>
            <section>
              <h4>Возьмите с собой</h4>
              <ul>
                <li>
                  {repeat
                    ? "Предыдущие назначения и новые результаты обследований."
                    : "Ветпаспорт и результаты предыдущих обследований, если они есть."}
                </li>
                <li>{carry}</li>
              </ul>
            </section>
            <section>
              <h4>Расскажите врачу</h4>
              <p>
                {repeat
                  ? "Что изменилось после прошлого приёма: аппетит, активность, симптомы и реакция на назначенное лечение."
                  : "Когда появились симптомы, что изменилось в поведении, чем питается питомец и какие препараты получает."}
              </p>
            </section>
            <section className="visit-ticket__preparation">
              <h4>Перед исследованиями</h4>
              <p>
                Подготовку уточните у врача заранее. Памятка не назначает
                лечение и не заменяет консультацию.
              </p>
            </section>
          </div>

          <div className="visit-ticket__actions">
            <button
              className="button button--dark"
              onClick={() => onBook(animal)}
            >
              К записи <Icon name="arrow" size={17} />
            </button>
            <button
              className="text-button visit-ticket__print"
              onClick={() => window.print()}
            >
              <Icon name="print" size={18} />
              Печать / PDF
            </button>
          </div>
          <p className="visit-ticket__print-help">
            PDF можно сохранить в окне печати браузера.
          </p>
        </article>
      </div>
    </section>
  );
}
