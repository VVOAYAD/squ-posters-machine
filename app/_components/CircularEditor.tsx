"use client";

import { useRef, useState } from "react";
import { Download, FileText } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
} from "docx";
import { Field, PosterFooter, PosterHeader, RowList, Section, TextField } from "./Shared";

type CircularData = {
  refValue: string;
  date_ar: string;
  date_en: string;
  title_ar: string;
  title_en: string;
  titleSub_ar: string;
  titleSub_en: string;
  subject_ar: string;
  subject_en: string;
  body_ar: string;
  body_en: string;
  showNote: boolean;
  noteLabel_ar: string;
  noteLabel_en: string;
  note_ar: string;
  note_en: string;
  showDocs: boolean;
  docsHead_ar: string;
  docsHead_en: string;
  docsIntro_ar: string;
  docsIntro_en: string;
  docs_ar: string[];
  docs_en: string[];
  phones: string;
  email: string;
};

const DEFAULTS: CircularData = {
  refValue: "CIR/01-2026",
  date_ar: "10 مايو 2026م",
  date_en: "10 May 2026",
  title_ar: "تعميم",
  title_en: "CIRCULAR",
  titleSub_ar: "دائرة الشؤون المالية · جامعة السلطان قابوس",
  titleSub_en: "Department of Financial Affairs · Sultan Qaboos University",
  subject_ar: "ضرورة طلب صرف المستحقات المالية عبر نظام أودو (Odoo) دون غيره",
  subject_en: "Submission of Financial Disbursement Requests Through the Odoo System Only",
  body_ar: `في إطار حرص الجامعة على دفع المستحقات المالية للمستفيدين، ومساعي دائرة الشؤون المالية إلى عدم تأخّر صرف المبالغ لمستحقيها،

فنُحيطكم علماً بأنه يتعيّن لإجراء الصرف ودفع المستحقات المالية أن تُرفع المعاملات وطلبات الدفع في نظام أودو (Odoo) فقط، حيث إنه النظام المعني بدفع المستحقات المالية. وسعياً منا لسرعة تنفيذ الإجراءات وعدم التأخير في صرف المستحقات المالية، فيُرجى تكرماً رفع كافة المعاملات المالية المعنية بصرف المبالغ بشتى أنواعها في نظام أودو (Odoo)، مع إرفاق جميع المستندات المؤيدة للصرف.

شاكرين لكم حسن تعاونكم، ومُقدّرين التزامكم بما يحقق انسيابية العمل ودقة الإجراءات المالية في جامعتنا.`,
  body_en: `In line with the University's commitment to paying financial dues to beneficiaries, and the Department of Financial Affairs' efforts to prevent any delay in the disbursement of payments to those entitled to them,

please be informed that in order to process disbursements and the payment of financial dues, all transactions and payment requests must be submitted through the Odoo system only, as it is the system designated for the disbursement of financial dues. To ensure prompt execution and avoid any delay, we kindly request that all financial transactions related to the disbursement of payments — of all kinds — be submitted through the Odoo system, accompanied by all supporting documents.

Thank you for your cooperation and your commitment to procedures that uphold smooth operations and the accuracy of financial transactions across our university.`,
  showNote: true,
  noteLabel_ar: "ملاحظة بشأن نظام وصول:",
  noteLabel_en: "Note regarding the Wusool program:",
  note_ar: "نظام وصول غير معني بعمليات صرف المستحقات، لذا يُرجى عدم أخذ الموافقات باستحقاق صرف المبالغ منه — على أن تُرفع الطلبات في نظام أودو (Odoo)، وتُرفق المستندات الخاصة ببرنامج وصول في نظام أودو (Odoo) ضمن المستندات المؤيدة للصرف.",
  note_en: "The Wusool program is not designated for the disbursement of financial dues. Therefore, kindly do not obtain disbursement approvals through it. Requests must be submitted through the Odoo system, with any documents related to the Wusool program attached within the Odoo system as part of the supporting documents.",
  showDocs: true,
  docsHead_ar: "المؤيدات",
  docsHead_en: "Supporting Documents",
  docsIntro_ar: "المستندات المطلوب إرفاقها مع طلب الصرف على نظام أودو (Odoo)",
  docsIntro_en: "Documents to be attached with each disbursement request on the Odoo system",
  docs_ar: [
    "نموذج طلب الصرف الموقع والمعتمد",
    "الفواتير الأصلية والمستندات الداعمة",
    "الموافقات الإدارية والمالية المعتمدة",
    "صورة من العقد أو الاتفاقية (إن وُجد)",
    "مستندات برنامج وصول (في حال وجودها)",
    "بيانات الحساب البنكي للمستفيد",
    "محضر الاستلام / إنجاز الأعمال",
  ],
  docs_en: [
    "Signed and approved disbursement request form",
    "Original invoices and supporting evidence",
    "Required administrative & financial approvals",
    "Copy of the contract or agreement (if any)",
    "Wusool program documents (where applicable)",
    "Beneficiary's bank account details",
    "Receipt / completion-of-work report",
  ],
  phones: "5102 | 5126 | 5142 | 5113",
  email: "FINANCE@SQU.EDU.OM",
};

