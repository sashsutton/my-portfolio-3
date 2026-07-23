/**
 * The shapes the point cloud on /science morphs between, and the edge list that
 * turns it into a graph.
 *
 * Everything here is pure maths on Float32Arrays — no three, no React. The
 * arrays are built once per page load and then only ever read, because the
 * morph itself happens on the GPU: the shader holds `aFrom` and `aTo` and
 * lerps between them, so a transition costs one uniform write per frame rather
 * than N vector operations.
 *
 * Point count is fixed for the whole session. Every formation must therefore
 * produce exactly `count` positions — a formation that "naturally" wants a
 * different number (the grid, which wants a perfect square) pads by overshooting
 * and slicing, never by returning a shorter array.
 */

/**
 * Deterministic PRNG. The formations must be identical between the point mesh
 * and the line mesh — they literally share attribute buffers — and jitter drawn
 * from Math.random() would also resample on every hot reload, so the cloud would
 * silently change shape while you were looking at it.
 */
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller. Gaussian blobs, not uniform boxes — clusters need soft edges. */
function gaussian(rnd) {
  let u = 0;
  while (u === 0) u = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
}

const CLUSTER_COUNT = 6;

/* ------------------------------------------------------------- formations -- */

/** Raw, unstructured data: an even shell with no organisation to it at all. */
function sphere(count, rnd) {
  const out = new Float32Array(count * 3);
  // Fibonacci sphere — even coverage without the pole bunching you get from
  // naive spherical coordinates.
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const jitter = 1 + gaussian(rnd) * 0.035;
    out[i * 3] = Math.cos(theta) * r * 2.7 * jitter;
    out[i * 3 + 1] = y * 2.7 * jitter;
    out[i * 3 + 2] = Math.sin(theta) * r * 2.7 * jitter;
  }
  return out;
}

/**
 * The same points after something has learned a representation of them: six
 * gaussian blobs on a ring. Cluster membership is `i % CLUSTER_COUNT` so it is
 * recoverable anywhere else in the module without storing a lookup.
 */
function clusters(count, rnd) {
  const out = new Float32Array(count * 3);
  const centres = [];
  for (let c = 0; c < CLUSTER_COUNT; c++) {
    const a = (c / CLUSTER_COUNT) * Math.PI * 2;
    centres.push([Math.cos(a) * 2.3, (c % 2 ? 1 : -1) * (0.5 + rnd() * 0.7), Math.sin(a) * 2.3]);
  }
  for (let i = 0; i < count; i++) {
    const [cx, cy, cz] = centres[i % CLUSTER_COUNT];
    out[i * 3] = cx + gaussian(rnd) * 0.52;
    out[i * 3 + 1] = cy + gaussian(rnd) * 0.46;
    out[i * 3 + 2] = cz + gaussian(rnd) * 0.52;
  }
  return out;
}

/** A double helix, used as the timeline under the education section. */
function helix(count) {
  const out = new Float32Array(count * 3);
  const turns = 3.2;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const strand = i % 2 ? Math.PI : 0;
    const a = t * Math.PI * 2 * turns + strand;
    const r = 1.55;
    out[i * 3] = Math.cos(a) * r;
    out[i * 3 + 1] = (t - 0.5) * 5.6;
    out[i * 3 + 2] = Math.sin(a) * r;
  }
  return out;
}

/** A loss surface: a saddle with a basin punched into it. */
function manifold(count) {
  const out = new Float32Array(count * 3);
  const side = Math.ceil(Math.sqrt(count));
  const span = 6.0;
  for (let i = 0; i < count; i++) {
    const x = ((i % side) / (side - 1) - 0.5) * span;
    const z = (Math.floor(i / side) / (side - 1) - 0.5) * span;
    const saddle = (x * x - z * z) * 0.11;
    const basin = -1.5 * Math.exp(-((x + 1.1) ** 2 + (z - 0.8) ** 2) / 1.6);
    out[i * 3] = x;
    out[i * 3 + 1] = saddle + basin;
    out[i * 3 + 2] = z;
  }
  return out;
}

