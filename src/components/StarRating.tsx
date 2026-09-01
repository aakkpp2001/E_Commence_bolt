import { Star } from 'lucide-react';

type Props = {
  rating: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
};

export default function StarRating({ rating, size = 16, showNumber = false, reviewCount, className = '' }: Props) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const roundedFull = rating - full >= 0.75 ? full + 1 : full;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < roundedFull) {
      stars.push(<Star key={i} size={size} className="fill-accent-400 text-accent-400" />);
    } else if (i === roundedFull && hasHalf) {
      stars.push(
        <div key={i} className="relative" style={{ width: size, height: size }}>
          <Star size={size} className="text-gray-300 absolute" />
          <div className="overflow-hidden absolute" style={{ width: size / 2, height: size }}>
            <Star size={size} className="fill-accent-400 text-accent-400" />
          </div>
        </div>,
      );
    } else {
      stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showNumber && <span className="text-sm font-medium text-text-secondary">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-sm text-text-muted">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
