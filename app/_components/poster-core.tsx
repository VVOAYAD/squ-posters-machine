"use client";

/**
 * The poster document — one shape used by both screens:
 *   /poster            → free-form generator (nothing persisted)
 *   /section/…/[id]    → a documented procedure (persisted per section)
 *
 * Everything visual lives here so the two screens can never drift apart.
 */

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import { AlignmentType, BorderStyle, Document, Packer, Paragraph, TextRun } from "docx";
import {
  BiField,
  BiRowList,
  BiTextField,
  Field,
  HideMap,
  Lang,
  PosterFooter,
  PosterHeader,
  Section,
} from "./Shared";
import type { Align, FontOption } from "./fonts";

export type DeptColor = "m" | "b" | "g";

export type Step = {
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  color: DeptColor;
  hidden?: boolean;
  /** Drawn as a diamond in the flowchart. Absent means a normal process step. */
  kind?: "step" | "decision";
};

export type PosterData = {
  refValue: string;
  date_ar: string;
  date_en: string;
  procedure_ar: string;
  procedure_en: string;
  dept_ar: string;
  dept_en: string;
  contact_ar: string;
  contact_en: string;
  contactSub_ar: string;
  contactSub_en: string;
  docsHead_ar: string;
  docsHead_en: string;
  docsIntro_ar: string;
  docsIntro_en: string;
  docs_ar: string[];
  docs_en: string[];
  stepsHead_ar: string;
  stepsHead_en: string;
  steps: Step[];
  showLegend: boolean;
  phones: string;
  email: string;
  hide: HideMap;
};

export const LEGEND_AR = ["إجراء داخلي", "دائرة التدقيق الداخلي", "وزارة المالية"];
export const LEGEND_EN = ["Internal", "Internal Audit", "Ministry of Finance"];

export const COLOR_HEX: Record<DeptColor, string> = {
  m: "#7a0020",
  b: "#1a3f8a",
  g: "#1a6b3a",
};

