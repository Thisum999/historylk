import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import SmartImage from '../components/SmartImage';
import CtaBand from '../components/CtaBand';
import { Icon } from '../components/Icons';
import { LotusDivider, TeacherPortraitFallback } from '../components/Ornaments';
import { APPROACH, BRAND, MEDIA, PHONES } from '../data/site';

const CREDENTIALS = [
  {
    icon: 'award',
    title: 'B.A.',
    text: 'ශාස්ත්‍රවේදී උපාධිය — ඉතිහාසය හා සම්බන්ධ විෂය ප්‍රදේශය.',
  },
  {
    icon: 'book',
    title: 'PGDE',
    text: 'පශ්චාත් උපාධිය අධ්‍යාපන විජ්ජලෝචනාචාර්යය (P.G.E.D) — නවීන ඉගැන්වීමේ ක්‍රමවේද හා ශිෂ්‍ය ඇගයීම.',
  },
  {
    icon: 'layers',
    title: 'Dip. in Buddhism',
    text: 'බෞද්ධ අධ්‍යයනය පිළිබඳ ඩිප්ලෝමාව — ආගමික හා සංස්කෘතික උරුමය පිළිබඳ ගැඹුරු අවබෝධය.',
  },
  {
    icon: 'users',
    title: 'Dip. in Pali',
    text: 'පාලි භාෂාව පිළිබඳ ඩිප්ලෝමාව — මූලාශ්‍ර හා ඓතිහාසික ලේඛන කියවීමේ හැකියාව.',
  },
];

