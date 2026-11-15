import type { ReactNode } from 'react';
import { MandalaRing } from './Ornaments';

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  aside?: ReactNode;
};

export default function PageHero({ eyebrow, title, sub, aside }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-bg" aria-hidden="true">
        <MandalaRing className="page-hero-ring" />
      </div>
      <div className="container page-hero-inner">
        <div className="page-hero-copy">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow-dot" />
            {eyebrow}
          </span>
          <h1 className="page-title">{title}</h1>
          {sub ? <p className="page-sub">{sub}</p> : null}
        </div>
        {aside ? <div className="page-hero-aside">{aside}</div> : null}
      </div>
    </section>
  );
}
