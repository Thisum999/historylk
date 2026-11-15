import Reveal from './Reveal';
import { Icon } from './Icons';
import { COMMUNITY, SOCIAL, whatsappLink } from '../data/site';

export default function Community() {
  return (
    <section className="section community" id="community">
      <div className="community-aurora community-aurora--one" aria-hidden="true" />
      <div className="community-aurora community-aurora--two" aria-hidden="true" />

      <div className="container">
        <div className="section-head section-head--center">
          <Reveal>
            <span className="eyebrow eyebrow--light">
              <span className="eyebrow-dot" />
              {COMMUNITY.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="section-title section-title--light">{COMMUNITY.title}</h2>
          </Reveal>
          <Reveal delay={130}>
            <p className="section-sub section-sub--light">{COMMUNITY.sub}</p>
          </Reveal>
        </div>

        <div className="community-grid">
          <Reveal className="community-card community-card--wa">
            <span className="community-icon">
              <Icon name="whatsapp" size={26} strokeWidth={1.4} />
            </span>
            <span className="community-tag">WhatsApp සමූහය</span>
            <h3>පන්ති සමූහයට එකතු වන්න</h3>
            <p>
              අලුත් පත්‍රිකා, කාලසටහන් වෙනස්කම් හා කෙටි ප්‍රශ්න විවරණ එකම තැනකින්. පන්තියට එන නොඑන
              සියලු දෙනාට විවෘතයි.
            </p>
            <ul className="community-list">
              <li>
                <Icon name="check" size={14} />
                නව පත්‍රිකා පිළිබඳ පළමු දැනුම්දීම
              </li>
              <li>
                <Icon name="check" size={14} />
                සතිපතා කෙටි ප්‍රශ්න විවරණ
              </li>
              <li>
                <Icon name="check" size={14} />
                පන්ති කාලසටහන් හා ස්ථාන යාවත්කාලීන
              </li>
            </ul>
            <div className="community-actions">
              <a
                className="btn btn--whatsapp btn--lg"
                href={SOCIAL.whatsappGroup}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="whatsapp" size={18} />
                සමූහයට එකතු වන්න
              </a>
              <a
                className="btn btn--ghost btn--lg"
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="chat" size={18} />
                තනි පණිවිඩයක්
              </a>
            </div>
          </Reveal>

          <Reveal delay={110} className="community-card community-card--fb">
            <span className="community-icon">
              <Icon name="facebook" size={26} strokeWidth={1.4} />
            </span>
            <span className="community-tag">Facebook පිටුව</span>
            <h3>අපේ පිටුව follow කරන්න</h3>
            <p>
              පන්ති පෝස්ටර, විභාග දැනුම්දීම්, ඡායාරූප හා ඉතිහාස කතා පිටුවේ පළ වේ. දැනුම්දීම් මඟ නොහැරෙන්න.
            </p>
            <ul className="community-list">
              <li>
                <Icon name="check" size={14} />
                නව පන්ති පෝස්ටර හා දැනුම්දීම්
              </li>
              <li>
                <Icon name="check" size={14} />
                ඉතිහාස කතා හා පින්තූර
              </li>
              <li>
                <Icon name="check" size={14} />
                ප්‍රතිඵල හා ඇගයීම්
              </li>
            </ul>
            <div className="community-actions">
              <a
                className="btn btn--facebook btn--lg"
                href={SOCIAL.facebookPage}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="facebook" size={18} />
                පිටුව බලන්න
              </a>
              <a className="btn btn--ghost btn--lg" href={whatsappLink()} target="_blank" rel="noreferrer">
                <Icon name="phone" size={18} />
                විස්තර අහන්න
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <p className="community-foot">
            <Icon name="shield" size={15} />
            සමූහයේ දැනුම්දීම් පමණක් — අනවශ්‍ය පණිවිඩ එවන්නේ නැත.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
