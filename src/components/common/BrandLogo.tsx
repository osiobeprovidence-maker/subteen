import { cn } from '../../lib/utils';
import { useBrandAssets } from '../../hooks/useBrandAssets';

export type BrandVariant = 'icon' | 'dark' | 'light' | 'auto';
export type BrandBackground = 'dark' | 'light';

type BrandLogoProps = {
  variant?: BrandVariant;
  background?: BrandBackground;
  alt?: string;
  className?: string;
};

export const BrandLogo = ({
  variant = 'auto',
  background = 'dark',
  alt = 'Subteen',
  className,
}: BrandLogoProps) => {
  const { iconUrl, darkUrl, lightUrl } = useBrandAssets();
  const resolved: 'icon' | 'dark' | 'light' =
    variant === 'auto' ? (background === 'light' ? 'light' : 'dark') : variant;

  if (resolved === 'icon') {
    return (
      <img
        src={iconUrl ?? '/favicon.svg'}
        alt={alt}
        className={cn('object-contain', className)}
      />
    );
  }

  if (resolved === 'dark') {
    if (darkUrl) {
      return <img src={darkUrl} alt={alt} className={cn('object-contain', className)} />;
    }
    return (
      <span className={cn('font-black tracking-tighter text-white', className)}>
        SUB<span className="text-[#B8FF4D]">TEEN</span>
      </span>
    );
  }

  if (lightUrl) {
    return <img src={lightUrl} alt={alt} className={cn('object-contain', className)} />;
  }
  return (
    <span className={cn('font-black tracking-tighter text-black', className)}>
      SUB<span className="text-[#B8FF4D]">TEEN</span>
    </span>
  );
};
