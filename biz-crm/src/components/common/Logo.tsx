import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { img: 'h-7 w-7', text: 'text-base' },
  md: { img: 'h-9 w-9', text: 'text-lg' },
  lg: { img: 'h-12 w-12', text: 'text-xl' },
  xl: { img: 'h-16 w-16', text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, href = '/', className }: LogoProps) {
  const { img, text } = sizeMap[size];

  const content = (
    <div className={cn('flex items-center space-x-2', className)}>
      <img
        src="/photo_2026-06-12_11-17-02.jpg"
        alt="EduFlow CRM Logo"
        className={cn(img, 'rounded-lg object-cover flex-shrink-0')}
      />
      {showText && (
        <span className={cn('font-bold text-gray-900 dark:text-white leading-tight', text)}>
          EduFlow <span className="text-primary">CRM</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
