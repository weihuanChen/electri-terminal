import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { articleUrl } from "@/lib/routes";

interface Application {
  title: string;
  slug: string;
  description: string;
  image?: string;
  productCount?: number;
}

interface ApplicationCardProps {
  application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link
      href={articleUrl(application.slug)}
      className="group block relative h-80 sm:h-96 w-full rounded-card overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Background Image */}
      {application.image ? (
        <Image
          src={application.image}
          alt={application.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 58vw"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-800" />
      )}

      {/* Smooth Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
        {/* Top Product Count Badge */}
        {application.productCount !== undefined && (
          <div className="absolute top-5 right-5">
            <span className="bg-slate-950/55 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-control shadow-xs">
              {application.productCount} Related Models
            </span>
          </div>
        )}

        {/* Text Block */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2.5 tracking-tight">
            {application.title}
          </h3>

          {application.description && (
            <p className="text-sm text-slate-200/90 line-clamp-2 mb-4 leading-relaxed max-w-xl">
              {application.description}
            </p>
          )}

          <div className="inline-flex items-center text-sm font-semibold text-orange-300 group-hover:text-white transition-colors">
            Explore Application
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
