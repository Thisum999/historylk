import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import SmartImage from '../components/SmartImage';
import PaperCard from '../components/PaperCard';
import ScheduleTable from '../components/ScheduleTable';
import CtaBand from '../components/CtaBand';
import SignatureBand from '../components/SignatureBand';
import Community from '../components/Community';
import { Icon } from '../components/Icons';
import {
  DagobaSilhouette,
  KalamBand,
  LotusDivider,
  MandalaRing,
  PosterArtFallback,
  TeacherPortraitFallback,
} from '../components/Ornaments';
import { BRAND, CENTERS, FEATURES, GRADES, MEDIA, PHONES, TICKER_ITEMS, whatsappLink } from '../data/site';
import { getPapers } from '../lib/api';
import type { Paper } from '../lib/api';

const STATS = [
  { value: '6–11', label: 'ඉගැන්වෙන ශ්‍රේණි', hint: 'සාමාන්‍ය පෙල දක්වා' },
  { value: '10+', label: 'වසර ඉගැන්වීම්', hint: 'ගුරු සේවය හා ගුරු උපකාරක' },
  { value: 'O/L', label: 'ඉලක්කගත විභාගය', hint: '2027 සාමාන්‍ය පෙල' },
  { value: 'නොමිලේ', label: 'ප්‍රශ්න පත්‍ර එකතුව', hint: 'සියලු දෙනාට' },
];

