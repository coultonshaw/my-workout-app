import { Badge } from '@/components/ui/Badge';
import type { RecommendationResult } from '@/types';

interface RecommendationBadgeProps {
  result: RecommendationResult;
  suggestedWeight?: number;
  unit?: string;
}

export function RecommendationBadge({ result, unit = 'kg' }: RecommendationBadgeProps) {
  if (result.recommendation === 'pending') return null;

  return (
    <div className="mt-3 space-y-1">
      <Badge type={result.recommendation} />
      <p className="text-xs text-gray-400 leading-relaxed">{result.reason}</p>
      {result.suggestedWeight !== undefined && (
        <p className="text-xs text-accent font-semibold">
          Next session: {result.suggestedWeight}{unit}
        </p>
      )}
    </div>
  );
}
