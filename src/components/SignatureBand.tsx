import { Icon } from './Icons';
import { BRAND, MEDIA } from '../data/site';

export default function SignatureBand() {
  return (
    <section className="sig-band" aria-label="හිතට වදින HISTORY ලාංඡනය හා තේමා පාඨය">
      <span className="sig-blob sig-blob--a" aria-hidden="true" />
      <span className="sig-blob sig-blob--b" aria-hidden="true" />

      <div className="container sig-inner">
        <div className="sig-emblem">
          <img
            src={MEDIA.emblem}
            alt="හිතට වදින HISTORY — හර්ෂණ නල්ලපෙරුම, අභිමානවන්ත දේශයක සාඩම්බර උරුමය"
            loading="eager"
          />
        </div>

        <div className="sig-copy">
          <span className="sig-kicker">
            <Icon name="sparkle" size={13} />
            හිතට වදින HISTORY
          </span>
          <h2 className="sig-title">
            අභිමානවන්ත දේශයක <span className="gold-text">සාඩම්බර උරුමය</span>
          </h2>
          <p className="sig-sub">
            ඉතිහාසයේ සිරි අසිරි කියා දෙන {BRAND.name} · {BRAND.role}
          </p>

          <div className="sig-marks">
            <span>
              <Icon name="shield" size={15} />
              {BRAND.experience} ඉගැන්වීම් අත්දැකීම
            </span>
            <span>
              <Icon name="users" size={15} />
              කුඩා කණ්ඩායම් පන්ති
            </span>
            <span>
              <Icon name="download" size={15} />
              නොමිලේ ප්‍රශ්න පත්‍ර
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
