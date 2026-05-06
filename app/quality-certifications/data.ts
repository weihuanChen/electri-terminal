export type CertificateAction = {
  label: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary";
};

export type CertificateImage = {
  src: string;
  alt: string;
};

export type CertificateCardData = {
  icon: "ce" | "rohs" | "reach" | "ul";
  title: string;
  subtitle: string;
  images: CertificateImage[];
  details: Array<{
    label: string;
    value: string;
  }>;
  body?: string[];
  note?: string;
  verifiedLabel?: string;
  actions: CertificateAction[];
};

export type ULListedCardData = {
  title: string;
  fileNo: string;
  productCategory: string;
  markets: string;
  highlights: string[];
  supportText: string;
  actions: CertificateAction[];
};

export const heroTags = ["CE Verified", "RoHS Compliant", "REACH Tested"] as const;

export const trustSummary = [
  {
    title: "CE / EMC Verification",
    description:
      "Selected terminal products are verified according to applicable EU EMC requirements.",
  },
  {
    title: "RoHS Compliance",
    description:
      "Materials are tested for restricted substances such as lead, mercury, cadmium and hexavalent chromium.",
  },
  {
    title: "REACH SVHC Screening",
    description:
      "Products are tested against SVHC requirements for export and distribution in regulated markets.",
  },
  {
    title: "Third-party Test Reports",
    description:
      "Test reports are issued by recognized third-party laboratories such as SGS and TÜV SUD.",
  },
] as const;

