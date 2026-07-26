"use client";

/**
 * Swimlane flowchart built from the poster's steps.
 * One lane per جهة (internal / audit / ministry); a step sits in its owner's
 * lane, so every hand-off between departments is visible as a sideways jump.
 * Pure SVG — no layout engine, no external deps, exports to PNG like the poster.
 */

import { COLOR_HEX, LEGEND_AR, LEGEND_EN, type DeptColor, type Step } from "./poster-core";
import type { Lang } from "./Shared";

const LANES: DeptColor[] = ["m", "b", "g"];

const W = 1000;
const LANE_GAP = 14;
const PAD_X = 24;
const HEAD_H = 46;
// Leaves room for the title above the lane headers (header top = TOP - HEAD_H - 8).
const TOP = 100;
const BOX_H = 74;
const ROW_GAP = 30;
const BOTTOM = 34;

export function flowchartHeight(stepCount: number) {
  return TOP + Math.max(stepCount, 1) * (BOX_H + ROW_GAP) - ROW_GAP + BOTTOM;
}

export default function Flowchart({
  steps,
  lang,
  title,
}: {
  steps: Step[];
  lang: Lang;
  title?: string;
}) {
  const isAr = lang === "ar";
  const visible = steps.filter((s) => !s.hidden);
  const labels = isAr ? LEGEND_AR : LEGEND_EN;

  const laneW = (W - PAD_X * 2 - LANE_GAP * 2) / 3;
  // RTL reads right-to-left, so lane 0 (internal, where work starts) sits on the right.
  const laneX = (lane: DeptColor) => {
    const i = LANES.indexOf(lane);
    const slot = isAr ? 2 - i : i;
    return PAD_X + slot * (laneW + LANE_GAP);
  };

  const rowY = (i: number) => TOP + i * (BOX_H + ROW_GAP);
  const height = flowchartHeight(visible.length);

  return (
    <svg
      width={W}
      height={height}
      viewBox={`0 0 ${W} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: "#fbfaf6", fontFamily: "var(--font-poster, var(--font-cairo)), Tahoma, sans-serif" }}
    >
      <defs>
        {LANES.map((c) => (
          <marker
            key={c}
            id={`arrow-${c}`}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L8,4 L0,8 z" fill={COLOR_HEX[c]} />
          </marker>
        ))}
      </defs>

      {title && (
        <text
          x={W / 2}
          y={30}
          textAnchor="middle"
          fontSize="19"
          fontWeight="700"
          fill="#7a0020"
          direction={isAr ? "rtl" : "ltr"}
        >
          {title}
        </text>
      )}

      {/* lane backgrounds + headers */}
      {LANES.map((lane, i) => {
        const x = laneX(lane);
        return (
          <g key={lane}>
            <rect
              x={x}
              y={TOP - HEAD_H - 8}
              width={laneW}
              height={height - (TOP - HEAD_H - 8) - 12}
              rx="10"
              fill={COLOR_HEX[lane]}
              opacity="0.04"
            />
            <rect x={x} y={TOP - HEAD_H - 8} width={laneW} height={HEAD_H} rx="10" fill={COLOR_HEX[lane]} />
            <text
              x={x + laneW / 2}
              y={TOP - HEAD_H - 8 + HEAD_H / 2 + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#ffffff"
              direction={isAr ? "rtl" : "ltr"}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}

      {/* connectors — drawn first so boxes sit on top */}
      {visible.slice(0, -1).map((step, i) => {
        const next = visible[i + 1];
        const from = { x: laneX(step.color), y: rowY(i) };
        const to = { x: laneX(next.color), y: rowY(i + 1) };
        const sameLane = step.color === next.color;
        const color = COLOR_HEX[next.color];

        if (sameLane) {
          const cx = from.x + laneW / 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={from.y + BOX_H}
              x2={cx}
              y2={to.y}
              stroke={color}
              strokeWidth="2.5"
              markerEnd={`url(#arrow-${next.color})`}
            />
          );
        }

        // Hand-off: drop below the current box, slide across, then into the next lane.
        const startX = from.x + laneW / 2;
        const endX = to.x + laneW / 2;
        const midY = from.y + BOX_H + ROW_GAP / 2;
        return (
          <path
            key={i}
            d={`M ${startX} ${from.y + BOX_H} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${to.y}`}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            markerEnd={`url(#arrow-${next.color})`}
          />
        );
      })}

      {/* step boxes */}
      {visible.map((step, i) => {
        const x = laneX(step.color);
        const y = rowY(i);
        const label = (isAr ? step.title_ar : step.title_en) || (isAr ? "بدون عنوان" : "Untitled");
        const desc = isAr ? step.desc_ar : step.desc_en;
        const color = COLOR_HEX[step.color];
        // No `direction` attribute here: it would flip what text-anchor means and
        // push Arabic labels out of their box. Bidi already renders the glyphs
        // right-to-left; anchoring "end" at the right edge is what right-aligns them.
        const anchor = isAr ? "end" : "start";
        const textX = isAr ? x + laneW - 42 : x + 42;
        const textW = laneW - 54;

        return (
          <g key={i}>
            <rect x={x} y={y} width={laneW} height={BOX_H} rx="9" fill="#ffffff" stroke={color} strokeWidth="2" />
            {/* accent bar on the reading edge — rx takes a single length, not a corner list */}
            <rect x={isAr ? x + laneW - 5 : x} y={y + 2} width="5" height={BOX_H - 4} rx="2" fill={color} />
            <circle cx={isAr ? x + laneW - 22 : x + 22} cy={y + 22} r="12" fill={color} />
            <text
              x={isAr ? x + laneW - 22 : x + 22}
              y={y + 27}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#ffffff"
            >
              {i + 1}
            </text>
            <text
              x={textX}
              y={y + 26}
              textAnchor={anchor}
              fontSize="13"
              fontWeight="700"
              fill="#1c1c1c"
              textLength={undefined}
            >
              {fit(label, textW, 13)}
            </text>
            {desc && (
              <text x={textX} y={y + 46} textAnchor={anchor} fontSize="11" fill="#666666">
                {fit(desc, textW, 11)}
              </text>
            )}
            {desc && fit(desc, textW, 11) !== desc.trim() && (
              <text x={textX} y={y + 62} textAnchor={anchor} fontSize="11" fill="#666666">
                {fit(rest(desc, textW, 11), textW, 11)}
              </text>
            )}
          </g>
        );
      })}

      {visible.length === 0 && (
        <text x={W / 2} y={TOP + 40} textAnchor="middle" fontSize="14" fill="#999999">
          {isAr ? "أضف خطوات لتوليد المخطط" : "Add steps to generate the flowchart"}
        </text>
      )}
    </svg>
  );
}

/**
 * SVG <text> does not wrap, so labels are trimmed to what fits the lane.
 * Arabic/Latin average glyph advance is ~0.52em, close enough to keep text
 * inside the box without measuring the DOM (which would break SSR).
 */
function charBudget(widthPx: number, fontSize: number) {
  return Math.max(6, Math.floor(widthPx / (fontSize * 0.52)));
}

function fit(s: string, widthPx: number, fontSize: number) {
  const t = s.trim();
  const max = charBudget(widthPx, fontSize);
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** The remainder that `fit` cut off, for the second description line. */
function rest(s: string, widthPx: number, fontSize: number) {
  const t = s.trim();
  const max = charBudget(widthPx, fontSize);
  return t.length <= max ? "" : t.slice(max - 1);
}
