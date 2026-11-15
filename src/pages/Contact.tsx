import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import CtaBand from '../components/CtaBand';
import Community from '../components/Community';
import { Icon } from '../components/Icons';
import { BRAND, CENTERS, FAQS, PHONES, whatsappLink } from '../data/site';

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="සම්බන්ධ වන්න"
        title={
          <>
            ඔබේ ආසනය <span className="gold-text">අදම වෙන්කරවා ගන්න</span>
          </>
        }
        sub="පන්ති වේලාවන්, ගාස්තු හා ලියාපදිංචිය පිළිබඳ ඕනෑම විස්තරයක් සඳහා අමතන්න. WhatsApp හරහා ද විමසිය හැක."
      />

      <section className="section">
        <div className="container">
          <div className="contact-cards">
            {PHONES.map((phone, index) => (
              <Reveal key={phone.tel} delay={index * 70} className="contact-card">
                <span className="contact-icon">
                  <Icon name="phone" size={20} />
                </span>
                <span className="contact-label">අමතන්න</span>
                <a className="contact-value" href={`tel:${phone.tel}`}>
                  {phone.display}
                </a>
                <a className="contact-action" href={`tel:${phone.tel}`}>
                  ඇමතුමක් ගන්න
                  <Icon name="arrowRight" size={15} />
                </a>
              </Reveal>
            ))}

            <Reveal delay={210} className="contact-card contact-card--whatsapp">
              <span className="contact-icon">
                <Icon name="chat" size={20} />
              </span>
              <span className="contact-label">WhatsApp</span>
              <a className="contact-value" href={whatsappLink()} target="_blank" rel="noreferrer">
                {PHONES[0].display}
              </a>
              <a
                className="contact-action"
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
              >
                පණිවිඩයක් යවන්න
                <Icon name="arrowRight" size={15} />
              </a>
            </Reveal>
          </div>

          <div className="contact-details">
            <Reveal className="contact-panel">
              <h2 className="section-title">
                පන්ති <span className="gold-text">මධ්‍යස්ථාන</span>
              </h2>
              <ul className="venue-list">
                {CENTERS.map((center) => (
                  <li key={center.id}>
                    <span className="venue-pin">
                      <Icon name="mapPin" size={16} />
                    </span>
                    <span className="venue-body">
                      <strong>
                        {center.name} <span>· {center.city}</span>
                      </strong>
                      <small>{center.days}</small>
                      {center.phone ? <small className="venue-phone">{center.phone}</small> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={80} className="contact-panel contact-panel--tint">
              <h2 className="section-title">
                පන්තිය ගැන <span className="gold-text">කෙටියෙන්</span>
              </h2>
              <ul className="detail-list">
                <li>
                  <Icon name="book" size={17} />
                  <span>
                    <strong>විෂය</strong>
                    ඉතිහාසය · සමාජ අධ්‍යයනය
                  </span>
                </li>
                <li>
                  <Icon name="layers" size={17} />
                  <span>
                    <strong>ශ්‍රේණි</strong>
                    6 සිට 11 දක්වා (සාමාන්‍යපෙල)
                  </span>
                </li>
                <li>
                  <Icon name="users" size={17} />
                  <span>
                    <strong>මාධ්‍යය</strong>
                    {BRAND.medium}
                  </span>
                </li>
                <li>
                  <Icon name="calendar" size={17} />
                  <span>
                    <strong>ආරම්භය</strong>
                    {BRAND.startDate}
                  </span>
                </li>
                <li>
                  <Icon name="fileText" size={17} />
                  <span>
                    <strong>ප්‍රශ්න පත්‍ර</strong>
                    ප්‍රශ්න පත්‍ර නොමිලේ බාගත හැක
                  </span>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container faq-wrap">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                ප්‍රශ්න හා පිළිතුරු
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="section-title">
                ඔබට ඇති <span className="gold-text">ප්‍රශ්න</span>
              </h2>
            </Reveal>
          </div>

          <div className="faq">
            {FAQS.map((item, index) => (
              <Reveal key={item.q} delay={index * 50}>
                <details className="faq-item">
                  <summary>
                    <span>{item.q}</span>
                    <span className="faq-plus">
                      <Icon name="x" size={16} />
                    </span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Community />

      <CtaBand />
    </>
  );
}