export default function Home() {
  const [latest, setLatest] = useState<Paper[] | null>(null);
  const [center, setCenter] = useState(CENTERS[0].id);

  useEffect(() => {
    let active = true;
    getPapers()
      .then((papers) => {
        if (active) setLatest(papers.slice(0, 3));
      })
      .catch(() => {
        if (active) setLatest([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeCenter = CENTERS.find((item) => item.id === center) || CENTERS[0];

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <MandalaRing className="hero-mandala" />
          <DagobaSilhouette className="hero-dagoba" />
          <span className="hero-glow hero-glow--one" />
          <span className="hero-glow hero-glow--two" />
        </div>

        <div className="container hero-grid">
          <div className="hero-copy">
            <Reveal>
              <span className="eyebrow eyebrow--light">
                <span className="eyebrow-dot" />
                2027 O/L ඉලක්කගත · 6 – 11 ශ්‍රේණි
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="hero-title">
                අභිමානවත් දේශයක
                <br />
                <span className="gold-text">සාඩම්බර උරුමය</span>
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <p className="hero-sub">
                <strong>{BRAND.tagline}</strong> — ගාල්ල මහින්ද විද්‍යාලයේ ඉතිහාස ආචාර්ය හර්ෂණ නල්ලපෙරුම.
                වසර දහයකට අධික ගුරු සේවයේ හා ගුරු උපකාරක අත්දැකීම් සමඟ, 6 සිට 11 ශ්‍රේණි දක්වා
                දරුවන්ට ඉතිහාසය සරලව, රසවත්ව, ලකුණු ගන්නා ආකාරයට ඉගැන්වීමට බැඳී සිටිමි.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="hero-badges">
                {BRAND.qualifications.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
                <span className="badge badge--gold">{BRAND.role}</span>
              </div>
            </Reveal>

            <Reveal delay={290}>
              <div className="hero-actions">
                <Link className="btn btn--gold btn--lg" to="/classes">
                  පන්ති කාලසටහන බලන්න
                  <Icon name="arrowRight" size={18} />
                </Link>
                <Link className="btn btn--ghost btn--lg" to="/papers">
                  ප්‍රශ්න පත්‍ර එකතුව
                  <Icon name="download" size={18} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={350}>
              <div className="hero-phones">
                <span className="hero-phones-label">විමසීම්:</span>
                {PHONES.map((phone) => (
                  <a key={phone.tel} className="phone-link" href={`tel:${phone.tel}`}>
                    <Icon name="phone" size={14} />
                    {phone.display}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="hero-visual">
            <div className="portrait">
              <div className="portrait-frame">
                <SmartImage
                  src={MEDIA.teacher}
                  alt="හර්ෂණ නල්ලපෙරුම — ජාතික පාසල් ආචාර්ය"
                  className="portrait-img"
                  loading="eager"
                  fallback={<TeacherPortraitFallback />}
                />
                <div className="portrait-caption">
                  <strong>හර්ෂණ නල්ලපෙරුම</strong>
                  <span>ජාතික පාසල් ආචාර්ය · ඉතිහාසය</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}>
              {item}
              <span className="ticker-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      <SignatureBand />

      <section className="stats">
        <div className="container stats-grid">
          {STATS.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80} className="stat">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-hint">{stat.hint}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container quote-inner">
          <Reveal>
            <span className="quote-mark">“</span>
          </Reveal>
          <Reveal delay={80}>
            <blockquote className="quote-text">
              ඉතිහාසය මතක තබා ගන්නා දින ලැයිස්තුවක් නොවේ. අප අද ගොඩනඟන රටකට අතීතයෙන් ලැබෙන පාඩමයි.
              ඒ නිසා මම ඉතිහාසය හඳුන්වන්නේ <span className="gold-text">“අභිමානවන්ත දේශයක සාඩම්බර උරුමය”</span> ලෙසයි.
            </blockquote>
          </Reveal>
          <Reveal delay={150}>
            <div className="quote-sign">
              <span className="signature">හර්ෂණ නල්ලපෙරුම</span>
              <span className="quote-role">ජාතික පාසල් ආචාර්ය · ඉතිහාසය</span>
            </div>
          </Reveal>
          <LotusDivider />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                ඇයි මගේ පන්තිය?
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                ඉතිහාසය ලකුණු ගන්නා විෂයක් <span className="gold-text">කරගන්න</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub">
                අතීතය කියවීම, අවබෝධ කරගැනීම හා විභාගයට ලියන ආකාරය එකම මගකින් ඉගැන්වෙන පන්තියක්.
              </p>
            </Reveal>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 70} className="feature-card">
                <span className="feature-icon">
                  <Icon name={feature.icon} size={22} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <KalamBand />

      <section className="section section--dark grades-section">
        <div className="container">
          <div className="section-head section-head--center">
            <Reveal>
              <span className="eyebrow eyebrow--light">
                <span className="eyebrow-dot" />
                6 සිට 11 දක්වා
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title section-title--light">
                ඔබේ ශ්‍රේණියට ගැලපෙන <span className="gold-text">පාඩම් සැලසුම</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub section-sub--light">
                සෑම ශ්‍රේණියකටම වෙන් වූ විෂය නිර්දේශයක්, සටහන් හා ප්‍රශ්න පත්‍ර පුහුණුවක්.
              </p>
            </Reveal>
          </div>

          <div className="grades-grid">
            {GRADES.map((item, index) => (
              <Reveal key={item.grade} delay={index * 60} className="grade-card" variant="zoom">
                <div className="grade-head">
                  <span className="grade-num">{String(item.grade).padStart(2, '0')}</span>
                  <div className="grade-head-text">
                    <span className="grade-subject">{item.subject}</span>
                    <h3 className="grade-title">{item.headline}</h3>
                  </div>
                </div>
                <ul className="grade-topics">
                  {item.topics.map((topic) => (
                    <li key={topic}>
                      <Icon name="check" size={14} />
                      {topic}
                    </li>
                  ))}
                </ul>
                <Link to="/classes" className="grade-link">
                  පන්ති විස්තර
                  <Icon name="arrowRight" size={15} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section notice-section">
        <div className="container notice-grid">
          <div className="notice-copy">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                නව පන්ති දැනුම්දීම
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                2027 සාමාන්‍යපෙල ඉලක්කගත <span className="gold-text">නව පන්ති</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub">
                2027 නව අධ්‍යාපන ප්‍රතිසංස්කරණය යටතේ 6 ශ්‍රේණිය සමාජ අධ්‍යයනය (ඉතිහාසය, භූගෝල විද්‍යාව,
                පුරවැසි අධ්‍යාපනය) සඳහා ද නව පන්ති ආරම්භ වේ.
              </p>
            </Reveal>

            <Reveal delay={190}>
              <div className="notice-date">
                <span className="notice-date-num">09</span>
                <span className="notice-date-body">
                  <strong>{BRAND.startDate}</strong>
                  <small>දින ආරම්භය · දැන්ම සම්බන්ධ වන්න.</small>
                </span>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <ul className="notice-list">
                <li>
                  <Icon name="check" size={16} /> 6 ශ්‍රේණිය · සමාජ අධ්‍යයනය
                </li>
                <li>
                  <Icon name="check" size={16} /> 8 – 11 ශ්‍රේණි · ඉතිහාසය
                </li>
                <li>
                  <Icon name="check" size={16} /> තනි පුද්ගල හා කණ්ඩායම් පන්ති
                </li>
              </ul>
            </Reveal>

            <Reveal delay={290}>
              <div className="notice-actions">
                <a className="btn btn--gold" href={`tel:${PHONES[0].tel}`}>
                  <Icon name="phone" size={17} />
                  {PHONES[0].display}
                </a>
                <a className="btn btn--outline" href={whatsappLink()} target="_blank" rel="noreferrer">
                  <Icon name="chat" size={17} />
                  WhatsApp
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="notice-media" variant="right">
            <a
              className="notice-poster"
              href={MEDIA.schedulePoster}
              target="_blank"
              rel="noreferrer"
              aria-label="2027 පන්ති කාලසටහන විශාල කර බලන්න"
            >
              <SmartImage
                src={MEDIA.schedulePoster}
                alt="2027 නව පන්ති කාලසටහන — හර්ෂණ නල්ලපෙරුම"
                className="notice-poster-img"
                fallback={<PosterArtFallback />}
              />
            </a>
            <a
              className="notice-poster-note"
              href={MEDIA.schedulePoster}
              target="_blank"
              rel="noreferrer"
            >
               විශාල කර බලන්න
              <Icon name="external" size={12} />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  පන්ති කාලසටහන
                </span>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="section-title">
                  ඔබට ගැලපෙන <span className="gold-text">මධ්‍යස්ථානය</span> තෝරන්න
                </h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <Link to="/classes" className="btn btn--outline">
                සියලු මධ්‍යස්ථාන
                <Icon name="arrowRight" size={16} />
              </Link>
            </Reveal>
          </div>

          <div className="center-tabs" role="tablist" aria-label="පන්ති මධ්‍යස්ථාන">
            {CENTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === center}
                className={`center-tab ${item.id === center ? 'is-active' : ''}`}
                onClick={() => setCenter(item.id)}
              >
                <span>{item.name}</span>
                <small>{item.city}</small>
              </button>
            ))}
          </div>

          <div className="schedule-card">
            <div className="schedule-card-head">
              <span className="schedule-pin">
                <Icon name="mapPin" size={17} />
              </span>
              <strong>{activeCenter.name}</strong>
              <span className="schedule-city">{activeCenter.city}</span>
              <span className="schedule-days">{activeCenter.days}</span>
            </div>
            <ScheduleTable slots={activeCenter.slots} />
            <div className="schedule-card-foot">
              <p>පන්ති වේලාවන් වෙනස් විය හැක. අමතා තහවුරු කරගන්න.</p>
              <a className="link-arrow" href={`tel:${PHONES[0].tel}`}>
                අමතන්න
                <Icon name="phone" size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section papers-teaser">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  ප්‍රශ්න පත්‍ර එකතුව
                </span>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="section-title">
                  පාසල් වාර පරීක්ෂණ <span className="gold-text">ප්‍රශ්න පත්‍ර</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="section-sub">
                  නොමිලේ ම download කරගන්න.
                </p>
              </Reveal>
            </div>
            <Reveal delay={160}>
              <Link to="/papers" className="btn btn--dark">
                සියලු ප්‍රශ්න පත්‍ර
                <Icon name="arrowRight" size={16} />
              </Link>
            </Reveal>
          </div>

          <div className="paper-grid paper-grid--home">
            {latest === null ? (
              <>
                <div className="paper-skeleton" />
                <div className="paper-skeleton" />
                <div className="paper-skeleton" />
              </>
            ) : latest.length > 0 ? (
              latest.map((paper) => <PaperCard key={paper.id} paper={paper} />)
            ) : (
              <div className="papers-empty papers-empty--inline">
                <Icon name="fileText" size={26} />
                <h3>ප්‍රශ්න පත්‍ර ළඟදීම</h3>
                <p>අලුත් පාසල් වාර ප්‍රශ්න පත්‍ර ඉක්මනින් මෙහි එකතු වේ.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section about-teaser-section">
        <div className="container about-teaser">
          <Reveal className="about-teaser-media" variant="left">
            <div className="about-teaser-frame">
              <SmartImage
                src={MEDIA.teacherAbout}
                alt="හර්ෂණ නල්ලපෙරුම"
                className="about-teaser-img"
                fallback={<TeacherPortraitFallback />}
              />
            </div>
            <div className="about-teaser-badge">
              <span>ජාතික</span>
              <span>පාසල්</span>
              <span>ආචාර්ය</span>
            </div>
          </Reveal>

          <div className="about-teaser-copy">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                ගුරුවරයා ගැන
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                මම <span className="gold-text">හර්ෂණ නල්ලපෙරුම</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub">
                ජාතික පාසලක ඉතිහාස ආචාර්යවරයෙකු ලෙස වසර ගණනාවක් තිස්සේ 6 සිට 11 ශ්‍රේණි දක්වා දරුවන්ට
                ඉතිහාසය ඉගැන්වීමේ නියැලී සිටිමි. මගේ පන්තියේ ඉතිහාසය කියවනවාට වඩා රසවිඳින්නට ලැබේ.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <ul className="cred-list">
                {BRAND.qualifications.map((item) => (
                  <li key={item}>
                    <Icon name="award" size={16} />
                    {item}
                  </li>
                ))}
                <li>
                  <Icon name="shield" size={16} />
                  {BRAND.role}
                </li>
              </ul>
            </Reveal>
            <Reveal delay={230}>
              <div className="about-teaser-actions">
                <Link to="/about" className="btn btn--gold">
                  වැඩිදුර දැනගන්න
                  <Icon name="arrowRight" size={16} />
                </Link>
                <a className="btn btn--outline" href={`tel:${PHONES[1].tel}`}>
                  <Icon name="phone" size={16} />
                  {PHONES[1].display}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Community />

      <KalamBand className="kalam-band--dark" />

      <CtaBand />
    </>
  );
}