export const certificateCards: CertificateCardData[] = [
  {
    icon: "ce",
    title: "CE Certificate of Compliance",
    subtitle: "Verification record for selected terminal products under EMC directives.",
    images: [
      {
        src: "https://assets.electriterminal.com/certifications/ce-ring-terminals-certificate.webp",
        alt: "CE certificate first page for ring terminals",
      },
      {
        src: "https://assets.electriterminal.com/certifications/ce-ring-terminal-products.webp",
        alt: "CE certificate second page showing covered ring terminal products",
      },
    ],
    details: [
      { label: "Product", value: "Terminals" },
      { label: "Standard", value: "EN IEC 61000-6-1 / EN 61000-6-3" },
      { label: "Issued by", value: "ECM" },
      { label: "Status", value: "Valid" },
      { label: "Valid until", value: "Aug 30, 2027" },
    ],
    actions: [
      {
        label: "View Certificate",
        href: "https://assets.electriterminal.com/certifications/ce-ring-terminals-certificate.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Full Copy",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
  {
    icon: "rohs",
    title: "RoHS Test Report",
    subtitle: "Substance screening result for electroplated matte tin terminal materials.",
    images: [
      {
        src: "https://assets.electriterminal.com/certifications/rohs-ring-terminals-certification.webp",
        alt: "RoHS test report for ring terminals",
      },
    ],
    details: [
      { label: "Product", value: "Electroplated Matte Tin Terminals" },
      { label: "Requirement", value: "EU RoHS Directive (EU) 2015/863" },
      { label: "Issued by", value: "SGS" },
      { label: "Result", value: "Pass" },
      { label: "Date", value: "Jun 26, 2025" },
    ],
    actions: [
      {
        label: "View Certificate",
        href: "https://assets.electriterminal.com/certifications/rohs-ring-terminals-certification.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Full Copy",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
  {
    icon: "reach",
    title: "REACH SVHC Test Report",
    subtitle: "SVHC screening document for regulated export and distribution markets.",
    images: [
      {
        src: "https://assets.electriterminal.com/certifications/reach-ring-terminals-certification.webp",
        alt: "REACH SVHC test report for ring terminals",
      },
    ],
    details: [
      { label: "Product", value: "Terminal" },
      { label: "Regulation", value: "REACH Regulation (EC) No. 1907/2006" },
      { label: "Issued by", value: "TUV SUD" },
      { label: "Result", value: "Refer to report" },
      { label: "Date", value: "Nov 17, 2025" },
    ],
    actions: [
      {
        label: "View Certificate",
        href: "https://assets.electriterminal.com/certifications/reach-ring-terminals-certification.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Full Copy",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
  {
    icon: "ul",
    title: "UL Certificate of Compliance",
    subtitle: "Evaluation record for wire connectors and terminals under UL standards.",
    images: [
      {
        src: "https://assets.electriterminal.com/certifications/ul-coc-ring-terminal-selected-model.webp",
        alt: "UL certificate of compliance for selected ring terminal models",
      },
    ],
    details: [
      { label: "Product", value: "Wire Connectors & Terminals" },
      { label: "Standard", value: "CSA C22.2 No. 65-18" },
      { label: "Issued by", value: "UL LLC" },
      { label: "Type", value: "Compliance Certificate" },
      { label: "Market", value: "Canada / North America" },
      { label: "Date", value: "Dec 7, 2022" },
      { label: "Status", value: "Evaluated to applicable UL standards" },
    ],
    body: [
      "This certificate confirms that representative samples of selected terminal products have been evaluated by UL in accordance with applicable safety standards.",
      "It serves as a supporting compliance document for product evaluation, supplier qualification, and project documentation in North American markets.",
    ],
    note:
      "Note: This document indicates compliance evaluation of representative samples and does not constitute authorization to apply the UL mark. For specific certification requirements, please confirm with our sales team.",
    verifiedLabel: "Evaluated document",
    actions: [
      {
        label: "View Certificate",
        href: "https://assets.electriterminal.com/certifications/ul-coc-ring-terminal-selected-model.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Full UL Documentation",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
] as const;

export const ulListedCard: ULListedCardData = {
  title: "UL Listed Components (cULus)",
  fileNo: "E530024",
  productCategory: "Wire Connectors and Soldering Lugs",
  markets: "USA & Canada",
  highlights: [
    "Verified in UL Product iQ database",
    "Available for selected models",
  ],
  supportText:
    "UL coverage applies to selected models only. Please contact us to confirm whether the required model is included in the latest listing or evaluation documents.",
  actions: [
    {
      label: "Verify on UL Website",
      href: "https://productiq.ulprospector.com/",
      external: true,
      variant: "primary",
    },
    {
      label: "Request UL Documentation",
      href: "#request-documents",
      variant: "secondary",
    },
  ],
};

export const coverageRows = [
  {
    category: "Terminals",
    document: "CE Certificate",
    coverage: "Selected terminal models",
  },
  {
    category: "Tin-plated terminals",
    document: "RoHS Report",
    coverage: "Material substance compliance",
  },
  {
    category: "Terminals",
    document: "REACH Report",
    coverage: "SVHC screening",
  },
  {
    category: "Custom products",
    document: "On request",
    coverage: "Batch-specific documents",
  },
] as const;

export const qualitySteps = [
  {
    title: "Raw Material Check",
    description:
      "Incoming conductive metals and insulation materials are checked before release to production.",
  },
  {
    title: "Production Inspection",
    description:
      "In-process checks help confirm stable forming, plating, and assembly conditions during production.",
  },
  {
    title: "Dimensional & Surface Check",
    description:
      "Critical dimensions, finish condition, and appearance are reviewed against production requirements.",
  },
  {
    title: "Electrical / Mechanical Testing",
    description:
      "Selected products undergo electrical and mechanical verification based on applicable standards and project needs.",
  },
  {
    title: "Packing Inspection",
    description:
      "Final packaging is checked to reduce mix-ups and support traceable batch handling.",
  },
  {
    title: "Shipment Documentation",
    description:
      "Relevant reports and document references are prepared to support shipment and customer approval workflows.",
  },
] as const;

export const buyerBenefits = [
  {
    title: "Reduce supplier risk",
    description:
      "Compliance documents provide an extra verification layer when evaluating suppliers for critical electrical components.",
  },
  {
    title: "Support customs clearance",
    description:
      "Verified reports help buyers prepare import files, customs checks, and destination-market compliance reviews.",
  },
  {
    title: "Improve procurement confidence",
    description:
      "Clear documentation helps sourcing teams move faster on supplier approval, repeat orders, and bulk purchasing decisions.",
  },
] as const;

export const certificateOptions = ["CE", "RoHS", "REACH", "Other"] as const;
