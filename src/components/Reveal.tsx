import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'header';
  /** Direction the element travels in from. */
  variant?: 'up' | 'left' | 'right' | 'zoom' | 'fade';
  style?: CSSProperties;
};

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
  variant = 'up',
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as as 'div';

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={`reveal reveal--${variant} ${visible ? 'in' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </Tag>
  );
}
