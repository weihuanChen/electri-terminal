import { formatAttributeValue, type AttributeUnitKey } from "@/lib/productPresentation";

interface SpecGroup {
  groupName?: string;
  attributes: Array<{
    label: string;
    value: unknown;
    displayPrecision?: number;
    unitKey?: AttributeUnitKey;
    unit?: string;
    fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  }>;
}

interface SpecificationTableProps {
  specifications: SpecGroup[];
}

export default function SpecificationTable({
  specifications,
}: SpecificationTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border bg-muted px-4 py-3 md:px-6 md:py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">Specifications</h3>
      </div>

      <div className="divide-y divide-border">
        {specifications.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.groupName && (
              <div className="bg-muted/50 px-4 py-2 md:px-6 md:py-3">
                <h3 className="text-sm font-semibold text-primary">
                  {group.groupName}
                </h3>
              </div>
            )}

            <dl className="divide-y divide-border">
              {group.attributes.map((attr, attrIndex) => (
                <div
                  key={attrIndex}
                  className="grid grid-cols-1 gap-1 px-4 py-3 transition-colors hover:bg-muted/30 md:grid-cols-3 md:gap-4 md:px-6 md:py-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary md:text-sm md:normal-case md:tracking-normal">
                    {attr.label}
                  </dt>
                  <dd className="text-sm leading-6 text-foreground md:col-span-2">
                    {formatAttributeValue(attr.value, {
                      fieldType: attr.fieldType,
                      displayPrecision: attr.displayPrecision,
                      unitKey: attr.unitKey,
                      unit: attr.unit,
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