export const DEFAULTS: PosterData = {
  refValue: "01/2026",
  date_ar: "أبريل 2026",
  date_en: "April 2026",
  procedure_ar: "دفع المستحقات المالية للمستفيدين (الشركات)",
  procedure_en: "Payment of Financial Dues to Beneficiaries (Companies)",
  dept_ar: "المصروفات العامة",
  dept_en: "General Expenditures",
  contact_ar: "داخلي : 5128",
  contact_en: "Ext. 5128",
  contactSub_ar: "المحول للتواصل",
  contactSub_en: "Direct extension",
  docsHead_ar: "المستندات المطلوبة (مؤيدات الصرف)",
  docsHead_en: "Required Documents (Disbursement Evidence)",
  docsIntro_ar: "يتم تنفيذ خطوات الإجراء بإرفاق مؤيدات الصرف الآتية",
  docsIntro_en: "The procedure is executed by attaching the following supporting documents",
  docs_ar: [
    "عروض الأسعار من الموردين",
    "محضر اجتماع لجنة الممارسات الداخلية",
    "تحليل الأسعار",
    "قرار لجنة الممارسات",
    "أمر الشراء",
    "استمارة إثبات تسليم البضاعة في مخازن الجامعة",
    "الفاتورة",
    "أي مؤيدات صرف أخرى ذات صلة",
  ],
  docs_en: [
    "Quotations from suppliers",
    "Internal practices committee meeting minutes",
    "Price analysis",
    "Practices committee decision",
    "Purchase order",
    "Goods receipt form (University warehouses)",
    "Invoice",
    "Any other relevant disbursement evidence",
  ],
  stepsHead_ar: "خطوات الإجراء",
  stepsHead_en: "Procedure Steps",
  steps: [
    { color: "m", title_ar: "استلام المعاملة / الطلب", title_en: "Receive transaction / request", desc_ar: "الطلب في نظام موارد (Odoo)", desc_en: "Request submitted via Mawared (Odoo) system" },
    { color: "m", title_ar: "استلام الفاتورة", title_en: "Receive the invoice", desc_ar: "من الشركات عبر البريد الإلكتروني", desc_en: "From companies via email" },
    { color: "m", title_ar: "مراجعة المعاملة / الطلب من المختصين", title_en: "Review by specialists", desc_ar: "يتم تنفيذ هذه الخطوة عبر نظام موارد (Odoo) ونظام وزارة المالية", desc_en: "Executed via Mawared (Odoo) and the Ministry of Finance system" },
    { color: "m", title_ar: "إعداد سند الصرف", title_en: "Prepare disbursement voucher", desc_ar: "إعداد سند الصرف في النظام المالي بوزارة المالية ثم في نظام موارد (Odoo)", desc_en: "Prepared in the Ministry of Finance system, then in Mawared (Odoo)" },
    { color: "m", title_ar: "اعتماد المعاملة من قبل المخولين بالصرف", title_en: "Approval by authorized disbursement officials", desc_ar: "يتم تنفيذ هذه الخطوة عبر نظام موارد (Odoo) ونظام وزارة المالية", desc_en: "Executed via Mawared (Odoo) and the Ministry of Finance system" },
    { color: "b", title_ar: "مراجعة سند الصرف من قبل المختصين بدائرة التدقيق الداخلي", title_en: "Review by Internal Audit specialists", desc_ar: "يتم تنفيذ هذه الخطوة عبر نظام موارد (Odoo) ونظام وزارة المالية", desc_en: "Executed via Mawared (Odoo) and the Ministry of Finance system" },
    { color: "b", title_ar: "اعتماد سند الصرف من قبل المخولين بدائرة التدقيق الداخلي", title_en: "Approval by Internal Audit authorized officials", desc_ar: "يتم تنفيذ الخطوة إلكترونياً عبر نظام وزارة المالية", desc_en: "Executed electronically via the Ministry of Finance system" },
    { color: "g", title_ar: "استلام ومراجعة واعتماد وزارة المالية", title_en: "Ministry of Finance receipt, review, and approval", desc_ar: "يتم تنفيذ الخطوة إلكترونياً", desc_en: "Executed electronically" },
    { color: "g", title_ar: "تحويل المستحقات المالية إلى المستفيدين (الشركات) من قبل وزارة المالية", title_en: "Transfer of financial dues to beneficiaries (companies) by the Ministry of Finance", desc_ar: "يتم تنفيذ هذه الخطوة عبر النظام المالي لوزارة المالية برقم المستفيد", desc_en: "Executed via the Ministry of Finance system using the beneficiary's number" },
  ],
  showLegend: true,
  phones: "5102 | 5126 | 5142 | 5113",
  email: "FINANCE@SQU.EDU.OM",
  hide: {},
};

/** A fresh, empty procedure poster — only the section name is pre-filled. */
export function blankPoster(deptAr: string, deptEn: string): PosterData {
  return {
    refValue: "",
    date_ar: "",
    date_en: "",
    procedure_ar: "",
    procedure_en: "",
    dept_ar: deptAr,
    dept_en: deptEn,
    contact_ar: "",
    contact_en: "",
    contactSub_ar: "",
    contactSub_en: "",
    docsHead_ar: "المستندات المطلوبة",
    docsHead_en: "Required Documents",
    docsIntro_ar: "",
    docsIntro_en: "",
    docs_ar: [""],
    docs_en: [""],
    stepsHead_ar: "خطوات الإجراء",
    stepsHead_en: "Procedure Steps",
    steps: [{ color: "m", title_ar: "", title_en: "", desc_ar: "", desc_en: "" }],
    showLegend: true,
    phones: "5102 | 5126 | 5142 | 5113",
    email: "FINANCE@SQU.EDU.OM",
    hide: {},
  };
}

/** Fills in any key a stored poster is missing, so old rows never crash a new field. */
export function normalizePoster(raw: unknown, deptAr = "", deptEn = ""): PosterData {
  const base = blankPoster(deptAr, deptEn);
  if (!raw || typeof raw !== "object") return base;
  const merged = { ...base, ...(raw as Partial<PosterData>) };
  return {
    ...merged,
    docs_ar: merged.docs_ar?.length ? merged.docs_ar : [""],
    docs_en: merged.docs_en?.length ? merged.docs_en : [""],
    steps: merged.steps?.length ? merged.steps : base.steps,
    hide: merged.hide ?? {},
  };
}

/* ══ preview ═══════════════════════════════════════════════════ */

