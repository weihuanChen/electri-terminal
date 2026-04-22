"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface MegaMenuItem {
  title: string;
  url: string;
  description?: string;
  children?: MegaMenuItem[];
}

interface MegaMenuProps {
  triggerTitle: string;
  triggerUrl?: string;
  items: MegaMenuItem[];
  columns?: number;
}

export default function MegaMenu({
  triggerTitle,
  triggerUrl,
  items,
  columns = 3,
}: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!items || items.length === 0) {
    return (
      <Link
        href={triggerUrl || "#"}
        className="text-sm font-medium text-secondary hover:text-primary transition-colors py-2"
      >
        {triggerTitle}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger */}
      <Link
        href={triggerUrl || "#"}
        className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors py-2"
      >
        {triggerTitle}
        <ChevronDown className="w-4 h-4" />
      </Link>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-border overflow-hidden z-50">
          <div className="p-6">
            <div
              className={`grid gap-6`}
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {items.map((item) => (
                <div key={item.title} className="space-y-1">
                  <Link
                    href={item.url}
                    className="block font-semibold text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.description && (
                    <p className="text-sm text-secondary">
                      {item.description}
                    </p>
                  )}
                  {item.children && item.children.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.url}
                          className="block text-sm text-secondary hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