/* ------------------------------------------------------------------ edges -- */

/**
 * A fixed edge list, solved once against the *clusters* formation.
 *
 * Edges are only ever shown when the cloud is clustered, so that is the layout
 * they should look correct in — nearest-neighbour pairs found in the sphere
 * would criss-cross the blobs into a hairball. Restricting the search to points
 * within the same cluster keeps it to CLUSTER_COUNT × (count/6)² comparisons
 * instead of count², which is the difference between ~0.3M and ~2M at the
 * default count.
 */
function buildEdges(positions, count, perNode = 2) {
  const pairs = new Set();
  const members = Array.from({ length: CLUSTER_COUNT }, () => []);
  for (let i = 0; i < count; i++) members[i % CLUSTER_COUNT].push(i);

  for (const group of members) {
    for (const i of group) {
      // Keep the `perNode` closest neighbours by insertion into a tiny array.
      const best = [];
      for (const j of group) {
        if (j === i) continue;
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d = dx * dx + dy * dy + dz * dz;
        if (best.length < perNode) {
          best.push({ j, d });
          best.sort((a, b) => a.d - b.d);
        } else if (d < best[best.length - 1].d) {
          best[best.length - 1] = { j, d };
          best.sort((a, b) => a.d - b.d);
        }
      }
      // Undirected: canonicalise so i–j and j–i collapse to one entry.
      for (const { j } of best) pairs.add(i < j ? `${i},${j}` : `${j},${i}`);
    }
  }

  // Uint16 covers any sane point count, but pick the width rather than assume
  // it — silently wrapping indices would draw edges between unrelated points.
  const Index = count > 65535 ? Uint32Array : Uint16Array;
  const index = new Index(pairs.size * 2);
  let k = 0;
  for (const key of pairs) {
    const [a, b] = key.split(",");
    index[k++] = +a;
    index[k++] = +b;
  }
  return index;
}

/* ------------------------------------------------------------------ build -- */

/**
 * Which formation is on screen at a given scroll position, and what to call it.
 * `at` is the scroll progress the stop begins at. The labels are surfaced in the
 * DOM readout, so they are ids rather than prose — ScienceSections translates.
 */
export const STOPS = [
  { at: 0.0, id: "sphere" }, // hero
  { at: 0.16, id: "clusters" }, // projects — a connected body of work, edges on
  { at: 0.45, id: "helix" }, // education — a timeline
  { at: 0.68, id: "manifold" }, // focus — the landscape ahead
  { at: 0.87, id: "sphere" }, // outro
];

export function stopForScroll(progress) {
  let i = 0;
  while (i < STOPS.length - 1 && progress >= STOPS[i + 1].at) i++;
  return i;
}

/**
 * Everything the scene needs, built in one pass.
 *
 * @param count how many points. Halved on low-power devices by the caller —
 *              the shader cost is per-fragment and these are additive, so a
 *              phone pays for overdraw far more than for vertex count.
 */
export function buildField(count) {
  const rnd = mulberry32(0x5a5ca11);
  const shapes = {
    sphere: sphere(count, rnd),
    clusters: clusters(count, rnd),
    helix: helix(count),
    manifold: manifold(count),
  };

  // Per-point constants. `seed` drives size and the idle drift phase; `tint`
  // biases hard toward 0 so the cloud is overwhelmingly phosphor green with a
  // scattering of amber, matching the two accents used across the site.
  const seeds = new Float32Array(count);
  const tints = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i] = rnd();
    tints[i] = Math.pow(rnd(), 5);
  }

  return {
    count,
    shapes,
    seeds,
    tints,
    order: STOPS.map((s) => shapes[s.id]),
    edges: buildEdges(shapes.clusters, count),
  };
}
