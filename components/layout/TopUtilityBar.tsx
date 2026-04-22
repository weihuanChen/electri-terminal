import Link from "next/link";
import { Mail, Phone, Globe, FileText } from "lucide-react";

interface TopUtilityBarProps {
  email?: string;
  phone?: string;
  showLanguageSelector?: boolean;
  showCatalogDownload?: boolean;
  languages?: string[];
}

export default function TopUtilityBar({
  email = "info@electriterminal.com",
  phone = "+86 xxx xxx",
  showLanguageSelector = true,
  showCatalogDownload = true,
  languages = ["English", "中文"],
}: TopUtilityBarProps) {
  return (
    <div className="bg-slate-900 text-white text-sm py-2">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left side - Contact Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{email}</span>
            </a>
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{phone}</span>
            </a>
          </div>

          {/* Right side - Utilities */}
          <div className="flex items-center gap-4">
            {showCatalogDownload && (
              <Link
                href="/resources"
                className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden md:inline">Documentation Support</span>
              </Link>
            )}

            {showLanguageSelector && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Language</span>
                </button>
                {/* Language dropdown */}
                <div className="absolute right-0 mt-2 w-40 bg-white text-slate-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        className="block w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
