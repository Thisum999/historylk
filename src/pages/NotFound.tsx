import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container notfound-inner">
        <span className="notfound-code">404</span>
        <h1>මෙම පිටුව හමු නොවීය</h1>
        <p>ඔබ සොයන පිටුව ඉවත් කර ඇත හෝ ලිපිනය වැරදිය.</p>
        <Link to="/" className="btn btn--gold">
          මුල් පිටුවට යන්න
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </section>
  );
}
