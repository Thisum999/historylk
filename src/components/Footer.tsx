import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { BRAND, CENTERS, MEDIA, PHONES, SOCIAL, whatsappLink } from '../data/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a className="footer-logo-plate" href="/" aria-label="හිතට වදින HISTORY — මුල් පිටුව">
            <img src={MEDIA.logo} alt="හිතට වදින HISTORY — හර්ෂණ නල්ලපෙරුම" />
          </a>
          <p className="footer-about">
            {BRAND.tagline} ගුරුවරයා. {BRAND.role}වරයෙකු ලෙස 6 – 11 ශ්‍රේණි දක්වා ඉතිහාසය හා
            සමාජ අධ්‍යයනය ඉගැන්වීම.
          </p>
          <p className="footer-tagline">{BRAND.subject}</p>

          <div className="footer-socials">
            <a
              className="footer-social footer-social--wa"
              href={SOCIAL.whatsappGroup}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="whatsapp" size={16} />
              <span>WhatsApp සමූහය</span>
            </a>
            <a
              className="footer-social footer-social--fb"
              href={SOCIAL.facebookPage}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="facebook" size={16} />
              <span>Facebook පිටුව</span>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">අඩවිය</h3>
          <ul className="footer-links">
            <li><Link to="/">මුල් පිටුව</Link></li>
            <li><Link to="/about">ගුරුවරයා ගැන</Link></li>
            <li><Link to="/classes">පන්ති හා කාලසටහන</Link></li>
            <li><Link to="/papers">ප්‍රශ්න පත්‍ර එකතුව</Link></li>
            <li><Link to="/contact">සම්බන්ධ වන්න</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">පන්ති මධ්‍යස්ථාන</h3>
          <ul className="footer-links footer-links--plain">
            {CENTERS.map((center) => (
              <li key={center.id}>
                <span className="footer-center">{center.name}</span>
                <span className="footer-city">{center.city}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">සම්බන්ධ වන්න</h3>
          <ul className="footer-contact">
            {PHONES.map((phone) => (
              <li key={phone.tel}>
                <a href={`tel:${phone.tel}`}>
                  <Icon name="phone" size={15} />
                  {phone.display}
                </a>
              </li>
            ))}
          </ul>
          <a className="footer-whatsapp" href={whatsappLink()} target="_blank" rel="noreferrer">
            <Icon name="chat" size={16} />
            WhatsApp පණිවිඩයක් යවන්න
          </a>
          <a className="footer-whatsapp footer-whatsapp--alt" href={SOCIAL.whatsappGroup} target="_blank" rel="noreferrer">
            <Icon name="users" size={16} />
            පන්ති සමූහයට එකතු වන්න
          </a>
          <p className="footer-medium">{BRAND.medium} · 6 – 11 ශ්‍රේණි · O/L 2027</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} {BRAND.name}. සියලු හිමිකම් ඇවිරිණි.</p>
        <p className="footer-credit">
          {BRAND.wordmark} · {BRAND.latin}
          <Link to="/admin" className="footer-admin">
            <Icon name="lock" size={13} /> Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
