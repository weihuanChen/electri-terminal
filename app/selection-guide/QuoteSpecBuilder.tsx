"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileUp } from "lucide-react";

import { trackGA4Event } from "@/lib/analytics";
import { productsUrl, requestQuoteUrl } from "@/lib/routes";
import {
  colorWireRows,
  insulationRows,
  studSizeRows,
  terminalTypeRows,
} from "@/lib/selectionGuideData";

const NOT_SURE = "";
const LARGER_WIRE = "larger-wire";
const LARGER_STUD = "larger-stud";

const lastWireRow = colorWireRows[colorWireRows.length - 1];
const lastStudRow = studSizeRows[studSizeRows.length - 1];

const typeOptions = terminalTypeRows.map((row) => ({
  value: row.code,
  label: `${row.terminalType} (${row.code})`,
}));

const insulationOptions = Array.from(
  new Map(insulationRows.map((row) => [row.crimpType, row])).values()
).map((row) => ({
  value: row.crimpType,
  label: `${row.crimpType} (${row.code})`,
}));

const wireOptions = [
  ...Array.from(new Map(colorWireRows.map((row) => [row.awg, row])).values()).map((row) => ({
    value: row.awg,
    label: `AWG ${row.awg} · ${row.wireSizeRangeMm2} mm²`,
  })),
  {
    value: LARGER_WIRE,
    label: `Larger than AWG ${lastWireRow.awg} / ${lastWireRow.wireSizeRangeMm2.split("-").pop()} mm² (custom)`,
  },
];

const studOptions = [
  ...studSizeRows.map((row) => ({
    value: row.studSizeInch,
    label: `${row.studSizeInch} · ${row.studSizeMm} mm stud`,
  })),
  {
    value: LARGER_STUD,
    label: `Larger than ${lastStudRow.studSizeInch} / ${lastStudRow.studSizeMm} mm (custom)`,
  },
];

function describeWire(value: string) {
  if (value === LARGER_WIRE) {
    return `larger than AWG ${lastWireRow.awg} (${lastWireRow.wireSizeRangeMm2} mm²), size to confirm`;
  }
  const row = colorWireRows.find((item) => item.awg === value);
  return row ? `AWG ${row.awg} (${row.wireSizeRangeMm2} mm²)` : "";
}

function describeStud(value: string) {
  if (value === LARGER_STUD) {
    return `larger than ${lastStudRow.studSizeInch} (${lastStudRow.studSizeMm} mm), size to confirm`;
  }
  const row = studSizeRows.find((item) => item.studSizeInch === value);
  return row ? `${row.studSizeInch} / ${row.studSizeMm} mm (hole ${row.holeSizeMm} mm)` : "";
}

const selectClassName =
  "w-full rounded-control border border-slate-300/90 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

export default function QuoteSpecBuilder() {
  const [typeCode, setTypeCode] = useState(NOT_SURE);
  const [insulation, setInsulation] = useState(NOT_SURE);
  const [wire, setWire] = useState(NOT_SURE);
  const [stud, setStud] = useState(NOT_SURE);

  const { part, spec, hasSelection } = useMemo(() => {
    const type = terminalTypeRows.find((row) => row.code === typeCode);
    const isCustomSize = wire === LARGER_WIRE || stud === LARGER_STUD;
    const partLabel = type
      ? `${isCustomSize ? "Custom " : ""}${type.terminalType} (${type.code})`
      : isCustomSize
        ? "Custom copper terminal / lug"
        : "Terminal (type to confirm)";

    const specParts = [
      wire && `Wire: ${describeWire(wire)}`,
      stud && `Stud: ${describeStud(stud)}`,
      insulation && `Insulation: ${insulation}`,
    ].filter(Boolean);

    return {
      part: partLabel,
      spec: specParts.join("; "),
      hasSelection: Boolean(typeCode || insulation || wire || stud),
    };
  }, [typeCode, insulation, wire, stud]);

  const quoteHref = hasSelection
    ? requestQuoteUrl({ query: { source: "selection-guide", part, spec: spec || undefined } })
    : requestQuoteUrl({ query: { source: "selection-guide" } });

  const customHref = requestQuoteUrl({
    query: { source: "selection-guide", cta: "custom-drawing" },
  });

  const fields = [
    { id: "qb-type", label: "Terminal type", value: typeCode, set: setTypeCode, options: typeOptions },
    { id: "qb-wire", label: "Wire size", value: wire, set: setWire, options: wireOptions },
    { id: "qb-stud", label: "Stud size", value: stud, set: setStud, options: studOptions },
    {
      id: "qb-insulation",
      label: "Insulation",
      value: insulation,
      set: setInsulation,
      options: insulationOptions,
    },
  ];

  return (
    <section
      id="get-quote"
      aria-labelledby="get-quote-title"
      className="scroll-mt-28 rounded-card border border-primary/30 bg-white p-5 shadow-sm sm:p-7 dark:bg-slate-900"
    >
      <header className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          From Selection to Quote
        </p>
        <h2
          id="get-quote-title"
          className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100"
        >
          Turn Your Selection into a Quote Request
        </h2>
        <p className="text-sm leading-relaxed text-secondary md:text-base">
          Pick what you already know and leave the rest as &ldquo;Not sure&rdquo;. We pre-fill the
          quote form with your spec, and our engineers confirm the exact part, price, MOQ, and lead
          time.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <div key={field.id} className="min-w-0">
            <label
              htmlFor={field.id}
              className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              {field.label}
            </label>
            <select
              id={field.id}
              value={field.value}
              onChange={(event) => field.set(event.target.value)}
              className={selectClassName}
            >
              <option value={NOT_SURE}>Not sure</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {hasSelection && (
        <p className="mt-4 rounded-control bg-slate-50 px-4 py-3 text-sm leading-relaxed text-secondary dark:bg-slate-800/60">
          <span className="font-semibold text-foreground">{part}</span>
          {spec ? ` · ${spec}` : ""}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={quoteHref}
          onClick={() =>
            trackGA4Event("selection_guide_quote_click", {
              cta: "spec_builder",
              terminal_type: typeCode || "not_sure",
              wire_size: wire || "not_sure",
              stud_size: stud || "not_sure",
              insulation: insulation || "not_sure",
            })
          }
          className="btn btn-primary w-full justify-center gap-2 sm:w-auto"
        >
          Request Quote for This Spec
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href={productsUrl()} className="btn btn-outline w-full justify-center sm:w-auto">
          Browse Standard Terminals
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-sm leading-relaxed text-secondary sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="max-w-2xl">
          <span className="font-semibold text-foreground">Size not in these tables?</span> Larger
          cable, a bigger stud, or a non-standard shape: send a drawing or sample photo. We make
          custom copper terminals and lugs to drawing, with tolerances down to ±0.01 mm.
        </p>
        <Link
          href={customHref}
          onClick={() => trackGA4Event("selection_guide_quote_click", { cta: "custom_drawing" })}
          className="inline-flex shrink-0 items-center gap-2 font-semibold text-primary hover:text-primary/80"
        >
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Send a Drawing
        </Link>
      </div>
    </section>
  );
}
