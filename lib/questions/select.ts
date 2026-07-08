// Pure shuffle / selection helpers. No "use client" / "use server", no server
// imports — safe to use from server and client components alike.

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick up to `n` questions at random for a practice session. */
export function pickSession<T>(
  pool: T[],
  n: number,
  rnd: () => number = Math.random
): T[] {
  return shuffle(pool, rnd).slice(0, n);
}

/**
 * Mock selection: round-robin across module buckets so every module is
 * represented as evenly as the pool allows, up to `n` questions.
 */
export function pickMock<T extends { module: string }>(
  pool: T[],
  n: number,
  rnd: () => number = Math.random
): T[] {
  const buckets = new Map<string, T[]>();
  for (const q of shuffle(pool, rnd)) {
    const list = buckets.get(q.module) ?? [];
    list.push(q);
    buckets.set(q.module, list);
  }
  const order = shuffle([...buckets.keys()], rnd);
  const out: T[] = [];
  let added = true;
  while (out.length < n && added) {
    added = false;
    for (const key of order) {
      const list = buckets.get(key);
      if (list && list.length > 0) {
        out.push(list.shift() as T);
        added = true;
        if (out.length >= n) break;
      }
    }
  }
  return out;
}

/** Small deterministic PRNG (mulberry32) — for stable, repeatable mock papers. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
