import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { MEDIA, PHONES, SOCIAL, whatsappLink } from '../data/site';

const NAV = [
  { to: '/', label: 'මුල් පිටුව' },
  { to: '/about', label: 'ගුරුවරයා' },
  { to: '/classes', label: 'පන්ති' },
  { to: '/papers', label: 'ප්‍රශ්න පත්‍ර' },
  { to: '/contact', label: 'සම්බන්ධ වන්න' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="හිතට වදින HISTORY — මුල් පිටුව">
          <span className="brand-logo">
            <img src={MEDIA.logo} alt="හිතට වදින HISTORY" />
          </span>
          <span className="brand-text">
            <span className="brand-name">හර්ෂණ නල්ලපෙරුම</span>
            <span className="brand-kicker">ජාතික පාසල් ආචාර්ය · ඉතිහාසය</span>
          </span>
        </Link>

        <nav className="nav" aria-label="ප්‍රධාන මෙනුව">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <div className="header-socials">
            <a
              className="social-pill social-pill--fb"
              href={SOCIAL.facebookPage}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook පිටුව"
            >
              <Icon name="facebook" size={15} />
            </a>
            <a
              className="social-pill social-pill--wa"
              href={SOCIAL.whatsappGroup}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp සමූහය"
            >
              <Icon name="whatsapp" size={15} />
            </a>
          </div>
          <a className="header-phone" href={`tel:${PHONES[0].tel}`}>
            <Icon name="phone" size={16} />
            <span>{PHONES[0].display}</span>
          </a>
          <Link to="/contact" className="btn btn--gold btn--sm header-cta">
            පන්තියට එකතු වන්න
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? 'මෙනුව වසන්න' : 'මෙනුව විවෘත කරන්න'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <div className="progress-rail" aria-hidden="true">
        <span className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <nav className="mobile-nav" aria-label="ජංගම මෙනුව">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.label}</span>
              <Icon name="arrowRight" size={16} />
            </NavLink>
          ))}
          <NavLink to="/admin" className="mobile-link mobile-link--muted">
            <span>Admin Login</span>
            <Icon name="lock" size={15} />
          </NavLink>
        </nav>

        <div className="mobile-socials">
          <a
            className="social-pill social-pill--wa"
            href={SOCIAL.whatsappGroup}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp සමූහය"
          >
            <Icon name="whatsapp" size={16} />
          </a>
          <a
            className="social-pill social-pill--fb"
            href={SOCIAL.facebookPage}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook පිටුව"
          >
            <Icon name="facebook" size={16} />
          </a>
          <span className="mobile-socials-label">සමූහයට එකතු වන්න</span>
        </div>

        <div className="mobile-foot">
          <p className="mobile-foot-title">විමසීම් සඳහා අමතන්න</p>
          {PHONES.map((phone) => (
            <a key={phone.tel} href={`tel:${phone.tel}`} className="mobile-phone">
              <Icon name="phone" size={16} />
              {phone.display}
            </a>
          ))}
          <a className="btn btn--gold btn--block" href={whatsappLink()} target="_blank" rel="noreferrer">
            WhatsApp හරහා කතා කරන්න
          </a>
        </div>
      </div>
    </header>
  );
}
