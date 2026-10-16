import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export default function ServiceDetails({ service }) {
  const ref = useRef(null);
  const desired = useRef(false);
  const running = useRef([]);
  const [expanded, setExpanded] = useState(false);
  const contentId = `service-includes-${service.id}`;
  const settle = () => {
    const el = ref.current;
    running.current.forEach(a => { a.onfinish = null; a.cancel(); });
    running.current = [];
    if (el) { el.open = desired.current; el.style.removeProperty('overflow'); }
  };
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const print = matchMedia('print');
    const stopForMedia = () => { if (reduced.matches || print.matches) settle(); };
    const stopIfHidden = () => { if (document.hidden) settle(); };
    reduced.addEventListener('change', stopForMedia);
    print.addEventListener('change', stopForMedia);
    window.addEventListener('resize', settle);
    window.addEventListener('beforeprint', settle);
    document.addEventListener('visibilitychange', stopIfHidden);
    return () => {
      reduced.removeEventListener('change', stopForMedia);
      print.removeEventListener('change', stopForMedia);
      window.removeEventListener('resize', settle);
      window.removeEventListener('beforeprint', settle);
      document.removeEventListener('visibilitychange', stopIfHidden);
      settle();
    };
  }, []);
  const toggle = event => {
    event.preventDefault();
    const el = ref.current;
    const start = el.getBoundingClientRect().height;
    desired.current = !desired.current;
    setExpanded(desired.current);
    settle();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !el.animate || document.hidden) return;
    // Measure the natural target, then keep native details open until closing ends.
    const end = el.getBoundingClientRect().height;
    el.open = true;
    el.style.overflow = 'hidden';
    const height = el.animate([{ height: `${start}px` }, { height: `${end}px` }], {
      duration: 300, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'
    });
    running.current = [height];
    height.onfinish = settle;
  };
  return (
    <details className="service-card__details" ref={ref}>
      <summary onClick={toggle} aria-expanded={expanded} aria-controls={contentId}>
        <span>Что входит</span><Icon name="plus" size={17} />
      </summary>
      <div className="service-card__expanded" id={contentId}>
        <p>{service.description}</p>
        <ul className="check-list">
          {service.includes.map(text => <li key={text}><Icon name="check" size={17} />{text}</li>)}
        </ul>
        <p className="service-card__duration"><Icon name="clock" size={16} />{service.duration}</p>
      </div>
    </details>
  );
}
