import type { Exercise, NotionConfig, WorkoutSession } from '@/types';

interface NotionPage {
  parent: { database_id: string };
  properties: Record<string, unknown>;
}

function buildSetName(exerciseName: string, setNumber: number, sessionDate: string): string {
  const date = new Date(sessionDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${exerciseName} — Set ${setNumber} (${date})`;
}

function recommendationLabel(rec: string): string {
  const map: Record<string, string> = {
    increase: 'Increase weight',
    decrease: 'Decrease weight',
    keep: 'Keep',
    pending: 'Keep',
  };
  return map[rec] ?? 'Keep';
}

export function buildNotionPages(
  session: WorkoutSession,
  exercises: Exercise[],
  config: NotionConfig
): NotionPage[] {
  const pages: NotionPage[] = [];

  for (const log of session.exercises) {
    const exercise = exercises.find((e) => e.id === log.exerciseId);
    if (!exercise) continue;

    for (const setEntry of log.sets) {
      pages.push({
        parent: { database_id: config.databaseId },
        properties: {
          'Set': {
            title: [{ text: { content: buildSetName(exercise.name, setEntry.setNumber, session.startedAt) } }],
          },
          'Exercise': { select: { name: exercise.name } },
          'Weight': { number: setEntry.weight },
          'Reps': { number: setEntry.reps },
          'PB:': { checkbox: setEntry.isPersonalBest },
          'Auto su...': { select: { name: recommendationLabel(log.recommendation) } },
          'adjustment?': { checkbox: false },
          'todays date?': { date: { start: session.startedAt.split('T')[0] } },
          'Set #': { number: setEntry.setNumber },
        },
      });
    }
  }

  return pages;
}

export async function syncSessionToNotion(
  session: WorkoutSession,
  exercises: Exercise[],
  config: NotionConfig
): Promise<{ success: number; errors: number }> {
  const pages = buildNotionPages(session, exercises, config);
  const baseUrl = config.corsProxyUrl
    ? config.corsProxyUrl.replace(/\/$/, '')
    : 'https://api.notion.com';

  let success = 0;
  let errors = 0;

  for (const page of pages) {
    try {
      const res = await fetch(`${baseUrl}/v1/pages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(page),
      });

      if (res.ok) {
        success++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { success, errors };
}
