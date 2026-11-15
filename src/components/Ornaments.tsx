export function MandalaRing({ className = '' }: { className?: string }) {
  const petals = Array.from({ length: 24 });
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor">
        <circle cx="300" cy="300" r="288" strokeWidth="1" opacity="0.55" />
        <circle cx="300" cy="300" r="250" strokeWidth="1" strokeDasharray="2 12" opacity="0.7" />
        <circle cx="300" cy="300" r="196" strokeWidth="1" opacity="0.45" />
        <circle cx="300" cy="300" r="118" strokeWidth="1" opacity="0.35" />
        {petals.map((_, index) => {
          const angle = (index * 360) / petals.length;
          return (
            <ellipse
              key={index}
              cx="300"
              cy="150"
              rx="24"
              ry="78"
              strokeWidth="1"
              opacity="0.45"
              transform={`rotate(${angle} 300 300)`}
            />
          );
        })}
      </g>
    </svg>
  );
}

export function DagobaSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} aria-hidden="true" fill="currentColor">
      <path d="M0 214h320v6H0z" opacity="0.55" />
      <path d="M60 206h200v6H60z" opacity="0.45" />
      <path d="M82 200h156v5H82z" opacity="0.4" />
      <path d="M96 156h128l10 44H86z" opacity="0.3" />
      <path d="M160 66c34 0 62 26 64 60l2 30H94l2-30c2-34 30-60 64-60z" opacity="0.5" />
      <path d="M142 66h36v14h-36z" opacity="0.5" />
      <path d="M160 14l5 18h-10z" opacity="0.55" />
      <path d="M160 26l3 26h-6z" opacity="0.45" />
      <path d="M152 52h16v8h-16z" opacity="0.45" />
    </svg>
  );
}

export function LotusDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`lotus-divider ${className}`.trim()} aria-hidden="true">
      <span className="lotus-line" />
      <svg viewBox="0 0 64 40" className="lotus-mark" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M32 34c-8 0-16-6-18-14 8 0 14 4 18 10 4-6 10-10 18-10-2 8-10 14-18 14z" />
        <path d="M32 30c-4-6-4-14 0-20 4 6 4 14 0 20z" />
        <path d="M18 12c4 2 7 6 8 11" />
        <path d="M46 12c-4 2-7 6-8 11" />
      </svg>
      <span className="lotus-line" />
    </div>
  );
}

export function TeacherPortraitFallback() {
  return (
    <div className="portrait-art">
      <MandalaRing className="portrait-art-ring" />
      <div className="portrait-art-body">
        <span className="portrait-art-seal">HN</span>
        <p className="portrait-art-name">
          හර්ෂණ
          <br />
          නල්ලපෙරුම
        </p>
        <span className="portrait-art-role">ජාතික පාසල් ආචාර්ය</span>
        <span className="portrait-art-sub">ඉතිහාසය · 6 – 11 ශ්‍රේණි</span>
      </div>
    </div>
  );
}

export function PosterArtFallback() {
  return (
    <div className="poster-art">
      <div className="poster-art-ribbon">2027</div>
      <span className="poster-art-kicker">නව පන්ති ආරම්භය</span>
      <span className="poster-art-title">ඉතිහාසය</span>
      <span className="poster-art-name">හර්ෂණ නල්ලපෙරුම</span>
      <span className="poster-art-sub">අභිමානවන්ත දේශයක සාඩම්බර උරුමය</span>
      <span className="poster-art-date">2026 · නොවැම්බර් 09</span>
    </div>
  );
}

export function KalamBand({ className = '' }: { className?: string }) {
  return (
    <div className={`kalam-band ${className}`.trim()} aria-hidden="true">
      <span className="kalam-rule" />
      <svg viewBox="0 0 240 40" className="kalam-motif" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M120 3l15 17-15 17-15-17z" />
        <path d="M120 11l8 9-8 9-8-9z" opacity="0.55" />
        <circle cx="120" cy="20" r="2" opacity="0.8" />
        <circle cx="64" cy="20" r="3" />
        <circle cx="88" cy="20" r="1.6" opacity="0.6" />
        <circle cx="176" cy="20" r="3" />
        <circle cx="152" cy="20" r="1.6" opacity="0.6" />
        <path d="M0 20h46" opacity="0.45" />
        <path d="M194 20h46" opacity="0.45" />
        <path d="M40 12c6 3 10 6 12 8-2 2-6 5-12 8" opacity="0.5" />
        <path d="M200 12c-6 3-10 6-12 8 2 2 6 5 12 8" opacity="0.5" />
      </svg>
      <span className="kalam-rule" />
    </div>
  );
}

export function HeritageBackdrop() {
  return (
    <div className="heritage-backdrop" aria-hidden="true">
      <MandalaRing className="heritage-ring heritage-ring--one" />
      <MandalaRing className="heritage-ring heritage-ring--two" />
      <DagobaSilhouette className="heritage-dagoba" />
    </div>
  );
}
