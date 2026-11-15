import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { MEDIA } from '../data/site';
import {
  ApiError,
  changePassword,
  createAdmin,
  createPaper,
  deleteAdmin,
  errorMessage,
  getAdmins,
  getPapers,
  getSession,
  login,
  logout,
  registerAdmin,
  removePaper,
  STATUS_LABELS,
  TERMS,
  TYPES,
  updateAdmin,
} from '../lib/api';
import type { AdminStatus, AdminUser, Paper } from '../lib/api';

type Status = { kind: 'ok' | 'error'; text: string } | null;
type Tab = 'overview' | 'papers' | 'new' | 'admins' | 'account';
type AuthMode = 'login' | 'register';

const GRADE_OPTIONS = ['6', '7', '8', '9', '10', '11'];

const SORTS = {
  new: 'අලුත්ම මුලින්',
  old: 'පැරණිම මුලින්',
  grade: 'ශ්‍රේණිය අනුව',
  title: 'නම අනුව',
} as const;

type SortKey = keyof typeof SORTS;

const errorCode = (error: unknown) => (error instanceof ApiError ? error.code : 'request_failed');

export default function Admin() {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<AdminUser | null>(null);

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regStatus, setRegStatus] = useState<Status>(null);
  const [registering, setRegistering] = useState(false);

  const [tab, setTab] = useState<Tab>('overview');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('11');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [term, setTerm] = useState('first');
  const [type, setType] = useState('paper');
  const [school, setSchool] = useState('');
  const [mode, setMode] = useState<'pdf' | 'drive'>('pdf');
  const [driveUrl, setDriveUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('new');
  const [copied, setCopied] = useState<string | null>(null);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminBusy, setAdminBusy] = useState<string | null>(null);
  const [edit, setEdit] = useState<{
    id: string;
    name: string;
    username: string;
    password: string;
    status: AdminStatus;
  } | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', username: '', password: '' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);

  const isOwner = session?.role === 'owner';

  const loadPapers = useCallback(async () => {
    setLoadingPapers(true);
    try {
      setPapers(await getPapers());
    } catch {
      setStatus({ kind: 'error', text: 'ප්‍රශ්න පත්‍ර ලබාගැනීමේදී දෝෂයක් සිදු විය.' });
    } finally {
      setLoadingPapers(false);
    }
  }, []);

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      setAdmins(await getAdmins());
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(errorCode(error)) });
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getSession()
      .then((info) => {
        if (!active) return;
        setSession(info.admin);
        if (info.authenticated) {
          loadPapers();
          if (info.admin?.role === 'owner') loadAdmins();
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [loadPapers, loadAdmins]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const admin = await login(username.trim(), password);
      setSession(admin);
      setPassword('');
      await loadPapers();
      if (admin?.role === 'owner') await loadAdmins();
    } catch (error) {
      setLoginError(errorMessage(errorCode(error)));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setRegStatus(null);
    if (regPassword !== regConfirm) {
      setRegStatus({ kind: 'error', text: 'මුරපද දෙක සමාන නොවේ.' });
      return;
    }
    setRegistering(true);
    try {
      await registerAdmin({
        name: regName.trim(),
        username: regUsername.trim(),
        password: regPassword,
      });
      setRegStatus({
        kind: 'ok',
        text: 'ඔබේ ඉල්ලුම යවන ලදී. ප්‍රධාන පරිපාලක අනුමත කළ පසු ඔබට පිවිසිය හැක.',
      });
      setUsername(regUsername.trim());
      setRegName('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirm('');
    } catch (error) {
      setRegStatus({ kind: 'error', text: errorMessage(errorCode(error)) });
    } finally {
      setRegistering(false);
    }
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    setSession(null);
    setPapers([]);
    setAdmins([]);
    setTab('overview');
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files && event.target.files[0];
    setFile(selected || null);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files && event.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (title.trim().length < 3) {
      setStatus({ kind: 'error', text: errorMessage('title_required') });
      return;
    }
    if (mode === 'pdf' && !file) {
      setStatus({ kind: 'error', text: 'PDF ගොනුවක් තෝරන්න.' });
      return;
    }
    if (mode === 'drive' && !/^https?:\/\//i.test(driveUrl.trim())) {
      setStatus({ kind: 'error', text: errorMessage('link_required') });
      return;
    }

    const form = new FormData();
    form.set('title', title.trim());
    form.set('grade', grade);
    form.set('year', year);
    form.set('term', term);
    form.set('type', type);
    form.set('school', school.trim());
    form.set('medium', 'Sinhala');
    if (mode === 'pdf' && file) form.set('file', file);
    if (mode === 'drive') form.set('driveUrl', driveUrl.trim());

    setSaving(true);
    try {
      await createPaper(form);
      setStatus({ kind: 'ok', text: 'paper added successfully.' });
      setTitle('');
      setSchool('');
      setDriveUrl('');
      setFile(null);
      const input = document.getElementById('paper-file') as HTMLInputElement | null;
      if (input) input.value = '';
      await loadPapers();
    } catch (error) {
      const code = errorCode(error);
      if (code === 'unauthorized') setSession(null);
      setStatus({ kind: 'error', text: errorMessage(code) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paper: Paper) => {
    if (!window.confirm(`"${paper.title}" Deleth the paper?`)) return;
    setDeleting(paper.id);
    setStatus(null);
    try {
      await removePaper(paper.id);
      setStatus({ kind: 'ok', text: 'Paper deleted successfully.' });
      await loadPapers();
    } catch {
      setStatus({ kind: 'error', text: 'ඉවත් කිරීමේදී දෝෂයක් සිදු විය.' });
    } finally {
      setDeleting(null);
    }
  };

  const paperUrl = (paper: Paper) =>
    paper.link.startsWith('http') ? paper.link : `${window.location.origin}${paper.link}`;

  const copyLink = async (paper: Paper) => {
    try {
      await navigator.clipboard.writeText(paperUrl(paper));
      setCopied(paper.id);
      window.setTimeout(() => setCopied((current) => (current === paper.id ? null : current)), 1800);
    } catch {
      setStatus({ kind: 'error', text: 'සබැඳිය පිටපත් කළ නොහැක. බ්‍රව්සරය අවසර දෙන්නේ දැයි බලන්න.' });
    }
  };

  const handleAdminAction = async (
    id: string,
    action: () => Promise<void>,
    okText: string,
  ) => {
    setAdminBusy(id);
    setStatus(null);
    try {
      await action();
      setStatus({ kind: 'ok', text: okText });
      await loadAdmins();
      setEdit(null);
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(errorCode(error)) });
    } finally {
      setAdminBusy(null);
    }
  };

  const handleCreateAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setAdminBusy('new');
    setStatus(null);
    try {
      await createAdmin({
        name: newAdmin.name.trim(),
        username: newAdmin.username.trim(),
        password: newAdmin.password,
      });
      setStatus({ kind: 'ok', text: 'නව පරිපාලක ගිණුම සාදන ලදී.' });
      setNewAdmin({ name: '', username: '', password: '' });
      await loadAdmins();
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(errorCode(error)) });
    } finally {
      setAdminBusy(null);
    }
  };

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordStatus(null);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatus({ kind: 'ok', text: 'මුරපදය සාර්ථකව වෙනස් විය.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setPasswordStatus({ kind: 'error', text: errorMessage(errorCode(error)) });
    }
  };

  if (checking) {
    return (
      <section className="admin admin--center">
        <div className="admin-loader">
          <span className="spinner" />
          <p>පරික්ෂා කරමින්...</p>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="admin admin--center">
        <div className="login-shell">
          <div className="login-art">
            <img className="login-art-logo" src={MEDIA.emblem} alt="හිතට වදින HISTORY" />
            <h2>
              හිතට වදින <span className="gold-text">HISTORY</span>
            </h2>
            <p>පන්තියේ සියලු ප්‍රශ්න පත්‍ර, පරිපාලකයන් හා දැනුම්දීම් එකම තැනකින්.</p>
            <ul className="login-art-list">
              <li>
                <Icon name="upload" size={16} />
                PDF උඩුගත කිරීම
              </li>
              <li>
                <Icon name="users" size={16} />
                පරිපාලක ගිණුම් හා අනුමැතිය
              </li>
              <li>
                <Icon name="shield" size={16} />
                සුරක්ෂිත පිවිසුම
              </li>
            </ul>
            <span className="login-art-seal">HN</span>
          </div>

          <div className="login-card">
            <div className="auth-tabs" role="tablist" aria-label="පිවිසුම හෝ ලියාපදිංචිය">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                className={`auth-tab ${authMode === 'login' ? 'is-active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                පිවිසෙන්න
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'register'}
                className={`auth-tab ${authMode === 'register' ? 'is-active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                ලියාපදිංචි ඉල්ලුම
              </button>
            </div>

            {authMode === 'login' ? (
              <>
                <div className="login-head">
                  <span className="login-kicker">HISTORY · පරිපාලක</span>
                  <h1>පරිපාලක පිවිසුම</h1>
                  <p>පත්‍රිකා එකතු කිරීමට හා කළමනාකරණයට පිවිසෙන්න.</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                  <label className="field">
                    <span className="field-label">පරිශීලක නාමය</span>
                    <div className="field-input">
                      <Icon name="users" size={16} />
                      <input
                        type="text"
                        value={username}
                        autoComplete="username"
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="username"
                        required
                      />
                    </div>
                  </label>

                  <label className="field">
                    <span className="field-label">මුරපදය</span>
                    <div className="field-input">
                      <Icon name="lock" size={16} />
                      <input
                        type="password"
                        value={password}
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••"
                        required
                      />
                    </div>
                  </label>

                  {loginError ? (
                    <p className="form-error">
                      <Icon name="info" size={15} />
                      {loginError}
                    </p>
                  ) : null}

                  <button type="submit" className="btn btn--gold btn--block btn--lg" disabled={loggingIn}>
                    {loggingIn ? 'login...' : 'login'}
                    <Icon name="arrowRight" size={17} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="login-head">
                  <span className="login-kicker">HISTORY · නව ගිණුම</span>
                  <h1>පරිපාලක ඉල්ලුම</h1>
                  <p>නම, පරිශීලක නාමය හා මුරපදය ඇතුළත් කර ඉල්ලුම යවන්න.</p>
                </div>

                <form className="login-form" onSubmit={handleRegister}>
                  <label className="field">
                    <span className="field-label">සම්පූර්ණ නම</span>
                    <div className="field-input">
                      <Icon name="users" size={16} />
                      <input
                        type="text"
                        value={regName}
                        onChange={(event) => setRegName(event.target.value)}
                        placeholder="උදා: කසුන් පෙරේරා"
                        required
                      />
                    </div>
                  </label>

                  <label className="field">
                    <span className="field-label">පරිශීලක නාමය</span>
                    <div className="field-input">
                      <Icon name="lock" size={16} />
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(event) => setRegUsername(event.target.value)}
                        placeholder="kasun"
                        required
                      />
                    </div>
                  </label>

                  <label className="field">
                    <span className="field-label">මුරපදය</span>
                    <div className="field-input">
                      <Icon name="lock" size={16} />
                      <input
                        type="password"
                        value={regPassword}
                        autoComplete="new-password"
                        onChange={(event) => setRegPassword(event.target.value)}
                        placeholder="අකුරු 6+"
                        required
                      />
                    </div>
                  </label>

                  <label className="field">
                    <span className="field-label">මුරපදය තහවුරු කරන්න</span>
                    <div className="field-input">
                      <Icon name="check" size={16} />
                      <input
                        type="password"
                        value={regConfirm}
                        autoComplete="new-password"
                        onChange={(event) => setRegConfirm(event.target.value)}
                        placeholder="නැවත ලියන්න"
                        required
                      />
                    </div>
                  </label>

                  {regStatus ? (
                    <p className={`form-status form-status--${regStatus.kind}`}>
                      <Icon name={regStatus.kind === 'ok' ? 'check' : 'info'} size={15} />
                      {regStatus.text}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    className="btn btn--gold btn--block btn--lg"
                    disabled={registering}
                  >
                    {registering ? 'යවමින්...' : 'ඉල්ලුම යවන්න'}
                    <Icon name="arrowRight" size={17} />
                  </button>
                </form>
              </>
            )}

            <p className="login-foot">
              <Link to="/">
                <Icon name="arrowLeft" size={14} />
                අඩවියට ආපසු
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const gradeCounts = GRADE_OPTIONS.map((value) => ({
    grade: value,
    count: papers.filter((paper) => paper.grade === Number(value)).length,
  }));
  const maxGradeCount = Math.max(1, ...gradeCounts.map((item) => item.count));
  const pdfCount = papers.filter((paper) => paper.hasFile).length;
  const driveCount = papers.length - pdfCount;
  const latestYear = papers.reduce((max, paper) => Math.max(max, paper.year), 0);
  const pendingAdmins = admins.filter((admin) => admin.status === 'pending');

  const filtered = papers
    .filter((paper) => (gradeFilter === 'all' ? true : paper.grade === Number(gradeFilter)))
    .filter((paper) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [paper.title, paper.school, String(paper.year), TERMS[paper.term] || '', TYPES[paper.type] || '']
        .join(' ')
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => {
      if (sortKey === 'old') return a.createdAt - b.createdAt;
      if (sortKey === 'grade') return b.grade - a.grade;
      if (sortKey === 'title') return a.title.localeCompare(b.title, 'si');
      return b.createdAt - a.createdAt;
    });

  const exportCsv = () => {
    const header = ['ශීර්ෂය', 'ශ්‍රේණිය', 'වර්ෂය', 'වාරය', 'වර්ගය', 'පාසල', 'සබැඳිය'];
    const rows = filtered.map((paper) => [
      paper.title,
      String(paper.grade),
      String(paper.year),
      TERMS[paper.term] || '',
      TYPES[paper.type] || '',
      paper.school || '',
      paperUrl(paper),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history-papers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus({ kind: 'ok', text: `${filtered.length} පත්‍රිකා CSV ගොනුවක් ලෙස බාගත විය.` });
  };

  const NAV: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'සාරාංශය', icon: 'grid' },
    { id: 'papers', label: 'පත්‍රිකා', icon: 'fileText' },
    { id: 'new', label: 'නව පත්‍රිකාවක්', icon: 'upload' },
    ...(isOwner
      ? [{ id: 'admins' as Tab, label: 'පරිපාලකයන්', icon: 'users', badge: pendingAdmins.length }]
      : []),
    { id: 'account', label: 'මගේ ගිණුම', icon: 'lock' },
  ];

  return (
    <section className="admin">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side-brand">
            <img src={MEDIA.emblem} alt="" />
            <div>
              <strong>HISTORY</strong>
              <span>Admin dashboard</span>
            </div>
          </div>

          <nav className="admin-side-nav" aria-label="පරිපාලක මෙනුව">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-btn ${tab === item.id ? 'is-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.badge ? <span className="admin-nav-badge">{item.badge}</span> : null}
              </button>
            ))}
          </nav>

          <div className="admin-side-foot">
            <Link to="/" className="admin-side-link">
              <Icon name="eye" size={15} />
              අඩවිය බලන්න
            </Link>
            <button type="button" className="admin-side-link" onClick={handleLogout}>
              <Icon name="logout" size={15} />
              පිටවෙන්න
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <span className="admin-kicker">
                {isOwner ? 'ප්‍රධාන පරිපාලක' : 'පරිපාලක'}
              </span>
              <h1>
                {tab === 'overview' && 'Summary'}
                {tab === 'papers' && 'Papers List'}
                {tab === 'new' && 'Add Paper'}
                {tab === 'admins' && 'Manage Admins'}
                {tab === 'account' && 'My acount'}
              </h1>
              <p className="admin-topbar-sub">
                ආයුබෝවන්, {session.name} · @{session.username}
              </p>
            </div>
            <div className="admin-topbar-actions">
              <button type="button" className="btn btn--outline btn--sm" onClick={loadPapers}>
                <Icon name="sparkle" size={15} />
                Update
              </button>
              <Link to="/papers" className="btn btn--gold btn--sm">
                <Icon name="eye" size={15} />
                Paper Page
              </Link>
            </div>
          </header>

          {status ? (
            <p className={`form-status form-status--${status.kind}`}>
              <Icon name={status.kind === 'ok' ? 'check' : 'info'} size={16} />
              {status.text}
            </p>
          ) : null}

          {tab === 'overview' ? (
            <>
              <div className="kpi-grid">
                <div className="kpi2 kpi2--rose">
                  <span className="kpi2-icon">
                    <Icon name="fileText" size={18} />
                  </span>
                  <span className="kpi2-label">මුළු පත්‍රිකා</span>
                  <strong>{papers.length}</strong>
                  <small>සියලු ශ්‍රේණි එකට</small>
                </div>
                <div className="kpi2 kpi2--emerald">
                  <span className="kpi2-icon">
                    <Icon name="download" size={18} />
                  </span>
                  <span className="kpi2-label">PDF ගොනු</span>
                  <strong>{pdfCount}</strong>
                  <small>අඩවියේම ගබඩා වී ඇත</small>
                </div>
                <div className="kpi2 kpi2--azure">
                  <span className="kpi2-icon">
                    <Icon name="external" size={18} />
                  </span>
                  <span className="kpi2-label">Drive සබැඳි</span>
                  <strong>{driveCount}</strong>
                  <small>බාහිර සබැඳි</small>
                </div>
                <div className="kpi2 kpi2--gold">
                  <span className="kpi2-icon">
                    <Icon name="calendar" size={18} />
                  </span>
                  <span className="kpi2-label">අලුත්ම වර්ෂය</span>
                  <strong>{latestYear || '—'}</strong>
                  <small>අවසන් එකතු කිරීම</small>
                </div>
              </div>

              <div className="admin-card chart-card">
                <div className="admin-card-head">
                  <h2>
                    <Icon name="trending" size={16} /> ශ්‍රේණිය අනුව පත්‍රිකා
                  </h2>
                  <span className="admin-card-note">{papers.length} පත්‍රිකා</span>
                </div>
                <div className="chart-bars">
                  {gradeCounts.map((item) => (
                    <div className="bar-col" key={item.grade}>
                      <span className="bar-count">{item.count}</span>
                      <span
                        className="bar-fill"
                        style={{ height: `${Math.max(6, (item.count / maxGradeCount) * 100)}%` }}
                      />
                      <span>{item.grade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-grid">
                <div className="admin-card">
                  <div className="admin-card-head">
                    <h2>
                      <Icon name="clock" size={16} /> අලුත්ම පත්‍රිකා
                    </h2>
                    <button type="button" className="text-button" onClick={() => setTab('papers')}>
                      සියල්ල
                      <Icon name="arrowRight" size={13} />
                    </button>
                  </div>
                  {papers.length === 0 ? (
                    <p className="admin-empty-text">තවම පත්‍රිකා නැත.</p>
                  ) : (
                    <ul className="mini-list">
                      {papers.slice(0, 5).map((paper) => (
                        <li key={paper.id}>
                          <span className="mini-chip">{paper.grade}</span>
                          <span className="mini-title">{paper.title}</span>
                          <span className="mini-meta">{paper.year}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="admin-card">
                  <div className="admin-card-head">
                    <h2>
                      <Icon name="users" size={16} /> පරිපාලක ඉල්ලුම්
                    </h2>
                    {isOwner ? (
                      <button type="button" className="text-button" onClick={() => setTab('admins')}>
                        කළමනාකරණය
                        <Icon name="arrowRight" size={13} />
                      </button>
                    ) : null}
                  </div>
                  {!isOwner ? (
                    <p className="admin-empty-text">ප්‍රධාන පරිපාලකට පමණක් මෙය දිස්වේ.</p>
                  ) : pendingAdmins.length === 0 ? (
                    <p className="admin-empty-text">අනුමැතිය බලාපොරොත්තුවෙන් ඉල්ලුම් නැත.</p>
                  ) : (
                    <ul className="pending-list">
                      {pendingAdmins.slice(0, 4).map((admin) => (
                        <li key={admin.id}>
                          <span className="pending-avatar">{admin.name.slice(0, 1).toUpperCase()}</span>
                          <span className="pending-body">
                            <strong>{admin.name}</strong>
                            <small>@{admin.username}</small>
                          </span>
                          <button
                            type="button"
                            className="btn btn--emerald btn--sm"
                            disabled={adminBusy === admin.id}
                            onClick={() =>
                              handleAdminAction(
                                admin.id,
                                () => updateAdmin(admin.id, { status: 'approved' }),
                                `${admin.name} අනුමත කරන ලදී.`,
                              )
                            }
                          >
                            අනුමත
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {tab === 'papers' ? (
            <div className="admin-card">
              <div className="admin-card-head">
                <h2>
                  <Icon name="fileText" size={16} /> {filtered.length} / {papers.length} පත්‍රිකා
                </h2>
                <button type="button" className="text-button" onClick={loadPapers} disabled={loadingPapers}>
                  <Icon name="sparkle" size={13} />
                  {loadingPapers ? 'යාවත්කාලීන වෙමින්...' : 'යාවත්කාලීන'}
                </button>
              </div>

              <div className="admin-toolbar">
                <label className="admin-search">
                  <Icon name="search" size={15} />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ශීර්ෂය, පාසල, වර්ෂය අනුව සොයන්න"
                    aria-label="ප්‍රශ්න පත්‍ර සොයන්න"
                  />
                  {query ? (
                    <button
                      type="button"
                      className="admin-search-clear"
                      onClick={() => setQuery('')}
                      aria-label="සෙවුම හිස් කරන්න"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  ) : null}
                </label>

                <select
                  className="select select--sm"
                  value={gradeFilter}
                  onChange={(event) => setGradeFilter(event.target.value)}
                  aria-label="ශ්‍රේණිය අනුව පෙරහන"
                >
                  <option value="all">සියලු ශ්‍රේණි</option>
                  {GRADE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value} ශ්‍රේණිය
                    </option>
                  ))}
                </select>

                <select
                  className="select select--sm"
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  aria-label="පිළිවෙළ"
                >
                  {Object.entries(SORTS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={exportCsv}
                  disabled={filtered.length === 0}
                >
                  <Icon name="download" size={15} />
                  CSV
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="admin-empty">
                  <Icon name={papers.length === 0 ? 'fileText' : 'search'} size={26} />
                  <p>
                    {papers.length === 0
                      ? 'තවම පත්‍රිකා නැත. "නව පත්‍රිකාවක්" පිටුවෙන් එකතු කරන්න.'
                      : 'මෙම සෙවුමට ගැලපෙන papers නැත.'}
                  </p>
                </div>
              ) : (
                <ul className="admin-items">
                  {filtered.map((paper) => (
                    <li key={paper.id} className="admin-item">
                      <div className="admin-item-main">
                        <div className="admin-item-top">
                          <span className="chip chip--grade">{paper.grade} ශ්‍රේණිය</span>
                          <span className="chip chip--type">{TYPES[paper.type] || 'පත්‍රිකාව'}</span>
                          {paper.isSample ? <span className="chip chip--sample">නිදර්ශන</span> : null}
                        </div>
                        <strong className="admin-item-title">{paper.title}</strong>
                        <div className="admin-item-meta">
                          {paper.year} · {TERMS[paper.term]} · {paper.hasFile ? 'PDF ගොනුව' : 'Drive සබැඳිය'}
                          {paper.school ? ` · ${paper.school}` : ''}
                        </div>
                      </div>
                      <div className="admin-item-actions">
                        <button
                          type="button"
                          className={`icon-button ${copied === paper.id ? 'icon-button--ok' : ''}`}
                          onClick={() => copyLink(paper)}
                          aria-label="සබැඳිය පිටපත් කරන්න"
                          title={copied === paper.id ? 'පිටපත් විය' : 'සබැඳිය පිටපත් කරන්න'}
                        >
                          <Icon name={copied === paper.id ? 'check' : 'copy'} size={16} />
                        </button>
                        <a
                          className="icon-button"
                          href={paper.link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="පත්‍රිකාව බලන්න"
                        >
                          <Icon name="eye" size={16} />
                        </a>
                        <button
                          type="button"
                          className="icon-button icon-button--danger"
                          onClick={() => handleDelete(paper)}
                          disabled={deleting === paper.id}
                          aria-label="පත්‍රිකාව ඉවත් කරන්න"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {tab === 'new' ? (
            <form className="admin-card admin-form" onSubmit={handleSubmit}>
              <div className="admin-card-head">
                <h2>
                  <Icon name="upload" size={16} /> නව පත්‍රිකාවක් එකතු කරන්න
                </h2>
              </div>
              <p className="admin-form-note">PDF ගොනුවක් උඩුගත කරන්න හෝ Google Drive සබැඳියක් ලබා දෙන්න.</p>

              <label className="field">
                <span className="field-label">පත්‍රිකාවේ ශීර්ෂය *</span>
                <div className="field-input">
                  <Icon name="fileText" size={16} />
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="උදා: 11 ශ්‍රේණිය – පළමු වාර පරීක්ෂණය (ඉතිහාසය)"
                    required
                  />
                </div>
              </label>

              <div className="field-row">
                <label className="field">
                  <span className="field-label">ශ්‍රේණිය</span>
                  <select className="select" value={grade} onChange={(event) => setGrade(event.target.value)}>
                    {GRADE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value} ශ්‍රේණිය
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">වර්ෂය</span>
                  <div className="field-input">
                    <Icon name="calendar" size={16} />
                    <input
                      type="number"
                      min={2010}
                      max={2100}
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="field-label">වාරය</span>
                  <select className="select" value={term} onChange={(event) => setTerm(event.target.value)}>
                    {Object.entries(TERMS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">වර්ගය</span>
                  <select className="select" value={type} onChange={(event) => setType(event.target.value)}>
                    {Object.entries(TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span className="field-label">පාසල (විකල්ප)</span>
                <div className="field-input">
                  <Icon name="mapPin" size={16} />
                  <input
                    type="text"
                    value={school}
                    onChange={(event) => setSchool(event.target.value)}
                    placeholder="උදා: ගාල්ල මහින්ද විද්‍යාලය"
                  />
                </div>
              </label>

              <div className="mode-switch" role="group" aria-label="සබැඳි ක්‍රමය">
                <button
                  type="button"
                  className={`mode-option ${mode === 'pdf' ? 'is-active' : ''}`}
                  onClick={() => setMode('pdf')}
                >
                  <Icon name="upload" size={16} />
                  PDF ගොනුවක්
                </button>
                <button
                  type="button"
                  className={`mode-option ${mode === 'drive' ? 'is-active' : ''}`}
                  onClick={() => setMode('drive')}
                >
                  <Icon name="external" size={16} />
                  Google Drive සබැඳිය
                </button>
              </div>

              {mode === 'pdf' ? (
                <label
                  className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <input
                    id="paper-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={onFileChange}
                    className="dropzone-input"
                  />
                  <span className="dropzone-icon">
                    <Icon name={file ? 'check' : 'upload'} size={22} />
                  </span>
                  {file ? (
                    <>
                      <strong>{file.name}</strong>
                      <small>{(file.size / (1024 * 1024)).toFixed(2)} MB · PDF</small>
                    </>
                  ) : (
                    <>
                      <strong>PDF ගොනුව මෙහි ඇද දමන්න</strong>
                      <small>හෝ ක්ලික් කර තෝරන්න · උපරිම 15MB</small>
                    </>
                  )}
                </label>
              ) : (
                <label className="field">
                  <span className="field-label">Google Drive සබැඳිය *</span>
                  <div className="field-input">
                    <Icon name="external" size={16} />
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(event) => setDriveUrl(event.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                    />
                  </div>
                </label>
              )}

              <button type="submit" className="btn btn--gold btn--block btn--lg" disabled={saving}>
                {saving ? 'සුරකිමින්...' : 'පත්‍රිකාව එකතු කරන්න'}
                <Icon name="check" size={17} />
              </button>
            </form>
          ) : null}

          {tab === 'admins' && isOwner ? (
            <>
              <div className="admin-card">
                <div className="admin-card-head">
                  <h2>
                    <Icon name="bell" size={16} /> අනුමැතිය බලාපොරොත්තුවෙන් ({pendingAdmins.length})
                  </h2>
                  <button type="button" className="text-button" onClick={loadAdmins} disabled={loadingAdmins}>
                    <Icon name="sparkle" size={13} />
                    යාවත්කාලීන
                  </button>
                </div>

                {pendingAdmins.length === 0 ? (
                  <p className="admin-empty-text">අලුත් ඉල්ලුම් නැත.</p>
                ) : (
                  <ul className="pending-list">
                    {pendingAdmins.map((admin) => (
                      <li key={admin.id}>
                        <span className="pending-avatar">{admin.name.slice(0, 1).toUpperCase()}</span>
                        <span className="pending-body">
                          <strong>{admin.name}</strong>
                          <small>@{admin.username}</small>
                        </span>
                        <span className="pending-actions">
                          <button
                            type="button"
                            className="btn btn--emerald btn--sm"
                            disabled={adminBusy === admin.id}
                            onClick={() =>
                              handleAdminAction(
                                admin.id,
                                () => updateAdmin(admin.id, { status: 'approved' }),
                                `${admin.name} අනුමත කරන ලදී.`,
                              )
                            }
                          >
                            අනුමත
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            disabled={adminBusy === admin.id}
                            onClick={() =>
                              handleAdminAction(
                                admin.id,
                                () => updateAdmin(admin.id, { status: 'rejected' }),
                                `${admin.name} ප්‍රතික්ෂේප කරන ලදී.`,
                              )
                            }
                          >
                            ප්‍රතික්ෂේප
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="admin-card">
                <div className="admin-card-head">
                  <h2>
                    <Icon name="users" size={16} /> සියලු පරිපාලකයන් ({admins.length})
                  </h2>
                </div>

                <div className="admin-table">
                  {admins.map((admin) => {
                    const editing = edit?.id === admin.id;
                    return (
                      <div className={`admin-row ${editing ? 'is-editing' : ''}`} key={admin.id}>
                        {editing && edit ? (
                          <div className="admin-edit-grid">
                            <label className="field">
                              <span className="field-label">නම</span>
                              <div className="field-input">
                                <input
                                  value={edit.name}
                                  onChange={(event) => setEdit({ ...edit, name: event.target.value })}
                                />
                              </div>
                            </label>
                            <label className="field">
                              <span className="field-label">පරිශීලක නාමය</span>
                              <div className="field-input">
                                <input
                                  value={edit.username}
                                  onChange={(event) => setEdit({ ...edit, username: event.target.value })}
                                />
                              </div>
                            </label>
                            <label className="field">
                              <span className="field-label">නව මුරපදය (හිස් නම් නොවෙනස්)</span>
                              <div className="field-input">
                                <input
                                  type="password"
                                  value={edit.password}
                                  autoComplete="new-password"
                                  onChange={(event) => setEdit({ ...edit, password: event.target.value })}
                                  placeholder="••••••"
                                />
                              </div>
                            </label>
                            <label className="field">
                              <span className="field-label">තත්ත්වය</span>
                              <select
                                className="select"
                                value={edit.status}
                                onChange={(event) =>
                                  setEdit({ ...edit, status: event.target.value as AdminStatus })
                                }
                              >
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="admin-edit-actions">
                              <button
                                type="button"
                                className="btn btn--gold btn--sm"
                                disabled={adminBusy === admin.id}
                                onClick={() =>
                                  handleAdminAction(
                                    admin.id,
                                    () =>
                                      updateAdmin(admin.id, {
                                        name: edit.name.trim(),
                                        username: edit.username.trim(),
                                        status: edit.status,
                                        ...(edit.password ? { password: edit.password } : {}),
                                      }),
                                    'පරිපාලක ගිණුම යාවත්කාලීන විය.',
                                  )
                                }
                              >
                                <Icon name="check" size={15} />
                                සුරකින්න
                              </button>
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() => setEdit(null)}
                              >
                                අවලංගු
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="admin-row-avatar">{admin.name.slice(0, 1).toUpperCase()}</span>
                            <span className="admin-row-body">
                              <strong>
                                {admin.name}
                                {admin.role === 'owner' ? (
                                  <span className="chip chip--owner">මුල් පරිපාලක</span>
                                ) : null}
                              </strong>
                              <small>@{admin.username}</small>
                            </span>
                            <span className={`chip chip--status chip--${admin.status}`}>
                              {STATUS_LABELS[admin.status]}
                            </span>
                            <span className="admin-row-actions">
                              {admin.role === 'owner' ? (
                                <span className="admin-row-lock">
                                  <Icon name="lock" size={13} /> සුරක්ෂිත
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="සංස්කරණය"
                                    title="සංස්කරණය"
                                    onClick={() =>
                                      setEdit({
                                        id: admin.id,
                                        name: admin.name,
                                        username: admin.username,
                                        password: '',
                                        status: admin.status,
                                      })
                                    }
                                  >
                                    <Icon name="pen" size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-button icon-button--danger"
                                    aria-label="ඉවත් කරන්න"
                                    title="ඉවත් කරන්න"
                                    disabled={adminBusy === admin.id}
                                    onClick={() => {
                                      if (!window.confirm(`@${admin.username} පරිපාලක ඉවත් කරන්නද?`)) return;
                                      handleAdminAction(
                                        admin.id,
                                        () => deleteAdmin(admin.id),
                                        'පරිපාලක ඉවත් කරන ලදී.',
                                      );
                                    }}
                                  >
                                    <Icon name="trash" size={16} />
                                  </button>
                                </>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <form className="admin-card" onSubmit={handleCreateAdmin}>
                <div className="admin-card-head">
                  <h2>
                    <Icon name="sparkle" size={16} /> නව පරිපාලකයෙක් සාදන්න
                  </h2>
                </div>
                <p className="admin-form-note">ඔබ සාදන ගිණුම් වහාම අනුමත වේ.</p>
                <div className="admin-edit-grid">
                  <label className="field">
                    <span className="field-label">නම</span>
                    <div className="field-input">
                      <input
                        value={newAdmin.name}
                        onChange={(event) => setNewAdmin({ ...newAdmin, name: event.target.value })}
                        placeholder="සම්පූර්ණ නම"
                        required
                      />
                    </div>
                  </label>
                  <label className="field">
                    <span className="field-label">පරිශීලක නාමය</span>
                    <div className="field-input">
                      <input
                        value={newAdmin.username}
                        onChange={(event) => setNewAdmin({ ...newAdmin, username: event.target.value })}
                        placeholder="username"
                        required
                      />
                    </div>
                  </label>
                  <label className="field">
                    <span className="field-label">මුරපදය</span>
                    <div className="field-input">
                      <input
                        type="password"
                        value={newAdmin.password}
                        autoComplete="new-password"
                        onChange={(event) => setNewAdmin({ ...newAdmin, password: event.target.value })}
                        placeholder="අකුරු 6+"
                        required
                      />
                    </div>
                  </label>
                  <div className="admin-edit-actions">
                    <button type="submit" className="btn btn--gold btn--sm" disabled={adminBusy === 'new'}>
                      <Icon name="check" size={15} />
                      සාදන්න
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : null}

          {tab === 'account' ? (
            <div className="admin-card">
              <div className="admin-card-head">
                <h2>
                  <Icon name="shield" size={16} /> මගේ ගිණුම
                </h2>
              </div>

              <div className="account-summary">
                <span className="admin-row-avatar">{session.name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{session.name}</strong>
                  <small>
                    @{session.username} · {isOwner ? 'මුල් පරිපාලක' : 'පරිපාලක'}
                  </small>
                </div>
              </div>

              {isOwner ? (
                <p className="admin-form-note">
                  මුල් පරිපාලකගේ පරිශීලක නාමය හා මුරපදය සකසා ඇත්තේ සේවාදායක සැකසුම් (.dev.vars) හරහාය.
                  ඒවා වෙනස් කිරීමට එහි අගයන් වෙනස් කර නැවත ආරම්භ කරන්න.
                </p>
              ) : (
                <form className="account-form" onSubmit={handlePasswordChange}>
                  <label className="field">
                    <span className="field-label">වත්මන් මුරපදය</span>
                    <div className="field-input">
                      <Icon name="lock" size={16} />
                      <input
                        type="password"
                        value={currentPassword}
                        autoComplete="current-password"
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        required
                      />
                    </div>
                  </label>
                  <label className="field">
                    <span className="field-label">නව මුරපදය</span>
                    <div className="field-input">
                      <Icon name="lock" size={16} />
                      <input
                        type="password"
                        value={newPassword}
                        autoComplete="new-password"
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="අකුරු 6+"
                        required
                      />
                    </div>
                  </label>
                  {passwordStatus ? (
                    <p className={`form-status form-status--${passwordStatus.kind}`}>
                      <Icon name={passwordStatus.kind === 'ok' ? 'check' : 'info'} size={15} />
                      {passwordStatus.text}
                    </p>
                  ) : null}
                  <button type="submit" className="btn btn--gold">
                    <Icon name="check" size={16} />
                    මුරපදය වෙනස් කරන්න
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
