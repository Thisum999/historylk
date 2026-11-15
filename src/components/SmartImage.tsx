import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
  loading?: 'lazy' | 'eager';
};

export default function SmartImage({ src, alt, className, fallback, loading = 'lazy' }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