function DocsCol({ head, intro, items }: { head: string; intro: string; items: string[] }) {
  return (
    <div className="pc-docs-col">
      <div className="pc-docs-head">{head}</div>
      {intro && <div className="pc-docs-intro">{intro}</div>}
      {items.map((item, i) => (
        <div key={i} className="pc-doc-row">
          <div className="pc-dn">{i + 1}</div>
          <div>{item}</div>
        </div>
      ))}
    </div>
  );
}

function CircularPreview({ data, lang }: { data: CircularData; lang: "ar" | "en" }) {
  const isAr = lang === "ar";
  const refLabel = isAr ? "رقم التعميم:" : "Circular No.:";
  const dateLabel = isAr ? "التاريخ:" : "Date:";
  const date = isAr ? data.date_ar : data.date_en;
  const title = isAr ? data.title_ar : data.title_en;
  const titleSub = isAr ? data.titleSub_ar : data.titleSub_en;
  const subjectLabel = isAr ? "الموضوع" : "Subject";
  const subject = isAr ? data.subject_ar : data.subject_en;
  const body = isAr ? data.body_ar : data.body_en;
  const noteLabel = isAr ? data.noteLabel_ar : data.noteLabel_en;
  const noteBody = isAr ? data.note_ar : data.note_en;
  const docsHead = isAr ? data.docsHead_ar : data.docsHead_en;
  const docsIntro = isAr ? data.docsIntro_ar : data.docsIntro_en;
  const docs = isAr ? data.docs_ar : data.docs_en;

  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className={`poster-canvas ${isAr ? "rtl" : "ltr"}`}>
      <PosterHeader />

      <div className="pc-refbar">
        <div className="cell">
          <span className="lbl">{refLabel}</span>
          <span className="val">{data.refValue}</span>
        </div>
        <div className="cell">
          <span className="lbl">{dateLabel}</span>
          <span className="val">{date}</span>
        </div>
      </div>

      <div className="pc-title-wrap">
        <div className="pc-title-main">{title}</div>
        <div className="pc-title-sub">{titleSub}</div>
      </div>

      <div className="pc-subject">
        <div className="pc-subject-lbl">{subjectLabel}</div>
        <div className="pc-subject-text">{subject}</div>
      </div>

      <div className="pc-letter">
        <div className="pc-body-row">
          {data.showDocs && isAr && <DocsCol head={docsHead} intro={docsIntro} items={docs} />}
          <div className="pc-body-col">
            {paragraphs.map((p, i) => (
              <p key={i} className="pc-para">
                {p}
              </p>
            ))}
            {data.showNote && (
              <div className="pc-note">
                <div className="pc-note-icon">!</div>
                <div className="pc-note-body">
                  {noteLabel && <span className="pc-note-lbl">{noteLabel}</span>}
                  {noteBody}
                </div>
              </div>
            )}
          </div>
          {data.showDocs && !isAr && <DocsCol head={docsHead} intro={docsIntro} items={docs} />}
        </div>
      </div>

      <PosterFooter
        phones={data.phones}
        email={data.email}
        rtl={isAr}
        meta={
          isAr
            ? `رقم التعميم: ${data.refValue} | التاريخ: ${data.date_ar.replace("م", "").trim()}`
            : `Circular No.: ${data.refValue} | Date: ${data.date_en}`
        }
      />
    </div>
  );
}

