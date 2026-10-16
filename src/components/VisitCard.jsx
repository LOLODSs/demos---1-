import { useRef, useState } from "react";
import Icon from "./Icon";
import VisitScene from "./VisitScene";
import MobileDisclosure from "./MobileDisclosure";
import { img } from "../data";
import { saveVisitCard } from "./saveVisitCard";
import useVisitFeedback from "../hooks/useVisitFeedback";
import useChangeMotion from "../hooks/useChangeMotion";

export default function VisitCard({ onBook }) {
  const [pet, setPet] = useState("cat");
  const [saveStatus, setSaveStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [visit, setVisit] = useState("first");
  const repeat = visit === "repeat";
  const sceneRef = useRef(null);
  const ticketRef = useRef(null),
    bodyRef = useRef(null),
    statusRef = useRef(null);
  useChangeMotion(bodyRef, `${pet}:${visit}`);
  useChangeMotion(statusRef, saveStatus);
  useVisitFeedback({ pet, repeat, sceneRef, ticketRef });
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
          <p className="eyebrow">Знакомство с «Лесной»</p>
          <h2 id="visit-builder-title">
            Кто к нам
            <br /> в гости?
          </h2>
          <p className="visit-builder__lead">
            Выберите питомца — и соберём памятку, которую удобно взять с собой.
          </p>
          <div className="visit-builder__choices">
            <fieldset disabled={saving}>
              <legend>Кто к нам собирается?</legend>
              <div className="visit-choice-group">
                <button
                  type="button"
                  aria-pressed={pet === "cat"}
                  onClick={() => {
                    setPet("cat");
                    setSaveStatus("");
                  }}
                >
                  Кошка
                </button>
                <button
                  type="button"
                  aria-pressed={pet === "dog"}
                  onClick={() => {
                    setPet("dog");
                    setSaveStatus("");
                  }}
                >
                  Собака
                </button>
              </div>
            </fieldset>
            <fieldset disabled={saving}>
              <legend>Какой визит?</legend>
              <div className="visit-choice-group">
                <button
                  type="button"
                  aria-pressed={!repeat}
                  onClick={() => {
                    setVisit("first");
                    setSaveStatus("");
                  }}
                >
                  Первый
                </button>
                <button
                  type="button"
                  aria-pressed={repeat}
                  onClick={() => {
                    setVisit("repeat");
                    setSaveStatus("");
                  }}
                >
                  Повторный
                </button>
              </div>
            </fieldset>
          </div>
          <VisitScene pet={pet} repeat={repeat} sceneRef={sceneRef} />
        </div>
        <article
          ref={ticketRef}
          className="visit-ticket"
          aria-labelledby="visit-ticket-title"
        >
          <div className="visit-ticket__masthead">
            <span>ЛЕСНАЯ</span>
            <Icon name="leaf" size={23} />
          </div>
          <p className="visit-ticket__eyebrow">
            <span className="ticket-dot" /> Ваша памятка к визиту
          </p>
          <h3 id="visit-ticket-title" aria-live="polite" aria-atomic="true">
            {animal} · {repeat ? "повторный приём" : "первый приём"}
          </h3>
          <div className="visit-ticket__body" ref={bodyRef}>
            <section>
              <h4>Возьмите с собой</h4>
              <ul>
                <li>
                  {repeat
                    ? "Предыдущие назначения и новые результаты."
                    : "Ветпаспорт и прошлые обследования, если есть."}
                </li>
                <li>{carry}</li>
              </ul>
            </section>
            <MobileDisclosure label="Что рассказать врачу" className="visit-ticket__more">
            <section>
              <h4>Расскажите врачу</h4>
              <p>
                {repeat
                  ? "Что изменилось после приёма: аппетит, активность, симптомы и реакция на лечение."
                  : "Когда появились симптомы, что изменилось в поведении, чем питается питомец и какие препараты получает."}
              </p>
            </section>
            </MobileDisclosure>
            <section className="visit-ticket__preparation">
              <h4>Перед исследованиями</h4>
              <p>
                Подготовку уточните у врача. Памятка не заменяет консультацию.
              </p>
            </section>
          </div>

          <div className="visit-ticket__actions">
            <button
              className="button button--dark"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setSaveStatus("");
                try {
                  await saveVisitCard({
                    animal,
                    repeat,
                    carry,
                    imageSrc: img(`visit-${pet}-illustration.webp`),
                  });
                  setSaveStatus("Памятка сохранена в PNG.");
                } catch {
                  setSaveStatus(
                    "Не удалось сохранить. Попробуйте печать / PDF.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Icon name="download" size={18} />{" "}
              {saving ? "Сохраняем…" : "Сохранить памятку"}
            </button>
            <button
              className="text-button visit-ticket__print"
              onClick={() => window.print()}
            >
              <Icon name="print" size={17} /> Печать / PDF
            </button>
          </div>
          <p className="visit-ticket__print-help" role="status" ref={statusRef}>
            {saveStatus || "PNG для телефона · без имени и регистрации"}
          </p>
          <button
            className="text-button visit-ticket__book"
            onClick={() => onBook(animal)}
          >
            Перейти к записи <Icon name="arrow" size={17} />
          </button>
        </article>
      </div>
    </section>
  );
}
