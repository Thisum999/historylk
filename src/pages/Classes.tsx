import { useState } from 'react';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import ScheduleTable from '../components/ScheduleTable';
import CtaBand from '../components/CtaBand';
import { Icon } from '../components/Icons';
import { BRAND, CENTERS, GRADES, MEDIA, PHONES, whatsappLink } from '../data/site';

export default function Classes() {
  const [active, setActive] = useState(CENTERS[0].id);
  const center = CENTERS.find((item) => item.id === active) || CENTERS[0];

  return (
    <>
      <PageHero
        eyebrow="පන්ති හා කාලසටහන"
        title={
          <>
            6 – 11 ශ්‍රේණි <span className="gold-text">ඉතිහාස පන්ති</span>
          </>
        }
        sub="සිංහල මාධ්‍යයෙන්, කුඩා කණ්ඩායම් හා තනි පුද්ගල පන්ති ලෙස. ඔබට ආසන්නතම මධ්‍යස්ථානය තෝරන්න."
        aside={
          <div className="hero-aside-card">
            <span className="hero-aside-kicker">2027 O/L ඉලක්කගත</span>
            <strong>නව පන්ති</strong>
            <span className="hero-aside-date">{BRAND.startDate}</span>
            <span className="hero-aside-note">දැන්ම ආසනය වෙන්කරවා ගන්න</span>
          </div>
        }
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                විෂය ආවරණය
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                ශ්‍රේණිය අනුව <span className="gold-text">පාඩම් සැලසුම</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub">
                6 – 8 ශ්‍රේණි සඳහා සමාජ අධ්‍යයනය, 9 – 11 ශ්‍රේණි සඳහා ඉතිහාසය. සෑම මට්ටමකටම වෙන් වූ
                ප්‍රශ්න පත්‍ර හා පුනරීක්ෂණ.
              </p>
            </Reveal>
          </div>

          <div className="class-grid">
            {GRADES.map((item, index) => (
              <Reveal key={item.grade} delay={index * 60} className="class-card">
                <div className="class-card-top">
                  <span className="class-grade">{item.grade}</span>
                  <span className="class-subject">{item.subject}</span>
                </div>
                <h3 className="class-headline">{item.headline}</h3>
                <ul className="class-topics">
                  {item.topics.map((topic) => (
                    <li key={topic}>
                      <Icon name="check" size={14} />
                      {topic}
                    </li>
                  ))}
                </ul>
                <a className="class-call" href={`tel:${PHONES[0].tel}`}>
                  <Icon name="phone" size={15} />
                  විස්තර අමතන්න
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section-head section-head--center">
            <Reveal>
              <span className="eyebrow eyebrow--light">
                <span className="eyebrow-dot" />
                පන්ති කාලසටහන
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title section-title--light">
                මධ්‍යස්ථාන <span className="gold-text">4ක්</span> තුළ පන්ති
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="section-sub section-sub--light">
                ඔබේ නගරය තෝරා පන්ති දිනය හා වේලාව බලන්න. වේලාවන් වෙනස් විය හැකි බැවින් අමතා තහවුරු කරගන්න.
              </p>
            </Reveal>
          </div>

          <div className="center-tabs center-tabs--light" role="tablist" aria-label="පන්ති මධ්‍යස්ථාන">
            {CENTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === active}
                className={`center-tab ${item.id === active ? 'is-active' : ''}`}
                onClick={() => setActive(item.id)}
              >
                <span>{item.name}</span>
                <small>{item.city}</small>
              </button>
            ))}
          </div>

          <div className="schedule-card schedule-card--wide">
            <div className="schedule-card-head">
              <span className="schedule-pin">
                <Icon name="mapPin" size={17} />
              </span>
              <strong>{center.name}</strong>
              <span className="schedule-city">{center.city}</span>
              <span className="schedule-days">{center.days}</span>
            </div>
            <ScheduleTable slots={center.slots} />
          </div>

          <div className="center-note-grid">
            {CENTERS.map((item, index) => (
              <Reveal key={item.id} delay={index * 60} className={`center-note ${item.id === active ? 'is-active' : ''}`}>
                <span className="center-note-name">{item.name}</span>
                <span className="center-note-city">{item.city}</span>
                <span className="center-note-days">{item.days}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  2027 පන්ති දැනුම්දීම්
                </span>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="section-title">
                  පන්ති <span className="gold-text">පෝස්ටර</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="section-sub">
                  මධ්‍යස්ථානය අනුව 2027 පන්ති වේලාවන්. පෝස්ටරයක් ක්ලික් කර විශාල කර බලන්න.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="poster-grid">
            {MEDIA.posters.map((poster, index) => (
              <Reveal key={poster.src} delay={index * 70} className="poster-tile">
                <a href={poster.src} target="_blank" rel="noreferrer">
                  <img src={poster.src} alt={`2027 පන්ති පෝස්ටරය — ${poster.label}`} loading="lazy" />
                  <span className="poster-tile-label">{poster.label}</span>
                </a>
              </Reveal>
            ))}
            <Reveal delay={210} className="poster-tile poster-tile--wide">
              <a href={MEDIA.schedulePoster} target="_blank" rel="noreferrer">
                <img
                  src={MEDIA.schedulePoster}
                  alt="2027 සම්පූර්ණ පන්ති කාලසටහන — සියලු මධ්‍යස්ථාන"
                  loading="lazy"
                />
                <span className="poster-tile-label">2027 සම්පූර්ණ කාලසටහන · සියලු මධ්‍යස්ථාන</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                පන්ති ක්‍රමය
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                ඔබට ගැලපෙන <span className="gold-text">ආකාරය</span> තෝරන්න
              </h2>
            </Reveal>
          </div>

          <div className="format-grid">
            <Reveal className="format-card">
              <span className="format-icon">
                <Icon name="users" size={22} />
              </span>
              <h3>කණ්ඩායම් පන්ති</h3>
              <p>
                එකම ශ්‍රේණියේ සිසුන් කුඩා කණ්ඩායම් ලෙස එකට ඉගෙන ගනිමින්, ප්‍රශ්න විසඳීම හා සාකච්ඡා
                කිරීම හරහා විෂය ගැඹුරින් තේරුම් ගනී.
              </p>
              <span className="format-tag">සතියකට පන්ති දින නියමිතයි</span>
            </Reveal>

            <Reveal delay={80} className="format-card format-card--featured">
              <span className="format-icon">
                <Icon name="star" size={22} />
              </span>
              <h3>තනි පුද්ගල පන්ති</h3>
              <p>
                දරුවාගේ අවශ්‍යතාවයට හා වේගයට ගැලපෙන පරිදි පාඩම් සැලසුම් කර, දුර්වලතා ඉලක්ක කරගෙන
                අමතර සහාය ලබා දේ.
              </p>
              <span className="format-tag">කාලය එකඟ කර ගත හැක</span>
            </Reveal>

            <Reveal delay={160} className="format-card">
              <span className="format-icon">
                <Icon name="clipboard" size={22} />
              </span>
              <h3>වාර පරීක්ෂණ පුහුණුව</h3>
              <p>
                පාසල් වාර පරීක්ෂණ හා පසුගිය O/L ප්‍රශ්න පත්‍ර අභ්‍යාස කරමින්, විභාගයේ ව්‍යුහය හා
                කාලය කළමනාකරණය පුහුණු කෙරේ.
              </p>
              <span className="format-tag">ප්‍රශ්න පත්‍ර අඩවියෙන් නොමිලේ</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container notice-strip">
          <div className="notice-strip-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              විශේෂ දැනුම්දීම
            </span>
            <h2 className="section-title">
              2027 නව අධ්‍යාපන <span className="gold-text">ප්‍රතිසංස්කරණය</span>
            </h2>
            <p className="section-sub">
              6 ශ්‍රේණිය සමාජ අධ්‍යයනය (ඉතිහාසය, භූගෝල විද්‍යාව, පුරවැසි අධ්‍යාපනය) සඳහා නව පන්ති
              ආරම්භ වේ. පාසල් විෂය නිර්දේශයට සමපාතව, අතිරේක සටහන් සමඟ.
            </p>
          </div>
          <div className="notice-strip-actions">
            <a className="btn btn--gold btn--lg" href={`tel:${PHONES[0].tel}`}>
              <Icon name="phone" size={18} />
              {PHONES[0].display}
            </a>
            <a className="btn btn--outline btn--lg" href={whatsappLink()} target="_blank" rel="noreferrer">
              <Icon name="chat" size={18} />
              WhatsApp විමසන්න
            </a>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
