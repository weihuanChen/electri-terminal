import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
      href={`/blog/${application.slug}`}
      className="group block relative h-96 w-full rounded-sm overflow-hidden bg-slate-900 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Background Image */}
      {application.image ? (
        <Image
          src={application.image}
          alt={application.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-800" />
      )}

      {/* Heavy Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        {/* Top Product Count Badge */}
        {application.productCount !== undefined && (
          <div className="absolute top-6 right-6">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-sm shadow-sm">
              {application.productCount} Related Models
            </span>
          </div>
        )}

        {/* Text Block */}
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <h3 className="text-xl font-black text-white mb-2 drop-shadow-md">
            {application.title}
          </h3>

          <p className="text-sm text-slate-300 line-clamp-2 mb-4 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {application.description}
          </p>

          <div className="flex items-center text-sm font-bold text-primary group-hover:text-white transition-colors">
            View Article
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
