import Link from "next/link";
import Image from "next/image";
import { Download, FileText, ShieldCheck } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

interface Certification {
  name: string;
  description?: string;
  image?: string;
}

interface DownloadResource {
  title: string;
  description?: string;
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
}

interface CertificationSectionProps {
  certifications?: Certification[];
  downloads?: DownloadResource[];
  title?: string;
  subtitle?: string;
  supportNote?: string;
}

export default function CertificationSection({
  certifications,
  downloads,
  title = "Compliance and Documentation Support",
  subtitle = "Certificate availability and technical file scope are confirmed by model and project requirements.",
  supportNote = "Custom product documentation and certificates are available upon request for selected models.",
}: CertificationSectionProps) {
  const defaultCertifications: Certification[] = [
    {
      name: "Model-Specific Certificate Check",
      description: "Certificate applicability is reviewed based on item number and destination market.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop", // Abstract representation of an official document/stamp
    },
    {
      name: "Compliance File Matching",
      description: "Relevant declarations and technical files are matched to confirmed product models.",
      image: "https://images.unsplash.com/photo-1618045610815-46c050c1844e?q=80&w=2070&auto=format&fit=crop", // Seal/Stamp representation
    },
    {
      name: "Project Submission Support",
      description: "Document packages can be prepared for customer approval and qualification workflows.",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2070&auto=format&fit=crop", // Official seal representation
    },
    {
      name: "Material and Process Statements",
      description: "Material declarations and process statements are shared according to project needs.",
      image: "https://images.unsplash.com/photo-1532153955177-f59af40d6472?q=80&w=1974&auto=format&fit=crop", // Lab/Compliance representation
    },
  ];

  const defaultDownloads: DownloadResource[] = [
    {
      title: "Custom Product Documentation",
      description: "Technical documentation package prepared based on your selected item numbers.",
      fileType: "PDF",
      fileSize: "On Request",
    },
    {
      title: "Compliance Certificates",
      description: "Certificate copies can be provided for selected models and project requirements.",
      fileType: "Certificate",
      fileSize: "On Request",
    },
    {
      title: "Material and Process Statements",
      description: "Material and process information can be shared according to application needs.",
      fileType: "PDF",
      fileSize: "On Request",
    },
  ];

  const displayCertifications = certifications || defaultCertifications;
  const displayDownloads = downloads || defaultDownloads;

  return (
    <section className="section bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          align="center"
        />

        <div className="mt-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm overflow-hidden">
          <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">

            {/* Left: Wall of Certifications (Large Photos) */}
            <div className="lg:col-span-3 p-8 md:p-12">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-primary" />
                Compliance Workflow
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                {displayCertifications.map((cert, index) => (
                  <div key={index} className="group relative">
                    <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden bg-slate-800 border-4 border-slate-100 dark:border-slate-800 shadow-md">
                      <Image
                        src={cert.image || ""}
                        alt={cert.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Gradient Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-5">
                        <h4 className="font-bold text-white text-lg lg:text-xl drop-shadow-md">
                          {cert.name}
                        </h4>
                        {cert.description && (
                          <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wide drop-shadow-md">
                            {cert.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Documentation Support */}
            <div className="lg:col-span-2 p-8 md:p-12 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Documentation Support
              </h3>

              <div className="space-y-4 flex-grow">
                {displayDownloads.map((download, index) => (
                  <div
                    key={index}
                    className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm p-5 hover:border-primary transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                          {download.fileType && (
                            <span className="text-primary">
                              {download.fileType}
                            </span>
                          )}
                          {download.fileSize && (
                            <span>{download.fileSize}</span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1 truncate">
                          {download.title}
                        </h4>
                        {download.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {download.description}
                          </p>
                        )}
                      </div>
                      <Link
                        href={download.fileUrl || "/contact"}
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors border border-slate-200 dark:border-slate-700 group-hover:border-primary"
                        aria-label={`Request ${download.title}`}
                      >
                        <Download className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Support Note Bottom */}
              {supportNote && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{supportNote}</p>
                  <Link href="/contact" className="inline-flex items-center text-primary font-bold hover:underline">
                    Request Documentation &rarr;
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
