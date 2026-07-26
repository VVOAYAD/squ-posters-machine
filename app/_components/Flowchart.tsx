"use client";

/**
 * A real flowchart drawn from the poster's steps — start terminator, process
 * boxes, decision diamonds, arrowed links, end terminator — laid out in three
 * swimlanes (one per جهة) so every hand-off between departments is visible.
 *
 * Pure SVG, no layout engine: text is wrapped with a character budget rather
 * than measured, so it renders identically on the server and in the export.
 */

import { COLOR_HEX, LEGEND_AR, LEGEND_EN, type DeptColor, type Step } from "./poster-core";
import type { Lang } from "./Shared";

const LANES: DeptColor[] = ["m", "b", "g"];

const W = 1000;
const PAD_X = 24;
const LANE_GAP = 14;
const LANE_W = (W - PAD_X * 2 - LANE_GAP * 2) / 3;

const TITLE_H = 44;
const HEAD_H = 46;
const TERM_H = 44;
const TERM_W = 190;
const GAP = 34; // vertical space between nodes — where arrows live
const BOX_PAD = 14;
const TITLE_FS = 13;
const DESC_FS = 11;
const TITLE_LH = 18;
const DESC_LH = 15;
const NUM_R = 12;

type Node = {
  step: Step;
  index: number;
  titleLines: string[];
  descLines: string[];
  h: number;
  y: number;
  lane: DeptColor;
};

/* ── text wrapping ─────────────────────────────────────────── */

/** Arabic and Latin both average ~0.52em advance at these sizes. */
function budget(widthPx: number, fontSize: number) {
  return Math.max(8, Math.floor(widthPx / (fontSize * 0.52)));
}

function wrap(text: string, widthPx: number, fontSize: number, maxLines: number): string[] {
  const t = (text || "").trim();
  if (!t) return [];
  const max = budget(widthPx, fontSize);
  const words = t.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= max) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word.length > max ? `${word.slice(0, max - 1)}…` : word;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);

  if (lines.length === maxLines) {
    // Signal that something was cut rather than silently dropping it.
    const consumed = lines.join(" ").replace(/…$/, "");
    if (consumed.length < t.length - 1) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] = last.length >= max ? `${last.slice(0, max - 1)}…` : `${last}…`;
    }
  }
  return lines;
}

/* ── layout ────────────────────────────────────────────────── */

function layout(steps: Step[], isAr: boolean): { nodes: Node[]; height: number } {
  const visible = steps.filter((s) => !s.hidden);
  const textW = LANE_W - BOX_PAD * 2 - NUM_R * 2 - 10;

  let y = TITLE_H + HEAD_H + 8 + GAP + TERM_H + GAP; // title, lane heads, start pill
  const nodes: Node[] = visible.map((step, index) => {
    const isDecision = step.kind === "decision";
    const wrapW = isDecision ? textW * 0.72 : textW;
    const titleLines = wrap(isAr ? step.title_ar : step.title_en, wrapW, TITLE_FS, 2);
    const descLines = wrap(isAr ? step.desc_ar : step.desc_en, wrapW, DESC_FS, 2);
    const content = titleLines.length * TITLE_LH + descLines.length * DESC_LH;
    const h = Math.max(isDecision ? 92 : 66, content + BOX_PAD * 2 + 6);
    const node: Node = {
      step,
      index,
      titleLines: titleLines.length ? titleLines : [isAr ? "بدون عنوان" : "Untitled"],
      descLines,
      h,
      y,
      lane: step.color,
    };
    y += h + GAP;
    return node;
  });

  return { nodes, height: y + TERM_H + 20 };
}