const TEACHING_STEPS = [
  'විෂය නිර්දේශයේ අංශ සම්පූර්ණයෙන් ආවරණය කිරීම',
  'සිතියම් ලකුණු කිරීම හා ක්ෂේත්‍ර චාරිකා',
  'ඒකක පරීක්ෂණ පැවැත්වීම',
  'වාර පරීක්ෂණ සඳහා පසුගිය විභාග ප්‍රශ්න පත්‍ර විශ්ලේෂණය',
  'නිබන්ධන මගින් සටහන් ලීම පසු කිරීම',
  'අත්‍යාවශ්‍ය කරුණු දෙනිකව මතකයට යොමු කරවන ක්‍රියාමාර්ග',
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="ගුරුවරයා ගැන"
        title={
          <>
            ඉතිහාසයේ සිරි අසිරි කියා දෙන <span className="gold-text">හර්ෂණ නල්ලපෙරුම</span>
          </>
        }
        sub={`${BRAND.college} ඉතිහාස ආචාර්ය · ${BRAND.experience} ගුරු සේවය හා ගුරු උපකාරක අත්දැකීම`}
      />

      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-media">
            <div className="about-frame">
              <SmartImage
                src={MEDIA.teacherAbout}
                alt="හර්ෂණ නල්ලපෙරුම"
                className="about-img"
                loading="eager"
                fallback={<TeacherPortraitFallback />}
              />
            </div>
            <div className="about-media-card">
              <span className="about-media-kicker">ඉතිහාසය · 6 – 11 ශ්‍රේණි</span>
              <strong>{BRAND.medium}</strong>
              <span>තනි පුද්ගල හා කණ්ඩායම් පන්ති</span>
            </div>
          </Reveal>

          <div className="about-copy">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                මගේ කතාව
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                ඉතිහාසය යනු අතීතයෙන් <span className="gold-text">අනාගතයට</span> පිවිසෙන යතුරයි
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="about-p">
                මම හර්ෂණ නල්ලපෙරුම. ගාල්ල මහින්ද විද්‍යාලයේ ඉතිහාසය ආචාර්යවරයෙකු වන මම, ශ්‍රී ලංකා ගුරු
                සේවයේ වසර දහයකට අධික කාලයක් තිස්සේ ඉතිහාසය ඉගැන්වීමේ නියැලී සිටිමි.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="about-p">
                දකුණු ලක අග්‍රණය බෞද්ධ තක්ෂලාව වූ මහින්ද විද්‍යාලයේ ඉතිහාසය පිළිබඳ ආචාර්යවරයෙකු ලෙසත්,
                ගුරු උපකාරක පන්ති ක්ෂේත්‍රයේ දශකයකට අධික කාලයක් විශාල සිසුන් ප්‍රමාණයකට ජීවිතය ජය ගැනීමට
                අවශ්‍ය මඟ පෙන්වීම සිදු කරමින් ද කටයුතු කරමි.
              </p>
            </Reveal>
            <Reveal delay={230}>
              <p className="about-p">
                ඉතිහාසය කියන්නේ අතීතයේ සිට වර්තමානය හඳුනාගෙන අනාගතයට පිවිසෙන යතුරක්. ඒ නිසාම මම මගේ
                ව්‍යාපාරයේදී මාව හඳුන්වා දෙන්නේ <strong>“ඉතිහාසයේ සිරි අසිරි කියා දෙන හර්ෂණ
                නල්ලපෙරුම”</strong> ලෙසයි. මගේ විෂය නම් <strong>“අභිමානවන්ත දේශයක සාඩම්බර උරුමය”</strong> ය.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="about-actions">
                <Link to="/classes" className="btn btn--gold">
                  පන්ති බලන්න
                  <Icon name="arrowRight" size={16} />
                </Link>
                <a className="btn btn--outline" href={`tel:${PHONES[0].tel}`}>
                  <Icon name="phone" size={16} />
                  {PHONES[0].display}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head section-head--center">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                අධ්‍යාපන සුදුසුකම්
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                විෂය ගැඹුරින් <span className="gold-text">දැනගත්</span> ගුරුවරයෙක්
              </h2>
            </Reveal>
          </div>

          <div className="cred-grid">
            {CREDENTIALS.map((credential, index) => (
              <Reveal key={credential.title} delay={index * 70} className="cred-card">
                <span className="cred-icon">
                  <Icon name={credential.icon} size={22} />
                </span>
                <h3>{credential.title}</h3>
                <p>{credential.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container quote-inner quote-inner--tight">
          <Reveal>
            <span className="quote-mark">“</span>
          </Reveal>
          <Reveal delay={80}>
            <blockquote className="quote-text">
              ඉතිහාසය යනු අපේ අතීතය පමණක් නොවේ. අපේ අනාගතය ගොඩනඟන පදනමයි. ඒ නිසා මම එය{' '}
              <span className="gold-text">අභිමානවන්ත දේශයක සාඩම්බර උරුමය</span> ලෙස හඳුන්වමි.
            </blockquote>
          </Reveal>
          <Reveal delay={150}>
            <div className="quote-sign">
              <span className="signature">හර්ෂණ නල්ලපෙරුම</span>
              <span className="quote-role">{BRAND.role}</span>
            </div>
            <img className="quote-seal" src={MEDIA.seal} alt="" aria-hidden="true" loading="lazy" />
          </Reveal>
          <LotusDivider />
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                ඉගැන්වීමේ ක්‍රමය
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                පන්තිය තුළ <span className="gold-text">සිදුවන දේ</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub">
                සෑම පාඩමක්ම සරලව, සිතියම් සමඟ, විභාගයට සූදානම් වන ආකාරයට සැලසුම් කර ඇත.
              </p>
            </Reveal>
          </div>

          <div className="approach-grid">
            {APPROACH.map((item, index) => (
              <Reveal key={item.title} delay={index * 70} className="approach-card">
                <span className="approach-num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                පන්ති ක්‍රමවේදය
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                සෑම මාසයකම <span className="gold-text">ක්‍රියාත්මක වන දේ</span>
              </h2>
            </Reveal>
          </div>

          <div className="method-grid">
            {TEACHING_STEPS.map((step, index) => (
              <Reveal key={step} delay={index * 60} className="method-card">
                <span className="method-icon">
                  <Icon name="check" size={15} />
                </span>
                <span>{step}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
