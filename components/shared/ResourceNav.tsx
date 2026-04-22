import { FileText, FileTextIcon, BookOpen, Award, DraftingCompass } from "lucide-react";

interface ResourceNavProps {
  activeType: string;
  onTypeChange: (type: string) => void;
}

const resourceTypes = [
  { id: "all", label: "All Resources", icon: FileText },
  { id: "catalog", label: "Catalogs", icon: BookOpen },
  { id: "datasheet", label: "Datasheets", icon: FileTextIcon },
  { id: "certificate", label: "Certificates", icon: Award },
  { id: "cad", label: "CAD Drawings", icon: DraftingCompass },
  { id: "manual", label: "Manuals", icon: FileText },
];

export default function ResourceNav({ activeType, onTypeChange }: ResourceNavProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {resourceTypes.map((type) => {
        const Icon = type.icon;
        const isActive = activeType === type.id;

        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-border text-secondary hover:border-primary hover:text-primary"
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