/* ── component ─────────────────────────────────────────────── */

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
  const labels = isAr ? LEGEND_AR : LEGEND_EN;
  const { nodes, height } = layout(steps, isAr);

  // RTL reads right-to-left, so the internal lane (where work starts) sits on the right.
  const laneX = (lane: DeptColor) => {
    const i = LANES.indexOf(lane);
    const slot = isAr ? 2 - i : i;
    return PAD_X + slot * (LANE_W + LANE_GAP);
  };
  const laneCx = (lane: DeptColor) => laneX(lane) + LANE_W / 2;

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const startLane = first?.lane ?? "m";
  const endLane = last?.lane ?? "m";
  const startY = TITLE_H + HEAD_H + 8 + GAP;
  const endY = height - TERM_H - 20;
  const lanesTop = TITLE_H;

  return (
    <svg
      width={W}
      height={height}
      viewBox={`0 0 ${W} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        background: "#fbfaf6",
        fontFamily: "var(--font-poster, var(--font-cairo)), Tahoma, sans-serif",
      }}
    >
      <defs>
        {LANES.map((c) => (
          <marker
            key={c}
            id={`fc-arrow-${c}`}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0.5 L10,5 L0,9.5 z" fill={COLOR_HEX[c]} />
          </marker>
        ))}
        <marker id="fc-arrow-n" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0.5 L10,5 L0,9.5 z" fill="#8a8a8a" />
        </marker>
        <filter id="fc-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.13" />
        </filter>
      </defs>

      {title && (
        <text x={W / 2} y={28} textAnchor="middle" fontSize="19" fontWeight="700" fill="#7a0020">
          {title}
        </text>
      )}

      {/* lanes */}
      {LANES.map((lane, i) => {
        const x = laneX(lane);
        return (
          <g key={lane}>
            <rect
              x={x}
              y={lanesTop}
              width={LANE_W}
              height={height - lanesTop - 10}
              rx="12"
              fill={COLOR_HEX[lane]}
              opacity="0.045"
            />
            <rect x={x} y={lanesTop} width={LANE_W} height={HEAD_H} rx="12" fill={COLOR_HEX[lane]} />
            <text
              x={x + LANE_W / 2}
              y={lanesTop + HEAD_H / 2 + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#ffffff"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}

      {/* links */}
      {nodes.length > 0 && (
        <Link
          from={{ cx: laneCx(startLane), bottom: startY + TERM_H }}
          to={{ cx: laneCx(first.lane), top: first.y }}
          color="#8a8a8a"
          marker="fc-arrow-n"
        />
      )}

      {nodes.slice(0, -1).map((node, i) => {
        const next = nodes[i + 1];
        return (
          <Link
            key={i}
            from={{ cx: laneCx(node.lane), bottom: node.y + node.h }}
            to={{ cx: laneCx(next.lane), top: next.y }}
            color={COLOR_HEX[next.lane]}
            marker={`fc-arrow-${next.lane}`}
            dashed={node.lane !== next.lane}
            label={node.step.kind === "decision" ? (isAr ? "نعم" : "Yes") : undefined}
          />
        );
      })}

      {nodes.length > 0 && (
        <Link
          from={{ cx: laneCx(last.lane), bottom: last.y + last.h }}
          to={{ cx: laneCx(endLane), top: endY }}
          color="#8a8a8a"
          marker="fc-arrow-n"
        />
      )}

      {/* start / end terminators */}
      {nodes.length > 0 && (
        <>
          <Terminator
            cx={laneCx(startLane)}
            y={startY}
            label={isAr ? "بداية الإجراء" : "Start"}
            color={COLOR_HEX[startLane]}
          />
          <Terminator
            cx={laneCx(endLane)}
            y={endY}
            label={isAr ? "نهاية الإجراء" : "End"}
            color={COLOR_HEX[endLane]}
            filled
          />
        </>
      )}

      {/* nodes */}
      {nodes.map((node) => (
        <NodeShape key={node.index} node={node} x={laneX(node.lane)} isAr={isAr} />
      ))}

      {nodes.length === 0 && (
        <text x={W / 2} y={TITLE_H + HEAD_H + 60} textAnchor="middle" fontSize="14" fill="#999999">
          {isAr ? "أضف خطوات لتوليد المخطط" : "Add steps to generate the flowchart"}
        </text>
      )}
    </svg>
  );
}

/* ── pieces ────────────────────────────────────────────────── */

function Terminator({
  cx,
  y,
  label,
  color,
  filled,
}: {
  cx: number;
  y: number;
  label: string;
  color: string;
  filled?: boolean;
}) {
  return (
    <g filter="url(#fc-shadow)">
      <rect
        x={cx - TERM_W / 2}
        y={y}
        width={TERM_W}
        height={TERM_H}
        rx={TERM_H / 2}
        fill={filled ? color : "#ffffff"}
        stroke={color}
        strokeWidth="2.5"
      />
      <text
        x={cx}
        y={y + TERM_H / 2 + 5}
        textAnchor="middle"
        fontSize="13.5"
        fontWeight="700"
        fill={filled ? "#ffffff" : color}
      >
        {label}
      </text>
    </g>
  );
}

function Link({
  from,
  to,
  color,
  marker,
  dashed,
  label,
}: {
  from: { cx: number; bottom: number };
  to: { cx: number; top: number };
  color: string;
  marker: string;
  dashed?: boolean;
  label?: string;
}) {
  const straight = Math.abs(from.cx - to.cx) < 1;
  const midY = from.bottom + (to.top - from.bottom) / 2;
  const d = straight
    ? `M ${from.cx} ${from.bottom} L ${to.cx} ${to.top}`
    : `M ${from.cx} ${from.bottom} L ${from.cx} ${midY} L ${to.cx} ${midY} L ${to.cx} ${to.top}`;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "7 5" : undefined}
        markerEnd={`url(#${marker})`}
      />
      {label && (
        <>
          <rect x={from.cx - 20} y={from.bottom + 4} width="40" height="16" rx="8" fill="#fbfaf6" />
          <text x={from.cx} y={from.bottom + 16} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={color}>
            {label}
          </text>
        </>
      )}
    </g>
  );
}

function NodeShape({ node, x, isAr }: { node: Node; x: number; isAr: boolean }) {
  const color = COLOR_HEX[node.lane];
  const cx = x + LANE_W / 2;
  const cy = node.y + node.h / 2;
  const isDecision = node.step.kind === "decision";

  const numCx = isAr ? x + LANE_W - BOX_PAD - NUM_R : x + BOX_PAD + NUM_R;
  const textX = isAr ? numCx - NUM_R - 10 : numCx + NUM_R + 10;
  const anchor = isAr ? "end" : "start";

  // Text block is vertically centred inside the shape.
  const contentH = node.titleLines.length * TITLE_LH + node.descLines.length * DESC_LH;
  let ty = cy - contentH / 2 + TITLE_FS;

  const titleY: number[] = [];
  const descY: number[] = [];
  node.titleLines.forEach(() => {
    titleY.push(ty);
    ty += TITLE_LH;
  });
  node.descLines.forEach(() => {
    descY.push(ty);
    ty += DESC_LH;
  });

  return (
    <g filter="url(#fc-shadow)">
      {isDecision ? (
        <polygon
          points={`${cx},${node.y} ${x + LANE_W},${cy} ${cx},${node.y + node.h} ${x},${cy}`}
          fill="#ffffff"
          stroke={color}
          strokeWidth="2.5"
        />
      ) : (
        <>
          <rect
            x={x}
            y={node.y}
            width={LANE_W}
            height={node.h}
            rx="10"
            fill="#ffffff"
            stroke={color}
            strokeWidth="2"
          />
          {/* accent bar on the reading edge */}
          <rect
            x={isAr ? x + LANE_W - 6 : x}
            y={node.y + 2}
            width="6"
            height={node.h - 4}
            rx="3"
            fill={color}
          />
        </>
      )}

      <circle cx={isDecision ? cx : numCx} cy={isDecision ? node.y + 20 : node.y + BOX_PAD + NUM_R} r={NUM_R} fill={color} />
      <text
        x={isDecision ? cx : numCx}
        y={(isDecision ? node.y + 20 : node.y + BOX_PAD + NUM_R) + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#ffffff"
      >
        {node.index + 1}
      </text>

      {node.titleLines.map((line, i) => (
        <text
          key={`t${i}`}
          x={isDecision ? cx : textX}
          y={titleY[i]}
          textAnchor={isDecision ? "middle" : anchor}
          fontSize={TITLE_FS}
          fontWeight="700"
          fill="#1c1c1c"
        >
          {line}
        </text>
      ))}
      {node.descLines.map((line, i) => (
        <text
          key={`d${i}`}
          x={isDecision ? cx : textX}
          y={descY[i]}
          textAnchor={isDecision ? "middle" : anchor}
          fontSize={DESC_FS}
          fill="#666666"
        >
          {line}
        </text>
      ))}
    </g>
  );
}
