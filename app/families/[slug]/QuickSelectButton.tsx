"use client";

import { useTranslations } from "next-intl";

type QuickSelectButtonProps = {
  targetId: string;
};

export default function QuickSelectButton({ targetId }: QuickSelectButtonProps) {
  const t = useTranslations("catalog");
  const handleClick = () => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  return (
    <button
      type="button"
      className="btn btn-accent"
      aria-controls={targetId}
      onClick={handleClick}
    >
      {t("quickSelect")}
    </button>
  );
}
