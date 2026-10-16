import Icon from './Icon';
import { clinic } from '../data';

// A verified phone makes every urgent shortcut a native telephone link.
// Never use the demonstration number as a working emergency contact.
export default function UrgentAction({ className = '', onUnavailable, expanded = false }) {
  const Tag = clinic.phoneHref ? 'a' : 'button';
  return (
    <Tag
      className={`button button--urgent ${className}`}
      href={clinic.phoneHref || undefined}
      type={clinic.phoneHref ? undefined : 'button'}
      onClick={clinic.phoneHref ? undefined : onUnavailable}
      aria-label={clinic.phoneHref ? 'Срочно — позвонить в клинику' : 'Срочно — телефонная помощь'}
    >
      <Icon name="phone" size={18} />
      <span>{expanded ? 'Срочно — позвонить' : 'Срочно'}</span>
    </Tag>
  );
}
