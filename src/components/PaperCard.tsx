import { Icon } from './Icons';
import { TERMS, TYPES, downloadHref } from '../lib/api';
import type { Paper } from '../lib/api';

export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="paper-card">
      <div className="paper-top">
        <span className="chip chip--type">{TYPES[paper.type] || 'Paper'}</span>
        <span className="chip chip--grade">{paper.grade} ශ්‍රේණිය</span>
      </div>

      <h3 className="paper-title">{paper.title}</h3>

      <div className="paper-meta">
        <span>
          <Icon name="calendar" size={14} />
          {paper.year}
        </span>
        <span>
          <Icon name="fileText" size={14} />
          {TERMS[paper.term] || 'Paper'}
        </span>
        {paper.school ? (
          <span>
            <Icon name="mapPin" size={14} />
            {paper.school}
          </span>
        ) : null}
      </div>

      <div className="paper-actions">
        <a className="btn btn--outline btn--sm" href={paper.link} target="_blank" rel="noreferrer">
          <Icon name="eye" size={15} />
          Preview
        </a>
        <a
          className="btn btn--dark btn--sm"
          href={downloadHref(paper)}
          {...(paper.hasFile ? {} : { target: '_blank', rel: 'noreferrer' })}
        >
          <Icon name="download" size={15} />
          Download 
        </a>
      </div>

      {paper.isSample ? <span className="paper-sample">Example</span> : null}
    </article>
  );
}
