// Study-note content shapes for Learn mode. Ported verbatim from the
// My Life in the UK Test app (lib/learn/notes/types.ts).

/** An illustrative emoji "figure" card spread through a lesson. */
export type LessonFigure = { emoji: string; title: string; caption: string };

/** One lesson's content. `bullets` may use **bold** markers (→ <strong>). */
export type LessonNotes = {
  title: string;
  intro: string;
  bullets: string[];
  figures?: LessonFigure[];
};
