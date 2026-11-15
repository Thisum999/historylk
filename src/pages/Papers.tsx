import { useEffect, useMemo, useState } from 'react';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import PaperCard from '../components/PaperCard';
import CtaBand from '../components/CtaBand';
import { Icon } from '../components/Icons';
import { getPapers, TERMS, TYPES } from '../lib/api';
import type { Paper } from '../lib/api';

const GRADES = ['all', '6', '7', '8', '9', '10', '11'];

export default function Papers() {
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState('all');
  const [year, setYear] = useState('all');
  const [term, setTerm] = useState('all');
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    getPapers()
      .then((list) => {
        if (active) setPapers(list);
      })
      .catch(() => {
        if (active) {
          setPapers([]);
          setError('පත්‍රිකා ලබාගැනීමේදී දෝෂයක් සිදු විය. මොහොතකින් නැවත උත්සාහ කරන්න.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const years = useMemo(() => {
    const list = Array.from(new Set((papers || []).map((paper) => paper.year)));
    return list.sort((a, b) => b - a);
  }, [papers]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return (papers || []).filter((paper) => {
      if (grade !== 'all' && paper.grade !== Number(grade)) return false;
      if (year !== 'all' && paper.year !== Number(year)) return false;
      if (term !== 'all' && paper.term !== term) return false;
      if (type !== 'all' && paper.type !== type) return false;
      if (text) {
        const haystack = `${paper.title} ${paper.school} ${paper.year}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [papers, grade, year, term, type, query]);

  const hasSample = (papers || []).some((paper) => paper.isSample);
  const hasFilters = grade !== 'all' || year !== 'all' || term !== 'all' || type !== 'all' || query !== '';

  const reset = () => {
    setGrade('all');
    setYear('all');
    setTerm('all');
    setType('all');
    setQuery('');
  };

  return (
    <>
      <PageHero
        eyebrow="පත්‍රිකා එකතුව · නොමිලේ"
        title={
          <>
            පාසල් වාර පරීක්ෂණ <span className="gold-text">ප්‍රශ්න පත්‍ර</span>
          </>
        }
        sub="පන්තියට එන නොඑන සියලු දෙනාට නොමිලේ බාගත කරගත හැක. ලියාපදිංචියක් අවශ්‍ය නොවේ."
        aside={
          <div className="hero-aside-card hero-aside-card--papers">
            <span className="hero-aside-kicker">පත්‍රිකා එකතුව</span>
            <strong>{papers === null ? '—' : papers.length}</strong>
            <span className="hero-aside-note">ප්‍රශ්න පත්‍ර · පිළිතුරු · සටහන්</span>
          </div>
        }
      />

      <section className="section papers-section">
        <div className="container">
          <div className="papers-toolbar">
            <div className="filter filter--search">
              <span className="filter-label">සොයන්න</span>
              <div className="search-field">
                <Icon name="search" size={16} />
                <input
                  type="search"
                  value={query}
                  placeholder="පත්‍රිකාවේ නම හෝ පාසල..."
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="පත්‍රිකා සොයන්න"
                />
              </div>
            </div>

            <div className="filter">
              <span className="filter-label">ශ්‍රේණිය</span>
              <div className="chip-row">
                {GRADES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`filter-chip ${grade === value ? 'is-active' : ''}`}
                    onClick={() => setGrade(value)}
                  >
                    {value === 'all' ? 'සියල්ල' : `${value}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter">
              <span className="filter-label">වර්ෂය</span>
              <select className="select" value={year} onChange={(event) => setYear(event.target.value)}>
                <option value="all">සියලු වර්ෂ</option>
                {years.map((value) => (
                  <option key={value} value={String(value)}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <span className="filter-label">වාරය</span>
              <select className="select" value={term} onChange={(event) => setTerm(event.target.value)}>
                <option value="all">සියලු වාර</option>
                {Object.entries(TERMS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <span className="filter-label">වර්ගය</span>
              <select className="select" value={type} onChange={(event) => setType(event.target.value)}>
                <option value="all">සියල්ල</option>
                {Object.entries(TYPES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="papers-summary">
            <span>
              <strong>{papers === null ? '...' : filtered.length}</strong> පත්‍රිකා හමු විය
            </span>
            {hasFilters ? (
              <button type="button" className="text-button" onClick={reset}>
                <Icon name="x" size={14} />
                පෙරහන් ඉවත් කරන්න
              </button>
            ) : null}
          </div>

          {hasSample ? (
            <p className="sample-note">
              <Icon name="info" size={16} />
              මෙහි පෙන්වන සමහර පත්‍රිකා නිදර්ශන පමණි. පරිපාලක පැනලයෙන් ඒවා ඉවත් කර ඔබේ පත්‍රිකා එකතු කරන්න.
            </p>
          ) : null}

          {error ? (
            <div className="papers-empty">
              <Icon name="info" size={28} />
              <h3>දෝෂයක්</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {papers === null ? (
            <div className="paper-grid">
              <div className="paper-skeleton" />
              <div className="paper-skeleton" />
              <div className="paper-skeleton" />
              <div className="paper-skeleton" />
              <div className="paper-skeleton" />
              <div className="paper-skeleton" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="paper-grid">
              {filtered.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : papers.length > 0 ? (
            <div className="papers-empty">
              <Icon name="search" size={28} />
              <h3>ගැලපෙන පත්‍රිකා නැත</h3>
              <p>ඔබ තෝරාගත් පෙරහන් වෙනස් කර නැවත උත්සාහ කරන්න.</p>
              <button type="button" className="btn btn--gold" onClick={reset}>
                සියලු පත්‍රිකා බලන්න
              </button>
            </div>
          ) : (
            <div className="papers-empty">
              <Icon name="fileText" size={28} />
              <h3>පත්‍රිකා ඉක්මනින්</h3>
              <p>අලුත් පාසල් වාර ප්‍රශ්න පත්‍ර ඉක්මනින් මෙහි එකතු වේ.</p>
            </div>
          )}

          <Reveal className="papers-help">
            <div>
              <h3>ඔබේ පාසලේ ප්‍රශ්න පත්‍රයක් එවන්න</h3>
              <p>ඔබගේ පාසලේ වාර පරීක්ෂණ ප්‍රශ්න පත්‍රයක් මෙහි එකතු කිරීමට අවශ්‍ය නම් අපට එවන්න.</p>
            </div>
            <a className="btn btn--outline" href="/contact">
              සම්බන්ධ වන්න
              <Icon name="arrowRight" size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
