import Image from "next/image";
import { FileText, Download } from "lucide-react";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface DownloadCardProps {
  title: string;
  type: "catalog" | "datasheet" | "certificate" | "cad" | "manual";
  fileUrl: string;
  previewImage?: string;
  language?: string;
  version?: string;
  fileSize?: string | number;
  mimeType?: string;
}

const typeConfig = {
  catalog: { label: "Catalog", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
  datasheet: { label: "Datasheet", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
  certificate: { label: "Certificate", icon: FileText, color: "text-orange-600 dark:text-orange-400" },
  cad: { label: "CAD Drawing", icon: FileText, color: "text-slate-700 dark:text-slate-300" },
  manual: { label: "Manual", icon: FileText, color: "text-slate-700 dark:text-slate-300" },
};

export default function DownloadCard({
  title,
  type,
  fileUrl,
  previewImage,
  language,
  version,
  fileSize,
}: DownloadCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const getFileExtension = (url: string) => {
    const match = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1].toUpperCase() : "FILE";
  };

  const formatFileSize = (value?: string | number) => {
    if (value === undefined) return undefined;
    if (typeof value === "string") return value;
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="card card-hoverable group">
      <div className="p-5">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {previewImage ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-sm border border-border bg-muted">
                <Image
                  src={previewImage}
                  alt={title}
                  fill
                  unoptimized={shouldBypassNextImageOptimization(previewImage)}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={`flex h-20 w-20 items-center justify-center rounded-sm bg-muted ${config.color}`}>
                <Icon className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted">
                    {config.label}
                  </span>
                  {language && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted">
                      {language.toUpperCase()}
                    </span>
                  )}
                  {version && <span>v{version}</span>}
                  {formatFileSize(fileSize) && <span>{formatFileSize(fileSize)}</span>}
                  {!formatFileSize(fileSize) && <span>{getFileExtension(fileUrl)}</span>}
                </div>
              </div>

              {/* Download Button */}
              <a
                href={fileUrl}
                download
                className="flex-shrink-0 btn btn-secondary btn-sm tap-target px-3"
                aria-label={`Download ${title}`}
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
