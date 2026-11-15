import { useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { PHONES, SOCIAL, whatsappLink } from '../data/site';

export default function MobileDock() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="mobile-dock" aria-label="ඉක්මන් සබැඳි">
      <a className="dock-btn dock-btn--call" href={`tel:${PHONES[0].tel}`}>
        <Icon name="phone" size={18} />
        <span>අමතන්න</span>
      </a>
      <a
        className="dock-btn dock-btn--wa"
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="whatsapp" size={18} />
        <span>WhatsApp</span>
      </a>
      <a
        className="dock-btn dock-btn--group"
        href={SOCIAL.whatsappGroup}
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="users" size={18} />
        <span>සමූහය</span>
      </a>
    </nav>
  );
}