export function PosterPreview({ data, lang }: { data: PosterData; lang: Lang }) {
  const isAr = lang === "ar";
  const hide = data.hide;
  const procedure = isAr ? data.procedure_ar : data.procedure_en;
  const dept = isAr ? data.dept_ar : data.dept_en;
  const contact = isAr ? data.contact_ar : data.contact_en;
  const contactSub = isAr ? data.contactSub_ar : data.contactSub_en;
  const docsHead = isAr ? data.docsHead_ar : data.docsHead_en;
  const docsIntro = isAr ? data.docsIntro_ar : data.docsIntro_en;
  const docs = (isAr ? data.docs_ar : data.docs_en).filter((d) => d.trim());
  const stepsHead = isAr ? data.stepsHead_ar : data.stepsHead_en;

  const lbl = isAr
    ? { proc: "وصف الإجراء", dept: "القسم المختص", contact: "رئيس القسم" }
    : { proc: "Procedure", dept: "Department", contact: "Department Head" };

  const legendLabels = isAr ? LEGEND_AR : LEGEND_EN;
  const visibleSteps = data.steps.filter((s) => !s.hidden);

  const infoCells = [
    !hide.procedure && { lbl: lbl.proc, val: procedure, sub: "" },
    !hide.dept && { lbl: lbl.dept, val: dept, sub: "" },
    !hide.contact && { lbl: lbl.contact, val: contact, sub: !hide.contactSub ? contactSub : "" },
  ].filter(Boolean) as { lbl: string; val: string; sub: string }[];

  return (
    <div className={`poster-canvas ${isAr ? "rtl" : "ltr"}`}>
      <PosterHeader />

      {infoCells.length > 0 && (
        <div className="pcp-info-bar">
          {infoCells.map((cell, i) => (
            <div key={i} className="pcp-info-cell">
              <div className="pcp-info-lbl">{cell.lbl}</div>
              <div className="pcp-info-val">{cell.val}</div>
              {cell.sub && <div className="pcp-info-sub">{cell.sub}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="pcp-body">
        <div className="pcp-docs-col">
          {!hide.docsHead && <div className="pcp-docs-head">{docsHead}</div>}
          {docsIntro && !hide.docsIntro && <div className="pcp-docs-intro">{docsIntro}</div>}
          {docs.map((item, i) => (
            <div key={i} className="pcp-doc-row">
              <div className="pcp-dn">{i + 1}</div>
              <div>{item}</div>
            </div>
          ))}
        </div>

        <div className="pcp-steps-col">
          {!hide.stepsHead && <div className="pcp-steps-head">{stepsHead}</div>}
          <div className="pcp-timeline">
            {visibleSteps.map((step, i) => {
              const isLast = i === visibleSteps.length - 1;
              const cardClass = isLast ? "last" : step.color === "b" ? "blue" : step.color === "g" ? "green" : "";
              return (
                <div key={i} className="pcp-step-item">
                  <div className="pcp-node-col">
                    <div className={`pcp-node ${step.color}`}>{i + 1}</div>
                    {!isLast && <div className="pcp-connector" />}
                  </div>
                  <div className={`pcp-step-card ${cardClass}`}>
                    <div className="pcp-st">{isAr ? step.title_ar : step.title_en}</div>
                    {(isAr ? step.desc_ar : step.desc_en) && (
                      <div className="pcp-sd">{isAr ? step.desc_ar : step.desc_en}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {data.showLegend && (
        <div className="pcp-legend">
          <div className="pcp-legend-item">
            <div className="pcp-ldot m" />
            <span>{legendLabels[0]}</span>
          </div>
          <div className="pcp-lsep" />
          <div className="pcp-legend-item">
            <div className="pcp-ldot b" />
            <span>{legendLabels[1]}</span>
          </div>
          <div className="pcp-lsep" />
          <div className="pcp-legend-item">
            <div className="pcp-ldot g" />
            <span>{legendLabels[2]}</span>
          </div>
        </div>
      )}

      <PosterFooter
        phones={data.phones}
        email={data.email}
        rtl={isAr}
        hidePhones={!!hide.phones}
        hideEmail={!!hide.email}
        hideMeta={!!hide.refValue && !!hide.date}
        meta={
          isAr
            ? `${!hide.refValue ? `رقم المنشور: ${data.refValue}` : ""}${!hide.refValue && !hide.date ? " | " : ""}${!hide.date ? `التاريخ: ${data.date_ar}` : ""}`
            : `${!hide.refValue ? `Publication No.: ${data.refValue}` : ""}${!hide.refValue && !hide.date ? " | " : ""}${!hide.date ? `Date: ${data.date_en}` : ""}`
        }
      />
    </div>
  );
}

/* ══ step editor ═══════════════════════════════════════════════ */

export function StepEditor({
  steps,
  onChange,
  lang,
}: {
  steps: Step[];
  onChange: (steps: Step[]) => void;
  lang: Lang;
}) {
  const isAr = lang === "ar";
  const updateStep = (i: number, patch: Partial<Step>) => {
    const next = [...steps];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const colorBg = (c: DeptColor) =>
    c === "m" ? "bg-[#7a0020]" : c === "b" ? "bg-[#1a3f8a]" : "bg-[#1a6b3a]";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500 font-medium">{isAr ? "خطوات" : "Steps"}</span>
        <button
          onClick={() =>
            onChange([...steps, { color: "m", title_ar: "", title_en: "", desc_ar: "", desc_en: "" }])
          }
          className="text-[10px] text-[#7a0020] font-bold flex items-center gap-1 hover:underline"
          type="button"
        >
          <Plus size={12} /> add step
        </button>
      </div>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const hidden = !!step.hidden;
          return (
            <div
              key={i}
              className={`border rounded p-2 ${
                hidden ? "border-[#7a0020]/30 bg-[#7a0020]/5" : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`${colorBg(step.color)} text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      hidden ? "opacity-40" : ""
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex gap-0.5">
                    {(["m", "b", "g"] as DeptColor[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => updateStep(i, { color: c })}
                        type="button"
                        className={`${colorBg(c)} w-5 h-5 rounded-full text-white text-[9px] font-bold ${
                          step.color === c ? "ring-2 ring-[#c9a84c]" : "opacity-50"
                        }`}
                        title={c === "m" ? "Internal" : c === "b" ? "Audit" : "Ministry"}
                      >
                        {c.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateStep(i, { kind: step.kind === "decision" ? "step" : "decision" })
                    }
                    type="button"
                    title={
                      step.kind === "decision"
                        ? "قرار — يُرسم كمعيّن في المخطط"
                        : "اجعلها نقطة قرار في المخطط"
                    }
                    className={`px-1 rounded text-[13px] leading-none ${
                      step.kind === "decision"
                        ? "text-[#c9a84c] bg-[#c9a84c]/15"
                        : "text-neutral-400 hover:text-[#7a0020]"
                    }`}
                  >
                    ◇
                  </button>
                  <button
                    onClick={() => updateStep(i, { hidden: !hidden })}
                    className={`p-0.5 rounded ${
                      hidden ? "text-[#7a0020] bg-[#7a0020]/10" : "text-neutral-400 hover:text-[#7a0020]"
                    }`}
                    title={hidden ? "Currently hidden — click to show" : "Hide this step from poster"}
                    type="button"
                  >
                    {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={() => onChange(steps.filter((_, idx) => idx !== i))}
                    className="text-neutral-400 hover:text-red-600"
                    aria-label="remove step"
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder={isAr ? "عنوان" : "Title"}
                  value={isAr ? step.title_ar : step.title_en}
                  onChange={(e) =>
                    updateStep(i, isAr ? { title_ar: e.target.value } : { title_en: e.target.value })
                  }
                  dir={isAr ? "rtl" : "ltr"}
                  className={`w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none ${
                    hidden ? "italic text-neutral-400" : ""
                  }`}
                />
                <textarea
                  placeholder={isAr ? "وصف" : "Description"}
                  value={isAr ? step.desc_ar : step.desc_en}
                  onChange={(e) =>
                    updateStep(i, isAr ? { desc_ar: e.target.value } : { desc_en: e.target.value })
                  }
                  dir={isAr ? "rtl" : "ltr"}
                  rows={2}
                  className={`w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:border-[#7a0020] focus:outline-none leading-relaxed ${
                    hidden ? "italic text-neutral-400" : ""
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══ the left-hand field stack, shared by both screens ═════════ */

export function PosterFields({
  data,
  update,
  toggleHide,
  lang,
  lockDept,
}: {
  data: PosterData;
  update: <K extends keyof PosterData>(key: K, val: PosterData[K]) => void;
  toggleHide: (key: string) => void;
  lang: Lang;
  /** On a procedure the section owns the department name, so it isn't editable there. */
  lockDept?: boolean;
}) {
  return (
    <>
      <Section title="رقم وتاريخ · Reference & Date">
        <Field
          label="Publication No."
          value={data.refValue}
          onChange={(v) => update("refValue", v)}
          hideKey="refValue"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        <BiField
          lang={lang}
          labelAr="التاريخ"
          labelEn="Date"
          valueAr={data.date_ar}
          valueEn={data.date_en}
          onChangeAr={(v) => update("date_ar", v)}
          onChangeEn={(v) => update("date_en", v)}
          hideKey="date"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
      </Section>

      <Section title="الإجراء والقسم · Procedure & Department">
        <BiTextField
          lang={lang}
          labelAr="وصف الإجراء"
          labelEn="Procedure"
          valueAr={data.procedure_ar}
          valueEn={data.procedure_en}
          onChangeAr={(v) => update("procedure_ar", v)}
          onChangeEn={(v) => update("procedure_en", v)}
          rows={2}
          hideKey="procedure"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        {!lockDept && (
          <BiField
            lang={lang}
            labelAr="القسم"
            labelEn="Department"
            valueAr={data.dept_ar}
            valueEn={data.dept_en}
            onChangeAr={(v) => update("dept_ar", v)}
            onChangeEn={(v) => update("dept_en", v)}
            hideKey="dept"
            hide={data.hide}
            onHideToggle={toggleHide}
          />
        )}
        <BiField
          lang={lang}
          labelAr="رئيس القسم"
          labelEn="Dept. Head"
          valueAr={data.contact_ar}
          valueEn={data.contact_en}
          onChangeAr={(v) => update("contact_ar", v)}
          onChangeEn={(v) => update("contact_en", v)}
          hideKey="contact"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        <BiField
          lang={lang}
          labelAr="ملاحظة"
          labelEn="Sub-note"
          valueAr={data.contactSub_ar}
          valueEn={data.contactSub_en}
          onChangeAr={(v) => update("contactSub_ar", v)}
          onChangeEn={(v) => update("contactSub_en", v)}
          hideKey="contactSub"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
      </Section>

      <Section title="المستندات · Documents">
        <BiField
          lang={lang}
          labelAr="عنوان"
          labelEn="Heading"
          valueAr={data.docsHead_ar}
          valueEn={data.docsHead_en}
          onChangeAr={(v) => update("docsHead_ar", v)}
          onChangeEn={(v) => update("docsHead_en", v)}
          hideKey="docsHead"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        <BiField
          lang={lang}
          labelAr="مقدمة"
          labelEn="Intro"
          valueAr={data.docsIntro_ar}
          valueEn={data.docsIntro_en}
          onChangeAr={(v) => update("docsIntro_ar", v)}
          onChangeEn={(v) => update("docsIntro_en", v)}
          hideKey="docsIntro"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        <BiRowList
          lang={lang}
          labelAr="عناصر"
          labelEn="Items"
          itemsAr={data.docs_ar}
          itemsEn={data.docs_en}
          onChangeAr={(items) => update("docs_ar", items)}
          onChangeEn={(items) => update("docs_en", items)}
        />
      </Section>

      <Section title="الخطوات · Steps" subtitle="M=Internal · B=Audit · G=Ministry">
        <BiField
          lang={lang}
          labelAr="عنوان قائمة الخطوات"
          labelEn="Steps heading"
          valueAr={data.stepsHead_ar}
          valueEn={data.stepsHead_en}
          onChangeAr={(v) => update("stepsHead_ar", v)}
          onChangeEn={(v) => update("stepsHead_en", v)}
          hideKey="stepsHead"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        <StepEditor steps={data.steps} onChange={(steps) => update("steps", steps)} lang={lang} />
      </Section>

      <Section
        title="الشريط الملوّن · Color legend"
        toggle={{ on: data.showLegend, set: (v) => update("showLegend", v) }}
      >
        <p className="text-[10px] text-neutral-500">
          Always shows the three department colors below the steps timeline.
        </p>
      </Section>

      <Section title="التذييل · Footer">
        <Field
          label={lang === "ar" ? "الهواتف" : "Phones"}
          value={data.phones}
          onChange={(v) => update("phones", v)}
          hideKey="phones"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
        <Field
          label={lang === "ar" ? "البريد" : "Email"}
          value={data.email}
          onChange={(v) => update("email", v)}
          hideKey="email"
          hide={data.hide}
          onHideToggle={toggleHide}
        />
      </Section>
    </>
  );
}

/* ══ exports ═══════════════════════════════════════════════════ */

export async function exportPng(node: HTMLElement | null, filename: string) {
  if (!node) return;
  // First pass warms webfonts/images; the second is the one we keep.
  await htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: true });
  const dataUrl = await htmlToImage.toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#f5f0eb",
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function alignToDocx(a: Align): (typeof AlignmentType)[keyof typeof AlignmentType] {
  switch (a) {
    case "left":
      return AlignmentType.LEFT;
    case "center":
      return AlignmentType.CENTER;
    case "right":
      return AlignmentType.RIGHT;
    case "justify":
      return AlignmentType.JUSTIFIED;
  }
}

export async function exportDocx(
  data: PosterData,
  font: FontOption,
  sizeScale: number,
  bodyAlign: Align,
  filename: string,
) {
  const MAROON = "7A0020";
  const GOLD_DK = "A07828";
  const SUB = "555555";
  const hide = data.hide;
  const visibleSteps = data.steps.filter((s) => !s.hidden);
  const bodyAlignAr = alignToDocx(bodyAlign);

  const run = (text: string, opts: { bold?: boolean; size?: number; color?: string; rtl?: boolean } = {}) =>
    new TextRun({
      text,
      bold: opts.bold,
      size: Math.round((opts.size ?? 12) * 2 * sizeScale),
      color: opts.color,
      font: font.docxFamily,
      rightToLeft: opts.rtl,
    });
  const arRun = (t: string, o: { bold?: boolean; size?: number; color?: string } = {}) =>
    run(t, { ...o, rtl: true });
  const enRun = (t: string, o: { bold?: boolean; size?: number; color?: string } = {}) => run(t, o);

  const divider = () =>
    new Paragraph({
      children: [new TextRun({ text: "" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD_DK } },
      spacing: { after: 200 },
    });

  const arChildren = [
    new Paragraph({
      children: [arRun("دائرة الشؤون المالية – جامعة السلطان قابوس", { bold: true, size: 14, color: MAROON })],
      bidirectional: true,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    ...(!hide.refValue || !hide.date
      ? [
          new Paragraph({
            children: [
              ...(!hide.refValue ? [arRun(`رقم المنشور: ${data.refValue}`, { bold: true, size: 11, color: MAROON })] : []),
              ...(!hide.refValue && !hide.date ? [arRun("\t\t\t\t")] : []),
              ...(!hide.date ? [arRun(`التاريخ: ${data.date_ar}`, { bold: true, size: 11, color: MAROON })] : []),
            ],
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
          }),
        ]
      : []),
    new Paragraph({ children: [arRun("")] }),
    ...(!hide.procedure
      ? [
          new Paragraph({
            children: [arRun(data.procedure_ar, { bold: true, size: 18, color: MAROON })],
            bidirectional: true,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...(!hide.dept || !hide.contact
      ? [
          new Paragraph({
            children: [
              arRun(
                [!hide.dept ? `القسم المختص: ${data.dept_ar}` : "", !hide.contact ? data.contact_ar : ""]
                  .filter(Boolean)
                  .join("  |  "),
                { size: 12, color: SUB },
              ),
            ],
            bidirectional: true,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ]
      : []),
    divider(),
    ...(!hide.docsHead
      ? [
          new Paragraph({
            children: [arRun(data.docsHead_ar, { bold: true, size: 14, color: MAROON })],
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...(data.docsIntro_ar && !hide.docsIntro
      ? [
          new Paragraph({
            children: [arRun(data.docsIntro_ar, { size: 11, color: SUB })],
            bidirectional: true,
            alignment: bodyAlignAr,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...data.docs_ar
      .filter((d) => d.trim())
      .map(
        (item, i) =>
          new Paragraph({
            children: [arRun(`${i + 1}. ${item}`, { size: 12 })],
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
          }),
      ),
    new Paragraph({ children: [arRun("")] }),
    ...(!hide.stepsHead
      ? [
          new Paragraph({
            children: [arRun(data.stepsHead_ar, { bold: true, size: 14, color: MAROON })],
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...visibleSteps.flatMap((step, i) => [
      new Paragraph({
        children: [arRun(`${i + 1}. ${step.title_ar}`, { bold: true, size: 12, color: MAROON })],
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 60 },
      }),
      ...(step.desc_ar
        ? [
            new Paragraph({
              children: [arRun(step.desc_ar, { size: 11, color: SUB })],
              bidirectional: true,
              alignment: bodyAlignAr,
              spacing: { after: 140 },
            }),
          ]
        : []),
    ]),
    divider(),
    ...(!hide.phones || !hide.email
      ? [
          new Paragraph({
            children: [
              arRun(
                `للاستفسار: ${[!hide.email ? data.email : "", !hide.phones ? data.phones : ""]
                  .filter(Boolean)
                  .join("  |  ")}`,
                { size: 10, color: SUB },
              ),
            ],
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
          }),
        ]
      : []),
  ];

  const enChildren = [
    new Paragraph({
      children: [enRun("Department of Financial Affairs – Sultan Qaboos University", { bold: true, size: 13, color: MAROON })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    ...(!hide.refValue || !hide.date
      ? [
          new Paragraph({
            children: [
              ...(!hide.refValue ? [enRun(`Publication No.: ${data.refValue}`, { bold: true, size: 11, color: MAROON })] : []),
              ...(!hide.refValue && !hide.date ? [enRun("\t\t\t\t")] : []),
              ...(!hide.date ? [enRun(`Date: ${data.date_en}`, { bold: true, size: 11, color: MAROON })] : []),
            ],
            alignment: AlignmentType.LEFT,
          }),
        ]
      : []),
    new Paragraph({ children: [enRun("")] }),
    ...(!hide.procedure
      ? [
          new Paragraph({
            children: [enRun(data.procedure_en, { bold: true, size: 18, color: MAROON })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...(!hide.dept || !hide.contact
      ? [
          new Paragraph({
            children: [
              enRun(
                [!hide.dept ? `Department: ${data.dept_en}` : "", !hide.contact ? data.contact_en : ""]
                  .filter(Boolean)
                  .join("  |  "),
                { size: 12, color: SUB },
              ),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ]
      : []),
    divider(),
    ...(!hide.docsHead
      ? [
          new Paragraph({
            children: [enRun(data.docsHead_en, { bold: true, size: 14, color: MAROON })],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...(data.docsIntro_en && !hide.docsIntro
      ? [
          new Paragraph({
            children: [enRun(data.docsIntro_en, { size: 11, color: SUB })],
            alignment: alignToDocx(bodyAlign),
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...data.docs_en
      .filter((d) => d.trim())
      .map(
        (item, i) =>
          new Paragraph({
            children: [enRun(`${i + 1}. ${item}`, { size: 12 })],
            alignment: AlignmentType.LEFT,
          }),
      ),
    new Paragraph({ children: [enRun("")] }),
    ...(!hide.stepsHead
      ? [
          new Paragraph({
            children: [enRun(data.stepsHead_en, { bold: true, size: 14, color: MAROON })],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
          }),
        ]
      : []),
    ...visibleSteps.flatMap((step, i) => [
      new Paragraph({
        children: [enRun(`${i + 1}. ${step.title_en}`, { bold: true, size: 12, color: MAROON })],
        alignment: AlignmentType.LEFT,
        spacing: { after: 60 },
      }),
      ...(step.desc_en
        ? [
            new Paragraph({
              children: [enRun(step.desc_en, { size: 11, color: SUB })],
              alignment: alignToDocx(bodyAlign),
              spacing: { after: 140 },
            }),
          ]
        : []),
    ]),
    divider(),
    ...(!hide.phones || !hide.email
      ? [
          new Paragraph({
            children: [
              enRun(
                `For inquiries: ${[!hide.email ? data.email : "", !hide.phones ? data.phones : ""]
                  .filter(Boolean)
                  .join("  |  ")}`,
                { size: 10, color: SUB },
              ),
            ],
            alignment: AlignmentType.LEFT,
          }),
        ]
      : []),
  ];

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1320, right: 1320 } } },
        children: [...arChildren, new Paragraph({ children: [enRun("")], pageBreakBefore: true }), ...enChildren],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