export default function CircularEditor({
  previewLang,
  onBusy,
}: {
  previewLang: "ar" | "en";
  onBusy: (s: string | null) => void;
}) {
  const [data, setData] = useState<CircularData>(DEFAULTS);
  const arRef = useRef<HTMLDivElement>(null);
  const enRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof CircularData>(key: K, val: CircularData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  async function downloadPng(lang: "ar" | "en") {
    const node = lang === "ar" ? arRef.current : enRef.current;
    if (!node) return;
    onBusy(`PNG ${lang.toUpperCase()}`);
    try {
      await htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: true });
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f5f0eb",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `tameem_${data.refValue.replace(/\//g, "-")}_${lang}.png`;
      a.click();
    } finally {
      onBusy(null);
    }
  }

  async function downloadDocx() {
    onBusy(".docx");
    try {
      const MAROON = "7A0020";
      const GOLD_DK = "A07828";
      const SUB = "555555";

      const arRun = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) =>
        new TextRun({
          text,
          bold: opts.bold,
          size: (opts.size ?? 12) * 2,
          color: opts.color,
          font: "Cairo",
          rightToLeft: true,
        });

      const enRun = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) =>
        new TextRun({
          text,
          bold: opts.bold,
          size: (opts.size ?? 12) * 2,
          color: opts.color,
          font: "Calibri",
        });

      const divider = () =>
        new Paragraph({
          children: [new TextRun({ text: "" })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD_DK } },
          spacing: { after: 200 },
        });

      const arParagraphs = data.body_ar.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const enParagraphs = data.body_en.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

      const arChildren = [
        new Paragraph({
          children: [arRun("دائرة الشؤون المالية – جامعة السلطان قابوس", { bold: true, size: 14, color: MAROON })],
          bidirectional: true,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            arRun(`رقم التعميم: ${data.refValue}`, { bold: true, size: 11, color: MAROON }),
            arRun("\t\t\t\t"),
            arRun(`التاريخ: ${data.date_ar}`, { bold: true, size: 11, color: MAROON }),
          ],
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({ children: [arRun("")] }),
        new Paragraph({
          children: [arRun(data.title_ar, { bold: true, size: 24, color: MAROON })],
          bidirectional: true,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        divider(),
        new Paragraph({
          children: [
            arRun("الموضوع:  ", { bold: true, size: 13, color: GOLD_DK }),
            arRun(data.subject_ar, { bold: true, size: 14, color: MAROON }),
          ],
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 240 },
        }),
        ...arParagraphs.map(
          (p) =>
            new Paragraph({
              children: [arRun(p, { size: 12 })],
              bidirectional: true,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),
        ),
        ...(data.showNote
          ? [
              new Paragraph({
                children: [
                  arRun(`${data.noteLabel_ar} `, { bold: true, size: 12, color: MAROON }),
                  arRun(data.note_ar, { bold: true, size: 12, color: MAROON }),
                ],
                bidirectional: true,
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
              }),
            ]
          : []),
        ...(data.showDocs
          ? [
              new Paragraph({ children: [arRun("")] }),
              new Paragraph({
                children: [arRun(data.docsHead_ar, { bold: true, size: 14, color: MAROON })],
                bidirectional: true,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
              }),
              ...(data.docsIntro_ar
                ? [
                    new Paragraph({
                      children: [arRun(data.docsIntro_ar, { size: 11, color: SUB })],
                      bidirectional: true,
                      alignment: AlignmentType.RIGHT,
                      spacing: { after: 100 },
                    }),
                  ]
                : []),
              ...data.docs_ar.map(
                (item, i) =>
                  new Paragraph({
                    children: [arRun(`${i + 1}. ${item}`, { size: 12 })],
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                  }),
              ),
            ]
          : []),
        new Paragraph({ children: [arRun("")] }),
        divider(),
        new Paragraph({
          children: [arRun(`للاستفسار: ${data.email}  |  ${data.phones}`, { size: 10, color: SUB })],
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
        }),
      ];

      const enChildren = [
        new Paragraph({
          children: [enRun("Department of Financial Affairs – Sultan Qaboos University", { bold: true, size: 13, color: MAROON })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            enRun(`Circular No.: ${data.refValue}`, { bold: true, size: 11, color: MAROON }),
            enRun("\t\t\t\t"),
            enRun(`Date: ${data.date_en}`, { bold: true, size: 11, color: MAROON }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({ children: [enRun("")] }),
        new Paragraph({
          children: [enRun(data.title_en, { bold: true, size: 24, color: MAROON })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        divider(),
        new Paragraph({
          children: [
            enRun("Subject:  ", { bold: true, size: 13, color: GOLD_DK }),
            enRun(data.subject_en, { bold: true, size: 14, color: MAROON }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 240 },
        }),
        ...enParagraphs.map(
          (p) =>
            new Paragraph({
              children: [enRun(p, { size: 12 })],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),
        ),
        ...(data.showNote
          ? [
              new Paragraph({
                children: [
                  enRun(`${data.noteLabel_en} `, { bold: true, size: 12, color: MAROON }),
                  enRun(data.note_en, { bold: true, size: 12, color: MAROON }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
              }),
            ]
          : []),
        ...(data.showDocs
          ? [
              new Paragraph({ children: [enRun("")] }),
              new Paragraph({
                children: [enRun(data.docsHead_en, { bold: true, size: 14, color: MAROON })],
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 },
              }),
              ...(data.docsIntro_en
                ? [
                    new Paragraph({
                      children: [enRun(data.docsIntro_en, { size: 11, color: SUB })],
                      alignment: AlignmentType.LEFT,
                      spacing: { after: 100 },
                    }),
                  ]
                : []),
              ...data.docs_en.map(
                (item, i) =>
                  new Paragraph({
                    children: [enRun(`${i + 1}. ${item}`, { size: 12 })],
                    alignment: AlignmentType.LEFT,
                  }),
              ),
            ]
          : []),
        new Paragraph({ children: [enRun("")] }),
        divider(),
        new Paragraph({
          children: [enRun(`For inquiries: ${data.email}  |  ${data.phones}`, { size: 10, color: SUB })],
          alignment: AlignmentType.LEFT,
        }),
      ];

      const doc = new Document({
        sections: [
          {
            properties: { page: { margin: { top: 1080, bottom: 1080, left: 1320, right: 1320 } } },
            children: [
              ...arChildren,
              new Paragraph({ children: [enRun("")], pageBreakBefore: true }),
              ...enChildren,
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `tameem_${data.refValue.replace(/\//g, "-")}_text.docx`);
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="flex-1 grid grid-cols-[440px_1fr] overflow-hidden">
      <aside className="overflow-y-auto bg-white border-r border-neutral-200 p-5 space-y-5">
        <div className="flex gap-1.5 pb-3 border-b border-neutral-200 -mt-1">
          <button
            onClick={() => downloadPng("ar")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7a0020] hover:bg-[#500015] text-white font-bold text-xs px-2 py-2 rounded transition-colors"
          >
            <Download size={13} /> PNG عربي
          </button>
          <button
            onClick={() => downloadPng("en")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7a0020] hover:bg-[#500015] text-white font-bold text-xs px-2 py-2 rounded transition-colors"
          >
            <Download size={13} /> PNG English
          </button>
          <button
            onClick={downloadDocx}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#7a0020] hover:bg-[#fbfaf6] text-[#7a0020] font-bold text-xs px-2 py-2 rounded transition-colors"
          >
            <FileText size={13} /> .docx
          </button>
        </div>

        <Section title="مرجع التعميم · Reference">
          <Field label="Ref. number" value={data.refValue} onChange={(v) => update("refValue", v)} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="التاريخ (AR)" value={data.date_ar} onChange={(v) => update("date_ar", v)} dir="rtl" />
            <Field label="Date (EN)" value={data.date_en} onChange={(v) => update("date_en", v)} />
          </div>
        </Section>

        <Section title="العنوان · Title">
          <div className="grid grid-cols-2 gap-2">
            <Field label="عنوان (AR)" value={data.title_ar} onChange={(v) => update("title_ar", v)} dir="rtl" />
            <Field label="Title (EN)" value={data.title_en} onChange={(v) => update("title_en", v)} />
          </div>
          <Field label="عنوان فرعي (AR)" value={data.titleSub_ar} onChange={(v) => update("titleSub_ar", v)} dir="rtl" />
          <Field label="Subtitle (EN)" value={data.titleSub_en} onChange={(v) => update("titleSub_en", v)} />
        </Section>

        <Section title="الموضوع · Subject">
          <TextField label="الموضوع (AR)" value={data.subject_ar} onChange={(v) => update("subject_ar", v)} dir="rtl" rows={2} />
          <TextField label="Subject (EN)" value={data.subject_en} onChange={(v) => update("subject_en", v)} rows={2} />
        </Section>

        <Section
          title="النص · Body"
          subtitle="افصل الفقرات بسطر فارغ · Separate paragraphs with a blank line"
        >
          <TextField label="النص (AR)" value={data.body_ar} onChange={(v) => update("body_ar", v)} dir="rtl" rows={10} />
          <TextField label="Body (EN)" value={data.body_en} onChange={(v) => update("body_en", v)} rows={10} />
        </Section>

        <Section title="ملاحظة · Note box" toggle={{ on: data.showNote, set: (v) => update("showNote", v) }}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="عنوان (AR)" value={data.noteLabel_ar} onChange={(v) => update("noteLabel_ar", v)} dir="rtl" />
            <Field label="Label (EN)" value={data.noteLabel_en} onChange={(v) => update("noteLabel_en", v)} />
          </div>
          <TextField label="نص الملاحظة (AR)" value={data.note_ar} onChange={(v) => update("note_ar", v)} dir="rtl" rows={4} />
          <TextField label="Note (EN)" value={data.note_en} onChange={(v) => update("note_en", v)} rows={4} />
        </Section>

        <Section title="المؤيدات · Supporting documents" toggle={{ on: data.showDocs, set: (v) => update("showDocs", v) }}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="عنوان العمود (AR)" value={data.docsHead_ar} onChange={(v) => update("docsHead_ar", v)} dir="rtl" />
            <Field label="Column head (EN)" value={data.docsHead_en} onChange={(v) => update("docsHead_en", v)} />
          </div>
          <Field label="مقدمة (AR)" value={data.docsIntro_ar} onChange={(v) => update("docsIntro_ar", v)} dir="rtl" />
          <Field label="Intro (EN)" value={data.docsIntro_en} onChange={(v) => update("docsIntro_en", v)} />
          <RowList label="عناصر (AR)" items={data.docs_ar} onChange={(items) => update("docs_ar", items)} dir="rtl" />
          <RowList label="Items (EN)" items={data.docs_en} onChange={(items) => update("docs_en", items)} />
        </Section>

        <Section title="التذييل · Footer">
          <Field label="الهواتف · Phones" value={data.phones} onChange={(v) => update("phones", v)} />
          <Field label="البريد · Email" value={data.email} onChange={(v) => update("email", v)} />
        </Section>
      </aside>

      <main className="overflow-auto p-6 bg-neutral-200 relative">
        <div className="flex flex-col items-center gap-4">
          <div className="text-[11px] text-neutral-500 tracking-widest uppercase">
            Live preview · {previewLang === "ar" ? "Arabic" : "English"} · displayed at 65%
          </div>
          <div className="origin-top scale-[0.65] -mb-[35%]">
            <div ref={previewLang === "ar" ? arRef : enRef}>
              <CircularPreview data={data} lang={previewLang} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: -99999, top: 0 }} aria-hidden>
          <div ref={previewLang === "ar" ? enRef : arRef}>
            <CircularPreview data={data} lang={previewLang === "ar" ? "en" : "ar"} />
          </div>
        </div>
      </main>
    </div>
  );
}
