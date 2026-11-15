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
  new: 'Newest first',
  old: 'Oldest first',
  grade: 'By grade',
  title: 'By title',
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
      setRegStatus({ kind: 'error', text: 'Passwords do not match.' });
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
        text: 'Your request has been sent. You can log in once the owner approves it.',
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
      setStatus({ kind: 'error', text: 'Choose a PDF file.' });
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
    if (!window.confirm(`"${paper.title}" Delete the paper?`)) return;
    setDeleting(paper.id);
    setStatus(null);
    try {
      await removePaper(paper.id);
      setStatus({ kind: 'ok', text: 'Paper deleted successfully.' });
      await loadPapers();
    } catch {
      setStatus({ kind: 'error', text: 'Delete failed. Try again.' });
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
      setStatus({ kind: 'error', text: 'Could not copy the link. Check the browser permissions.' });
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
      setStatus({ kind: 'ok', text: 'New admin account created.' });
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
      setPasswordStatus({ kind: 'ok', text: 'Password changed successfully.' });
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
          <p>Checking...</p>
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
                Secure login
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
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'register'}
                className={`auth-tab ${authMode === 'register' ? 'is-active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            {authMode === 'login' ? (
              <>
                <div className="login-head">
                  <span className="login-kicker">HISTORY · පරිපාලක</span>
                  <h1>Admin Login</h1>
                  <p>Login to add and manage papers.</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                  <label className="field">
                    <span className="field-label">Username</span>
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
                    <span className="field-label">Password</span>
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
                    {loggingIn ? 'Logging in...' : 'Login'}
                    <Icon name="arrowRight" size={17} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="login-head">
                  <span className="login-kicker">HISTORY · නව ගිණුම</span>
                  <h1>පරිපාලක ඉල්ලුම</h1>
                  <p>Enter your name, username and password, then send the request.</p>
                </div>

                <form className="login-form" onSubmit={handleRegister}>
                  <label className="field">
                    <span className="field-label">Full name</span>
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
                    <span className="field-label">Username</span>
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
                    <span className="field-label">Password</span>
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
                    <span className="field-label">Confirm password</span>
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
                    {registering ? 'Sending...' : 'Send request'}
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
    setStatus({ kind: 'ok', text: `${filtered.length} papers exported as CSV.` });
  };

  const NAV: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Summary', icon: 'grid' },
    { id: 'papers', label: 'Papers', icon: 'fileText' },
    { id: 'new', label: 'Add Paper', icon: 'upload' },
    ...(isOwner
      ? [{ id: 'admins' as Tab, label: 'Admins', icon: 'users', badge: pendingAdmins.length }]
      : []),
    { id: 'account', label: 'My Account', icon: 'lock' },
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
              View site
            </Link>
            <button type="button" className="admin-side-link" onClick={handleLogout}>
              <Icon name="logout" size={15} />
              Logout
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <span className="admin-kicker">
                {isOwner ? 'Owner' : 'Admin'}
              </span>
              <h1>
                {tab === 'overview' && 'Summary'}
                {tab === 'papers' && 'Papers List'}
                {tab === 'new' && 'Add Paper'}
                {tab === 'admins' && 'Manage Admins'}
                {tab === 'account' && 'My account'}
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
                  <span className="kpi2-label">Total papers</span>
                  <strong>{papers.length}</strong>
                  <small>All grades together</small>
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
                    <Icon name="trending" size={16} /> Papers by grade
                  </h2>
                  <span className="admin-card-note">{papers.length} papers</span>
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
                      <Icon name="clock" size={16} /> Latest papers
                    </h2>
                    <button type="button" className="text-button" onClick={() => setTab('papers')}>
                      සියල්ල
                      <Icon name="arrowRight" size={13} />
                    </button>
                  </div>
                  {papers.length === 0 ? (
                    <p className="admin-empty-text">තවම ප්‍රශ්න පත්‍ර නැත.</p>
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
                    <p className="admin-empty-text">No pending requests.</p>
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
                                `${admin.name} approved.`,
                              )
                            }
                          >
                            Approve
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
                  <Icon name="fileText" size={16} /> {filtered.length} / {papers.length} papers
                </h2>
                <button type="button" className="text-button" onClick={loadPapers} disabled={loadingPapers}>
                  <Icon name="sparkle" size={13} />
                  {loadingPapers ? 'Updating...' : 'Refresh'}
                </button>
              </div>

              <div className="admin-toolbar">
                <label className="admin-search">
                  <Icon name="search" size={15} />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by title, school or year"
                    aria-label="Search papers"
                  />
                  {query ? (
                    <button
                      type="button"
                      className="admin-search-clear"
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  ) : null}
                </label>

                <select
                  className="select select--sm"
                  value={gradeFilter}
                  onChange={(event) => setGradeFilter(event.target.value)}
                  aria-label="Filter by grade"
                >
                  <option value="all">All grades</option>
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
                  aria-label="Sort order"
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
                      ? 'No papers yet. Add one from the "Add Paper" tab.'
                      : 'No papers match this search.'}
                  </p>
                </div>
              ) : (
                <ul className="admin-items">
                  {filtered.map((paper) => (
                    <li key={paper.id} className="admin-item">
                      <div className="admin-item-main">
                        <div className="admin-item-top">
                          <span className="chip chip--grade">{paper.grade} ශ්‍රේණිය</span>
                          <span className="chip chip--type">{TYPES[paper.type] || 'Paper'}</span>
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
                          aria-label="Copy link"
                          title={copied === paper.id ? 'Copied' : 'Copy link'}
                        >
                          <Icon name={copied === paper.id ? 'check' : 'copy'} size={16} />
                        </button>
                        <a
                          className="icon-button"
                          href={paper.link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="View paper"
                        >
                          <Icon name="eye" size={16} />
                        </a>
                        <button
                          type="button"
                          className="icon-button icon-button--danger"
                          onClick={() => handleDelete(paper)}
                          disabled={deleting === paper.id}
                          aria-label="Delete paper"
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
                  <Icon name="upload" size={16} /> Add Paper
                </h2>
              </div>
              <p className="admin-form-note">PDF ගොනුවක් උඩුගත කරන්න හෝ Google Drive සබැඳියක් ලබා දෙන්න.</p>

              <label className="field">
                <span className="field-label">Paper title *</span>
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
                  <span className="field-label">Grade</span>
                  <select className="select" value={grade} onChange={(event) => setGrade(event.target.value)}>
                    {GRADE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value} ශ්‍රේණිය
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Year</span>
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
                  <span className="field-label">Term</span>
                  <select className="select" value={term} onChange={(event) => setTerm(event.target.value)}>
                    {Object.entries(TERMS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Type</span>
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
                <span className="field-label">School (optional)</span>
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
                      <strong>Drop PDF here</strong>
                      <small>or click to browse · max 15MB</small>
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
                {saving ? 'Saving...' : 'Add Paper'}
                <Icon name="check" size={17} />
              </button>
            </form>
          ) : null}

          {tab === 'admins' && isOwner ? (
            <>
              <div className="admin-card">
                <div className="admin-card-head">
                  <h2>
                    <Icon name="bell" size={16} /> Pending approvals ({pendingAdmins.length})
                  </h2>
                  <button type="button" className="text-button" onClick={loadAdmins} disabled={loadingAdmins}>
                    <Icon name="sparkle" size={13} />
                    Refresh
                  </button>
                </div>

                {pendingAdmins.length === 0 ? (
                  <p className="admin-empty-text">No pending requests.</p>
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
                                `${admin.name} approved.`,
                              )
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            disabled={adminBusy === admin.id}
                            onClick={() =>
                              handleAdminAction(
                                admin.id,
                                () => updateAdmin(admin.id, { status: 'rejected' }),
                                `${admin.name} rejected.`,
                              )
                            }
                          >
                            Reject
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
                    <Icon name="users" size={16} /> All admins ({admins.length})
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
                              <span className="field-label">Name</span>
                              <div className="field-input">
                                <input
                                  value={edit.name}
                                  onChange={(event) => setEdit({ ...edit, name: event.target.value })}
                                />
                              </div>
                            </label>
                            <label className="field">
                              <span className="field-label">Username</span>
                              <div className="field-input">
                                <input
                                  value={edit.username}
                                  onChange={(event) => setEdit({ ...edit, username: event.target.value })}
                                />
                              </div>
                            </label>
                            <label className="field">
                              <span className="field-label">New password (blank = unchanged)</span>
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
                              <span className="field-label">Status</span>
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
                                    'Admin account updated.',
                                  )
                                }
                              >
                                <Icon name="check" size={15} />
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() => setEdit(null)}
                              >
                                Cancel
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
                                  <span className="chip chip--owner">Owner</span>
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
                                  <Icon name="lock" size={13} /> Protected
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="Edit"
                                    title="Edit"
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
                                    aria-label="Delete"
                                    title="Delete"
                                    disabled={adminBusy === admin.id}
                                    onClick={() => {
                                      if (!window.confirm(`@${admin.username} delete this admin?`)) return;
                                      handleAdminAction(
                                        admin.id,
                                        () => deleteAdmin(admin.id),
                                        'Admin removed.',
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
                    <Icon name="sparkle" size={16} /> Create new admin
                  </h2>
                </div>
                <p className="admin-form-note">Accounts you create are approved immediately.</p>
                <div className="admin-edit-grid">
                  <label className="field">
                    <span className="field-label">Name</span>
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
                    <span className="field-label">Username</span>
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
                    <span className="field-label">Password</span>
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
                      Create
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
                  <Icon name="shield" size={16} /> My Account
                </h2>
              </div>

              <div className="account-summary">
                <span className="admin-row-avatar">{session.name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{session.name}</strong>
                  <small>
                    @{session.username} · {isOwner ? 'Owner' : 'Admin'}
                  </small>
                </div>
              </div>

              {isOwner ? (
                <p className="admin-form-note">
                  The owner's username and password are set through the server settings (.dev.vars). Change them there and restart.
                </p>
              ) : (
                <form className="account-form" onSubmit={handlePasswordChange}>
                  <label className="field">
                    <span className="field-label">Current password</span>
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
                    <span className="field-label">New password</span>
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
                    Change password
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
