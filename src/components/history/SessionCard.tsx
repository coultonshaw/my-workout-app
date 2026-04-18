import { Card } from '@/components/ui/Card';
import type { WorkoutSession } from '@/types';
import { formatDate, formatDuration, formatVolume } from '@/utils/formatters';

interface SessionCardProps {
  session: WorkoutSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const pbCount = session.exercises.flatMap((l) => l.sets).filter((s) => s.isPersonalBest).length;

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-medium text-sm">{formatDate(session.startedAt)}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {session.completedAt && formatDuration(session.startedAt, session.completedAt)}
            {session.rpe !== undefined && ` · RPE ${session.rpe}/10`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-accent text-sm font-semibold">{formatVolume(session.totalVolume)}</p>
          {pbCount > 0 && (
            <p className="text-xs text-amber-400 mt-0.5">{pbCount} PB{pbCount > 1 ? 's' : ''} 🏆</p>
          )}
        </div>
      </div>
    </Card>
  );
}
