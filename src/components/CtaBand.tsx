import { Link } from 'react-router-dom';
import { Icon } from './Icons';
import { PHONES, SOCIAL, whatsappLink } from '../data/site';

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="cta-glow" aria-hidden="true" />
      <div className="container cta-inner">
        <div className="cta-copy">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow-dot" />
            ඔබේ ආසනය අදම
          </span>
          <h2 className="cta-title">
            ඉතිහාසයට <span className="gold-text">ආදරය කරන</span> දරුවෙකු ගොඩනගන්න
          </h2>
          <p className="cta-sub">
            2027 සාමාන්‍යපෙල ඉලක්කගත නව පන්ති සඳහා දැන්ම ලියාපදිංචි වන්න. ඔබට ආසන්නතම මධ්‍යස්ථානය
            හා පන්ති වේලාව විමසන්න.
          </p>
          <div className="cta-actions">
            <a className="btn btn--gold btn--lg" href={`tel:${PHONES[0].tel}`}>
              <Icon name="phone" size={18} />
              {PHONES[0].display}
            </a>
            <a className="btn btn--ghost btn--lg" href={whatsappLink()} target="_blank" rel="noreferrer">
              <Icon name="chat" size={18} />
              WhatsApp
            </a>
            <a className="btn btn--ghost btn--lg" href={SOCIAL.whatsappGroup} target="_blank" rel="noreferrer">
              <Icon name="users" size={18} />
              සමූහයට එකතු වන්න
            </a>
            <Link className="btn btn--ghost btn--lg" to="/papers">
              <Icon name="download" size={18} />
              පත්‍රිකා
            </Link>
          </div>
        </div>
        <div className="cta-note">
          <span className="cta-note-line" />
          <p>“අභිමානවන්ත දේශයක සාඩම්බර උරුමය”</p>
          <span>හර්ෂණ නල්ලපෙරුම · ජාතික පාසල් ආචාර්ය</span>
        </div>
      </div>
    </section>
  );
}
