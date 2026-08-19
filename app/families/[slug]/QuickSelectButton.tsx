"use client";

import { useTranslations } from "next-intl";
import { trackGA4Event } from "@/lib/analytics";

type QuickSelectButtonProps = {
  targetId: string;
  familyName: string;
};

export default function QuickSelectButton({ targetId, familyName }: QuickSelectButtonProps) {
  const t = useTranslations("catalog");
  const handleClick = () => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    trackGA4Event("view_available_models", {
      family_name: familyName,
      page_path: window.location.pathname,
      selection_method: "family_hero",
    });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  return (
    <button
      type="button"
      className="btn btn-primary"
      aria-controls={targetId}
      onClick={handleClick}
    >
      {t("viewAvailableModels")}
    </button>
  );
}
