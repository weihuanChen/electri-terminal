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
      <div className="px-6 py-4 border-b border-border bg-muted">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">Specifications</h3>
      </div>

      <div className="divide-y divide-border">
        {specifications.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.groupName && (
              <div className="px-6 py-3 bg-muted/50">
                <h3 className="text-sm font-semibold text-primary">
                  {group.groupName}
                </h3>
              </div>
            )}

            <dl className="divide-y divide-border">
              {group.attributes.map((attr, attrIndex) => (
                <div
                  key={attrIndex}
                  className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 hover:bg-muted/30 transition-colors"
                >
                  <dt className="text-sm font-medium text-secondary">
                    {attr.label}
                  </dt>
                  <dd className="text-sm text-foreground md:col-span-2">
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
