"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

let mermaidInitialized = false;

function ensureMermaidInitialized() {
  if (mermaidInitialized) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      darkMode: false,
      fontFamily: "IBM Plex Sans, Avenir Next, Helvetica Neue, Noto Sans, sans-serif",
      background: "#F7F8FA",
      mainBkg: "#FFFFFF",
      secondBkg: "#F7F8FA",
      tertiaryColor: "#EEF1F4",
      primaryColor: "#FFFFFF",
      primaryTextColor: "#12161B",
      primaryBorderColor: "#CBD5E1",
      secondaryColor: "#F7F8FA",
      secondaryTextColor: "#12161B",
      secondaryBorderColor: "#CBD5E1",
      tertiaryTextColor: "#12161B",
      tertiaryBorderColor: "#CBD5E1",
      lineColor: "#475569",
      textColor: "#12161B",
      nodeTextColor: "#12161B",
      edgeLabelBackground: "#FFFFFF",
      clusterBkg: "#F7F8FA",
      clusterBorder: "#CBD5E1",
    },
  });
  mermaidInitialized = true;
}

interface MermaidChartProps {
  chart: string;
}

export default function MermaidChart({ chart }: MermaidChartProps) {
  const reactId = useId();
  const [svg, setSvg] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const renderChart = async () => {
      try {
        ensureMermaidInitialized();
        const id = `mermaid-${reactId.replace(/:/g, "")}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);

        if (isCancelled) {
          return;
        }

        setSvg(renderedSvg);
        setHasError(false);
      } catch {
        if (!isCancelled) {
          setHasError(true);
          setSvg("");
        }
      }
    };

    renderChart();

    return () => {
      isCancelled = true;
    };
  }, [chart, reactId]);

  if (hasError) {
    return (
      <div className="not-prose rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-200">
        Mermaid chart parse failed. Please verify the fenced block syntax.
      </div>
    );
  }

  return (
    <div className="not-prose markdown-mermaid">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-secondary">
          Rendering chart...
        </div>
      )}
    </div>
  );
}
