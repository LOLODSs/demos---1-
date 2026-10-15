import { useState } from "react";
import {
  clinic,
  navigation,
  services,
  doctors,
  reviews,
  gallery,
  faqs,
  money,
  img,
} from "./data";
import Icon, { Brand } from "./components/Icon";
import Modal from "./components/Modal";
import Booking from "./components/Booking";
import VisitCard from "./components/VisitCard";
import HeroMedia from "./components/HeroMedia";
import useMotion from "./hooks/useMotion";

function SectionTitle({ label, children, text, light = false }) {
  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{children}</h2>
      </div>
      {text && <p className="section-heading__text">{text}</p>}
    </div>
  );
}
function MapIllustration({ mode }) {
  return (
    <svg
      className="map-illustration"
      viewBox="0 0 640 460"
      role="img"
      aria-labelledby="map-title map-description"
    >
      <title id="map-title">Схема расположения «Лесной»</title>
      <desc id="map-description">
        Схема расположения клиники рядом с парком и набережной.{" "}
        {mode === "walk"
          ? "Пешеходный путь отмечен пунктиром."
          : "Подъезд на автомобиле отмечен сплошной линией."}
      </desc>
      <defs>
        <pattern
          id="map-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path d="M32 0H0v32" fill="none" stroke="#d8dfcf" strokeWidth=".6" />
        </pattern>
      </defs>
      <rect width="640" height="460" fill="#e9eddf" />
      <rect width="640" height="460" fill="url(#map-grid)" />
      <path
        d="M0 340C150 310 130 100 260 110c160 13 180 240 380 160v190H0Z"
        fill="#c7dad8"
      />
      <path
        d="M-20 284C150 273 132 39 280 54c131 13 176 219 380 143"
        fill="none"
        stroke="#f8f6ed"
        strokeWidth="36"
      />
      <path
        d="M114-20 400 480M-20 120 660 400"
        fill="none"
        stroke="#f8f6ed"
        strokeWidth="24"
      />
      <path
        d="m360 90 108 26-29 91-94-18ZM62 30l70 18-9 45-73-14ZM420 346l65 28-25 55-63-29Z"
        fill="#d5ddc9"
      />
      {[
        [255, 250],
        [290, 270],
        [243, 299],
        [206, 266],
        [74, 220],
        [102, 190],
        [475, 68],
        [513, 80],
        [491, 110],
        [580, 359],
        [551, 384],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="13" fill="#b9caaa" />
          <circle cx="-4" cy="-3" r="10" fill="#a8bd99" />
          <path d="M0 2v14" stroke="#7d9770" strokeWidth="2" />
        </g>
      ))}
      <g fill="#567062" fontFamily="Arial, sans-serif" fontSize="16">
        <text x="430" y="151" transform="rotate(11 430 151)">
          Лесной парк
        </text>
        <text x="55" y="115" transform="rotate(24 55 115)">
          Набережная
        </text>
        <text x="345" y="382" fill="#477b7c" transform="rotate(13 345 382)">
          Туманный ручей
        </text>
      </g>
      {mode === "walk" ? (
        <path
          d="M160 179 195 193 239 215 281 227 321 216"
          fill="none"
          stroke="#315f42"
          strokeWidth="5"
          strokeDasharray="3 10"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="m465 342-60-97-77-27"
          fill="none"
          stroke="#315f42"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      <circle
        cx={mode === "walk" ? 160 : 465}
        cy={mode === "walk" ? 179 : 342}
        r="7"
        fill="#fff"
        stroke="#315f42"
        strokeWidth="3"
      />
      <g transform="translate(321 195)">
        <path
          d="M0 31S-24 9-24-6a24 24 0 0 1 48 0C24 9 0 31 0 31Z"
          fill="#234c34"
        />
        <path
          d="M0-19v26M-13-6h26"
          stroke="#f3eddf"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(349 191)">
        <rect
          x="0"
          y="-20"
          width="116"
          height="40"
          rx="7"
          fill="#fffdf7"
          stroke="#d4dcca"
        />
        <text
          x="58"
          y="6"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="20"
          fill="#234c34"
        >
          Лесная
        </text>
      </g>
      <g
        transform="translate(595 42)"
        fill="none"
        stroke="#567062"
        strokeWidth="1.6"
      >
        <path d="M0 17v-30M-5-5l5-8 5 8" />
        <text
          x="0"
          y="-20"
          fill="#567062"
          stroke="none"
          fontSize="14"
          fontFamily="Arial"
          textAnchor="middle"
        >
          С
        </text>
      </g>
    </svg>
  );
}
export default function App() {
  useMotion();
  const [overlay, setOverlay] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState(0);
  const [mapMode, setMapMode] = useState("walk");
  const review = reviews[reviewIndex];
  const close = () => setOverlay(null);
  const book = (serviceId = "", doctorId = "", options = {}) =>
    setOverlay({ kind: "booking", serviceId, doctorId, ...options });
  const urgentBook = () => book("", "", { urgent: true });
  const scrollTo = (event, id) => {
    event.preventDefault();
    setOverlay(null);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      history.replaceState(null, "", "#" + id);
    });
  };
  const moveGallery = (direction) =>
    setOverlay((old) => ({
      ...old,
      index: (old.index + direction + gallery.length) % gallery.length,
    }));
  return (
    <>
      <div className="site-scroll">
        <a className="skip-link" href="#main">
          Перейти к содержанию
        </a>
        <header className="header">
          <div className="container header__inner">
            <a
              href="#home"
              className="brand-link"
              aria-label="Лесная — на главную"
            >
              <Brand />
            </a>
            <nav className="desktop-nav" aria-label="Основная навигация">
              {navigation.map(([id, label]) => (
                <a href={"#" + id} key={id}>
                  {label}
                </a>
              ))}
            </nav>
            <div className="header__actions">
              <button
                className="button button--urgent header__urgent"
                aria-label="Срочно — открыть запись"
                onClick={urgentBook}
              >
                Срочно
              </button>
              <button
                className="icon-button header__phone"
                aria-label="Показать контакты клиники"
                onClick={() => setOverlay({ kind: "contact" })}
              >
                <Icon name="phone" size={20} />
              </button>
              <button
                className="button button--amber header__book"
                onClick={() => book()}
              >
                Записаться <Icon name="northeast" size={17} />
              </button>
              <button
                className="icon-button header__menu"
                aria-label="Открыть меню"
                aria-haspopup="dialog"
                onClick={() => setOverlay({ kind: "menu" })}
              >
                <Icon name="menu" />
              </button>
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <section
            className="hero hero--film"
            id="home"
            aria-labelledby="hero-title"
          >
            <HeroMedia />
            <div className="hero__veil" />
            <div className="container hero__inner">
              <div className="hero__copy">
                <p className="eyebrow">
                  <span />
                  Ветеринарная клиника «Лесная»
                </p>
                <h1 id="hero-title">
                  Бережно к тем,
                  <br />
                  <em>кто вам дорог.</em>
                </h1>
                <p className="hero__lead">
                  Осмотры, диагностика и лечение кошек и собак. Начните с
                  консультации — поможем разобраться в следующих шагах.
                </p>
                <div className="hero__actions">
                  <button
                    className="button button--amber"
                    onClick={() => book()}
                  >
                    Записаться <Icon name="northeast" size={18} />
                  </button>
                  <a className="hero__link" href="#services">
                    Услуги и цены <Icon name="arrow" size={18} />
                  </a>
                </div>
                <div className="hero__location">
                  <Icon name="pin" size={18} />
                  <span>Вязёлье · рядом с Лесным парком</span>
                </div>
              </div>
            </div>
            <div className="hero__photo-note">
              <span className="status-dot" />
              Ежедневно · 09:00–21:00
            </div>
          </section>
          <div className="principles">
            <div className="container principles__grid">
              <div>
                <Icon name="heart" size={25} />
                <p>
                  <strong>Первичный приём</strong>
                  <span>История, осмотр и дальнейшие шаги</span>
                </p>
              </div>
              <div>
                <Icon name="shield" size={25} />
                <p>
                  <strong>Обсуждаем назначения</strong>
                  <span>Что нужно сделать и для чего</span>
                </p>
              </div>
              <div>
                <Icon name="leaf" size={25} />
                <p>
                  <strong>Рекомендации с собой</strong>
                  <span>Уход дома и повторный визит</span>
                </p>
              </div>
            </div>
          </div>
          <section className="section services" id="services">
            <div className="container">
              <SectionTitle
                label="Направления помощи"
                text="Сравните направления и цены. Состав услуги — в подробностях."
              >
                Услуги и цены
              </SectionTitle>
              <div className="service-cards">
                {services.map((service, index) => (
                  <article
                    className="service-card"
                    key={service.id}
                    id={"service-" + service.id}
                  >
                    <div className="service-card__heading">
                      <Icon name={service.icon} size={24} />
                      <h3>{service.title}</h3>
                      <span className="service-card__index" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="service-card__when">{service.when}</p>
                    <div className="service-card__price">
                      <strong>от {money(service.price)}</strong>
                      <span>{service.priceLabel}</span>
                    </div>
                    <details className="service-card__details">
                      <summary>
                        Что входит <Icon name="plus" size={17} />
                      </summary>
                      <div className="service-card__expanded">
                        <p>{service.description}</p>
                        <ul className="check-list">
                          {service.includes.map((text) => (
                            <li key={text}>
                              <Icon name="check" size={17} />
                              {text}
                            </li>
                          ))}
                        </ul>
                        <p className="service-card__duration">
                          <Icon name="clock" size={16} />
                          {service.duration}
                        </p>
                      </div>
                    </details>
                    <button
                      className="service-card__book"
                      onClick={() => book(service.id)}
                      aria-label={"Выбрать услугу: " + service.title}
                    >
                      Выбрать <Icon name="arrow" size={17} />
                    </button>
                  </article>
                ))}
              </div>
              <p className="section-note">
                Состав и стоимость лечения зависят от осмотра и согласованного
                плана.
              </p>
            </div>
          </section>
          <VisitCard onBook={(pet) => book("", "", { pet })} />
          <section className="section team" id="team">
            <div className="container">
              <SectionTitle
                label="Команда"
                text="Выберите врача по направлению работы."
              >
                Кто ведёт приём
              </SectionTitle>
              <div className="team-grid team-roster">
                {doctors.map((doctor) => (
                  <article className="doctor-card" key={doctor.id}>
                    <button
                      className="doctor-card__image"
                      onClick={() =>
                        setOverlay({ kind: "doctor", id: doctor.id })
                      }
                      aria-label={"Подробнее о враче " + doctor.name}
                    >
                      <img
                        src={img(doctor.image)}
                        width="928"
                        height="1152"
                        loading="lazy"
                        decoding="async"
                        alt={doctor.name}
                      />
                    </button>
                    <div className="doctor-card__info">
                      <div>
                        <h3>{doctor.name}</h3>
                        <p>{doctor.role}</p>
                      </div>
                      <p className="doctor-card__scope">{doctor.focus}</p>
                      <button
                        className="text-button"
                        onClick={() =>
                          setOverlay({ kind: "doctor", id: doctor.id })
                        }
                      >
                        О специалисте <Icon name="arrow" size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className="reviews section" id="reviews">
            <div className="container reviews__layout">
              <div className="reviews__intro">
                <p className="eyebrow">Обратная связь</p>
                <h2>После приёма.</h2>
              </div>
              <div className="review-card">
                <span className="review-card__quote" aria-hidden="true">
                  “
                </span>
                <div
                  className="review-live"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <blockquote key={reviewIndex}>{review.text}</blockquote>
                  <div className="review-person">
                    <span className="review-person__avatar" aria-hidden="true">
                      {review.initial}
                    </span>
                    <div>
                      <strong>
                        {review.name}
                        <span>{review.pet}</span>
                      </strong>
                      <p>{review.date}</p>
                    </div>
                  </div>
                </div>
                <div className="review-controls">
                  <span className="review-pagination">
                    <b>{String(reviewIndex + 1).padStart(2, "0")}</b>
                    <span>/ {String(reviews.length).padStart(2, "0")}</span>
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Предыдущий отзыв"
                      onClick={() =>
                        setReviewIndex(
                          (i) => (i - 1 + reviews.length) % reviews.length,
                        )
                      }
                    >
                      <Icon name="arrow" className="rotate-180" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Следующий отзыв"
                      onClick={() =>
                        setReviewIndex((i) => (i + 1) % reviews.length)
                      }
                    >
                      <Icon name="arrow" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section gallery" id="gallery">
            <div className="container">
              <SectionTitle
                label="Клиника"
                text="Приёмная, осмотр и ожидание визита — познакомьтесь с пространством."
              >
                Внутри «Лесной»
              </SectionTitle>
              <div className="gallery-grid">
                {gallery.map((g, i) => (
                  <button
                    className={"gallery-item gallery-item--" + i}
                    key={g.image}
                    onClick={() => setOverlay({ kind: "gallery", index: i })}
                    aria-label={"Открыть фото: " + g.title}
                  >
                    <div className="gallery-item__image">
                      <img
                        src={img(g.image)}
                        width="1264"
                        height="848"
                        loading="lazy"
                        decoding="async"
                        alt={g.alt}
                      />
                      <span className="gallery-item__zoom">
                        <Icon name="zoom" size={20} />
                      </span>
                    </div>
                    <div className="gallery-item__caption">
                      <span>0{i + 1}</span>
                      <div>
                        <h3>{g.title}</h3>
                        <p>{g.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="section faq" id="faq">
            <div className="container faq__grid">
              <div className="faq__intro">
                <p className="eyebrow">Вопросы и ответы</p>
                <h2>
                  Важное
                  <br />
                  перед визитом.
                </h2>
                <p>Подготовка, выбор услуги и стоимость — коротко о главном.</p>
                <button
                  className="text-link"
                  onClick={() => setOverlay({ kind: "contact" })}
                >
                  Остался вопрос? <Icon name="northeast" size={18} />
                </button>
              </div>
              <div className="faq-list">
                {faqs.map(([q, a], i) => (
                  <article
                    className={"faq-item " + (faqOpen === i ? "is-open" : "")}
                    key={q}
                  >
                    <h3>
                      <button
                        className="faq-question"
                        id={"faq-question-" + i}
                        aria-expanded={faqOpen === i}
                        aria-controls={"faq-answer-" + i}
                        onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
                      >
                        <span>{q}</span>
                        <Icon name="plus" size={20} />
                      </button>
                    </h3>
                    <div
                      className="faq-answer"
                      id={"faq-answer-" + i}
                      role="region"
                      aria-labelledby={"faq-question-" + i}
                      hidden={faqOpen !== i}
                    >
                      <p>{a}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className="section contacts" id="contacts">
            <div className="container">
              <SectionTitle light label="Как нас найти">
                Адрес и часы работы
              </SectionTitle>
              <div className="contacts__layout">
                <div className="contacts__details">
                  <p className="contacts__city">
                    <Icon name="pin" size={20} />
                    {clinic.city}
                  </p>
                  <address>{clinic.address}</address>
                  <p className="contacts__landmark">
                    У Лесного парка, рядом с набережной.
                  </p>
                  <div className="contact-lines">
                    <div>
                      <Icon name="clock" size={20} />
                      <span>
                        <small>Часы работы</small>
                        <strong>{clinic.hours}</strong>
                      </span>
                    </div>
                    <button onClick={() => setOverlay({ kind: "contact" })}>
                      <Icon name="phone" size={20} />
                      <span>
                        <small>Телефон клиники</small>
                        <strong>{clinic.phone}</strong>
                      </span>
                      <Icon name="northeast" size={18} />
                    </button>
                  </div>
                  <button
                    className="button button--amber"
                    onClick={() => book()}
                  >
                    Выбрать время приёма <Icon name="northeast" size={18} />
                  </button>
                </div>
                <div className="map-card">
                  <MapIllustration mode={mapMode} />
                  <div className="map-card__content">
                    <div
                      className="route-toggle"
                      role="group"
                      aria-label="Способ добраться"
                    >
                      <button
                        className={mapMode === "walk" ? "is-active" : ""}
                        aria-pressed={mapMode === "walk"}
                        onClick={() => setMapMode("walk")}
                      >
                        <Icon name="walk" size={18} />
                        Пешком
                      </button>
                      <button
                        className={mapMode === "car" ? "is-active" : ""}
                        aria-pressed={mapMode === "car"}
                        onClick={() => setMapMode("car")}
                      >
                        <Icon name="car" size={18} />
                        На машине
                      </button>
                    </div>
                    <p aria-live="polite">
                      {mapMode === "walk"
                        ? "От входа в парк по набережной до здания с зелёной стойкой приёмной."
                        : "Со стороны Лесной улицы — к парковке у входа."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="footer">
          <div className="container">
            <div className="footer__top">
              <a
                href="#home"
                className="brand-link"
                aria-label="Лесная — вернуться наверх"
              >
                <Brand small />
              </a>
              <p>
                Медицина с вниманием.
                <br />
                Забота с теплом.
              </p>
              <div className="footer__links">
                <a href="#services">Услуги и цены</a>
                <a href="#team">Наши врачи</a>
                <a href="#faq">Вопросы и ответы</a>
                <button onClick={() => setOverlay({ kind: "privacy" })}>
                  О данных
                </button>
              </div>
              <a
                className="footer__up icon-button"
                href="#home"
                aria-label="Вернуться в начало"
              >
                <Icon name="arrow" className="rotate-up" />
              </a>
            </div>
            <div className="footer__bottom">
              <span>© {new Date().getFullYear()} Лесная</span>

              <span>
                С заботой о тех,
                <br />
                кто рядом.
              </span>
            </div>
          </div>
        </footer>
      </div>
      <div
        className="mobile-actions is-visible"
        role="group"
        aria-label="Быстрая запись"
      >
        <button
          className="button button--urgent"
          aria-label="Срочно — открыть запись"
          onClick={urgentBook}
        >
          Срочно
        </button>
        <button className="button button--amber" onClick={() => book()}>
          Записаться <Icon name="northeast" size={17} />
        </button>
      </div>
      {overlay && (
        <Modal
          key={overlay.kind}
          onClose={close}
          titleId={
            overlay.kind === "booking" ? "booking-title" : "overlay-title"
          }
          className={"dialog--" + overlay.kind}
          onKeyDown={
            overlay.kind === "gallery"
              ? (e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    moveGallery(1);
                  }
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    moveGallery(-1);
                  }
                }
              : undefined
          }
        >
          {overlay.kind === "booking" && (
            <Booking
              initialService={overlay.serviceId}
              initialDoctor={overlay.doctorId}
              initialPet={overlay.pet}
              urgent={overlay.urgent}
              onClose={close}
            />
          )}
          {overlay.kind === "menu" && (
            <>
              <Brand />
              <h2 id="overlay-title" className="sr-only">
                Навигация по сайту
              </h2>
              <nav className="mobile-nav" aria-label="Мобильная навигация">
                {navigation.map(([id, label], i) => (
                  <a key={id} href={"#" + id} onClick={(e) => scrollTo(e, id)}>
                    <span>0{i + 1}</span>
                    {label}
                    <Icon name="northeast" size={20} />
                  </a>
                ))}
              </nav>
              <button className="button button--dark" onClick={() => book()}>
                Записаться на приём <Icon name="arrow" size={18} />
              </button>
              <button
                className="button button--urgent menu-urgent"
                onClick={urgentBook}
              >
                Срочно — открыть запись
              </button>
            </>
          )}
          {overlay.kind === "doctor" &&
            (() => {
              const d = doctors.find((d) => d.id === overlay.id);
              return (
                <div className="doctor-profile">
                  <img
                    src={img(d.image)}
                    alt={d.name}
                    width="928"
                    height="1152"
                  />
                  <div>
                    <p className="eyebrow">Знакомство с врачом</p>
                    <h2 id="overlay-title">{d.name}</h2>
                    <p className="doctor-profile__role">{d.role}</p>

                    <p>{d.description}</p>
                    <h3>Направления работы</h3>
                    <ul className="check-list">
                      {d.specialties.map((s) => (
                        <li key={s}>
                          <Icon name="check" size={17} />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="button button--dark"
                      onClick={() => book(d.service, d.id)}
                    >
                      Выбрать специалиста <Icon name="arrow" size={18} />
                    </button>
                  </div>
                </div>
              );
            })()}
          {overlay.kind === "gallery" && (
            <div className="lightbox">
              <h2 id="overlay-title" className="sr-only">
                {gallery[overlay.index].title}
              </h2>
              <img
                src={img(gallery[overlay.index].image)}
                alt={gallery[overlay.index].alt}
                width="1264"
                height="848"
              />
              <div className="lightbox__bottom">
                <div>
                  <h3>{gallery[overlay.index].title}</h3>
                  <p>{gallery[overlay.index].subtitle}</p>
                </div>
                <div className="lightbox__controls">
                  <button
                    className="icon-button"
                    aria-label="Предыдущее изображение"
                    onClick={() => moveGallery(-1)}
                  >
                    <Icon name="arrow" className="rotate-180" />
                  </button>
                  <span aria-live="polite">
                    {overlay.index + 1} / {gallery.length}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Следующее изображение"
                    onClick={() => moveGallery(1)}
                  >
                    <Icon name="arrow" />
                  </button>
                </div>
              </div>
            </div>
          )}
          {overlay.kind === "contact" && (
            <div className="contact-dialog">
              <span className="dialog-symbol">
                <Icon name="phone" size={28} />
              </span>
              <p className="eyebrow">Контакты</p>
              <h2 id="overlay-title">Связаться с клиникой</h2>
              <p className="dialog-lead">
                Телефон, часы работы и адрес клиники.
              </p>
              <div className="contact-dialog__info">
                <strong>{clinic.phone}</strong>
                <span>{clinic.hours}</span>
                <span>
                  {clinic.city}, {clinic.address}
                </span>
              </div>

              <button className="button button--dark" onClick={() => book()}>
                Перейти к записи <Icon name="arrow" size={18} />
              </button>
            </div>
          )}
          {overlay.kind === "privacy" && (
            <div className="privacy-dialog">
              <p className="eyebrow">Конфиденциальность</p>
              <h2 id="overlay-title">О данных</h2>
              <h3>Что происходит с данными?</h3>
              <p>
                Форма работает только в текущем окне браузера. Данные не
                отправляются на сервер, не записываются в localStorage и не
                создают запись на приём. После закрытия формы введённые значения
                удаляются.
              </p>
              <h3>Есть ли внешние сервисы?</h3>
              <p>
                Нет. Здесь нет аналитики, рекламных трекеров, внешних шрифтов,
                платёжных систем, карты стороннего сервиса или CRM. Все
                изображения и интерфейс включены в проект.
              </p>
              <button className="button button--dark" onClick={close}>
                Всё понятно <Icon name="check" size={18} />
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
