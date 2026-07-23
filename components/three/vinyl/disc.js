/**
 * The disc's dimensions, in one place.
 *
 * These numbers are consumed by three files that must agree exactly:
 *   - Record.jsx           builds the geometry
 *   - Turntable.jsx        cues the tonearm to a band
 *   - useVinylTextures.js  paints the grooves and the gaps between tracks
 *
 * They used to be duplicated, and they drifted: the shiny separator rings on
 * the texture sat at radii 0.69 / 0.93 / 1.17 while the tonearm was cueing to
 * gaps at 1.08 and 0.80, so the needle landed in the middle of a band instead
 * of in the visible space between two. Deriving the rings from the bands makes
 * that class of mismatch unrepresentable.
 */

/** Outer radius of the record. Everything else is expressed against this. */
export const RECORD_R = 1.5;

/** Groove radii each track occupies, outermost first. */
export const TRACK_BANDS = [
  { start: 1.38, end: 1.1 },
  { start: 1.06, end: 0.82 },
  { start: 0.78, end: 0.55 },
];

/**
 * Radii where a visibly shinier band gap belongs: the midpoint of each gap
 * between consecutive tracks, plus the run-out just inside the last one.
 */
export const BAND_SEPARATORS = [
  ...TRACK_BANDS.slice(1).map((band, i) => (TRACK_BANDS[i].end + band.start) / 2),
  TRACK_BANDS[TRACK_BANDS.length - 1].end - 0.02,
];
