import { useRef, useState } from "react";
import Icon from "./Icon";
import { doctors, services } from "../data";
export default function Booking({
  initialService,
  initialDoctor,
  initialPet,
  urgent = false,
  onClose,
}) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    pet: initialPet || "",
    service: initialService || "",
    doctor: initialDoctor || "",
    date: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const formRef = useRef(null);
  const successRef = useRef(null);
  const minDate = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();
  const update = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((v) => ({ ...v, [name]: undefined }));
  };
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (values.name.trim().length < 2)
      next.name = "Введите имя: минимум 2 символа.";
    const digits = values.phone.replace(/\D/g, "");
    if (
      digits.length < 10 ||
      digits.length > 15 ||
      !/^[+\d\s()−-]+$/.test(values.phone)
    )
      next.phone = "Введите телефон: от 10 до 15 цифр.";
    if (!values.pet) next.pet = "Выберите, кто придёт на приём.";
    if (
      values.date &&
      (values.date < minDate || values.date.slice(0, 4) > "2100")
    )
      next.date = "Выберите сегодняшнюю или будущую дату до 2100 года.";
    setErrors(next);
    if (next.date) setOptionsOpen(true);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => {
        const field = formRef.current?.querySelector('[aria-invalid="true"]');
        const dialog = field?.closest("dialog");
        if (dialog) dialog.scrollTop = 0;
        field?.focus({ preventScroll: true });
        const box = field?.closest(".field")?.getBoundingClientRect();
        const frame = dialog?.getBoundingClientRect();
        if (box && frame && box.bottom > frame.bottom - 24) {
          dialog.scrollTop += box.bottom - frame.bottom + 24;
        }
      });
      return;
    }
    setDone(true);
    requestAnimationFrame(() => {
      const target = successRef.current;
      const dialog = target?.closest("dialog");
      if (dialog) dialog.scrollTop = 0;
      target?.focus({ preventScroll: true });
    });
  };
  if (done)
    return (
      <div className="booking-success">
        <span className="success-mark">
          <Icon name="check" size={30} />
        </span>
        <p className="eyebrow">Проверка формы</p>
        <h2 id="booking-title" tabIndex={-1} ref={successRef}>
          Данные проверены
        </h2>
        <p>{values.name.trim()}, проверьте выбранные данные.</p>
        {urgent && <p className="booking-urgent-status">Срочная запись</p>}
        <dl className="booking-summary">
          <div>
            <dt>Услуга</dt>
            <dd>
              {services.find((s) => s.id === values.service)?.title ||
                "Помочь определиться"}
            </dd>
          </div>
          <div>
            <dt>Питомец</dt>
            <dd>{values.pet}</dd>
          </div>
          <div>
            <dt>Специалист</dt>
            <dd>
              {doctors.find((d) => d.id === values.doctor)?.name ||
                "Подберёт администратор"}
            </dd>
          </div>
          <div>
            <dt>Желаемая дата</dt>
            <dd>
              {values.date
                ? new Date(values.date + "T12:00:00").toLocaleDateString(
                    "ru-RU",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "По согласованию"}
            </dd>
          </div>
        </dl>
        <div className="demo-note">
          <Icon name="shield" />
          <p>
            Заявка не отправлена: отправка пока не подключена. Приём не
            забронирован.
          </p>
        </div>
        <div className="dialog-actions">
          <button className="button button--dark" onClick={onClose}>
            Понятно, спасибо <Icon name="check" size={18} />
          </button>
          <button
            className="text-button"
            onClick={() => {
              setDone(false);
              requestAnimationFrame(() => {
                const form = formRef.current;
                const dialog = form?.closest("dialog");
                if (dialog) dialog.scrollTop = 0;
                form?.querySelector("input")?.focus({ preventScroll: true });
              });
            }}
          >
            Изменить данные
          </button>
        </div>
      </div>
    );
  return (
    <>
      <h2 id="booking-title">
        {urgent ? "Срочная запись" : "Запись на приём"}
      </h2>
      {urgent && (
        <div
          className="urgent-notice"
          role="note"
          tabIndex={-1}
          data-autofocus
          aria-label="Важно при экстренной ситуации"
        >
          <Icon name="urgent" size={22} />
          <p>
            <strong>При угрозе жизни не ждите онлайн-записи.</strong>Позвоните в
            ближайшую работающую ветклинику. Онлайн-запись не заменяет
            экстренную помощь.
          </p>
        </div>
      )}

      {initialDoctor && (
        <p className="booking-choice">
          Специалист: {doctors.find((d) => d.id === initialDoctor)?.name}
        </p>
      )}
      <form ref={formRef} className="booking-form" noValidate onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="booking-name">Ваше имя *</label>
            <input
              id="booking-name"
              name="name"
              autoComplete="given-name"
              maxLength={60}
              value={values.name}
              onChange={update}
              data-autofocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="Как к вам обращаться?"
            />
            {errors.name && (
              <span className="field-error" id="name-error">
                {errors.name}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="booking-phone">Телефон *</label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={25}
              value={values.phone}
              onChange={update}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              placeholder="+7 (___) ___-__-__"
            />
            {errors.phone && (
              <span className="field-error" id="phone-error">
                {errors.phone}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="booking-pet">Ваш питомец *</label>
            <select
              id="booking-pet"
              name="pet"
              value={values.pet}
              onChange={update}
              aria-invalid={Boolean(errors.pet)}
              aria-describedby={errors.pet ? "pet-error" : undefined}
            >
              <option value="">Выберите питомца</option>
              <option>Кошка</option>
              <option>Собака</option>
              <option>Другой питомец</option>
            </select>
            {errors.pet && (
              <span className="field-error" id="pet-error">
                {errors.pet}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="booking-service">Услуга</label>
            <select
              id="booking-service"
              name="service"
              value={values.service}
              onChange={update}
            >
              <option value="">Помогите определиться</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <details
          className="booking-options"
          open={optionsOpen}
          onToggle={(e) => setOptionsOpen(e.currentTarget.open)}
        >
          <summary>
            Дата, врач и комментарий <span>Необязательно</span>
            <Icon name="plus" size={17} />
          </summary>
          <div className="booking-options__content">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="booking-doctor">Специалист</label>
                <select
                  id="booking-doctor"
                  name="doctor"
                  value={values.doctor}
                  onChange={update}
                >
                  <option value="">Подберёт администратор</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="booking-date">Желаемая дата</label>
                <input
                  id="booking-date"
                  name="date"
                  type="date"
                  min={minDate}
                  max="2100-12-31"
                  value={values.date}
                  onChange={update}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date && (
                  <span className="field-error" id="date-error">
                    {errors.date}
                  </span>
                )}
              </div>
            </div>
            <div className="field">
              <label htmlFor="booking-note">
                Что вас беспокоит? <span>Необязательно</span>
              </label>
              <textarea
                id="booking-note"
                name="note"
                maxLength={600}
                value={values.note}
                onChange={update}
                placeholder="Имя питомца, возраст и повод для визита"
                rows={3}
              />
            </div>
          </div>
        </details>
        <button className="button button--dark form-submit" type="submit">
          Продолжить <Icon name="arrow" size={18} />
        </button>
        <button
          className="text-button form-cancel"
          type="button"
          onClick={onClose}
        >
          Закрыть без сохранения
        </button>
        <p className="form-footnote">Данные удалятся после закрытия окна.</p>
      </form>
    </>
  );
}
