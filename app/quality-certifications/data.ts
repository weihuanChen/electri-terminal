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

export const heroTags = ["CE / EMC", "RoHS", "REACH", "UL Planning"] as const;

export const trustSummary = [
  {
    title: "Existing File Review",
    description:
      "Selected product families already have CE, RoHS, REACH, or UL-related documents for initial qualification.",
  },
  {
    title: "Target-market Check",
    description:
      "Requirements can be reviewed against the destination market, customer specification, and intended application.",
  },
  {
    title: "Product-specific Scope",
    description:
      "Coverage is confirmed by product family, model, material, production batch, and document validity.",
  },
  {
    title: "Evaluation Path",
    description:
      "Additional testing, certification, or listing coverage can be discussed for qualified project needs.",
  },
] as const;

export const certificateCards: CertificateCardData[] = [
  {
    icon: "ce",
    title: "CE Certificate of Compliance",
    subtitle: "Reference document for selected terminal products under EMC requirements.",
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
        label: "View Reference",
        href: "https://assets.electriterminal.com/certifications/ce-ring-terminals-certificate.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Project Review",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
  {
    icon: "rohs",
    title: "RoHS Test Report",
    subtitle: "Reference report for restricted-substance planning on selected terminal materials.",
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
        label: "View Reference",
        href: "https://assets.electriterminal.com/certifications/rohs-ring-terminals-certification.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Project Review",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
  {
    icon: "reach",
    title: "REACH SVHC Test Report",
    subtitle: "SVHC screening reference for regulated export and distribution planning.",
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
        label: "View Reference",
        href: "https://assets.electriterminal.com/certifications/reach-ring-terminals-certification.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request Project Review",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
  {
    icon: "ul",
    title: "UL Documentation Reference",
    subtitle: "Reference document for selected wire connectors and terminals under applicable UL / CSA requirements.",
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
      { label: "Status", value: "Product-specific; confirm before project use" },
    ],
    body: [
      "Selected product families have UL listing or evaluation records that can be used as a starting point for project qualification.",
      "Additional model coverage can be discussed for qualified OEM projects based on construction, volume, target market, and documentation route.",
    ],
    note:
      "UL status is product- and file-specific. Please confirm the exact model and required market before using any UL-related document for project approval.",
    verifiedLabel: "UL reference document",
    actions: [
      {
        label: "View Reference",
        href: "https://assets.electriterminal.com/certifications/ul-coc-ring-terminal-selected-model.webp",
        external: true,
        variant: "primary",
      },
      {
        label: "Request UL Project Review",
        href: "#request-documents",
        variant: "secondary",
      },
    ],
  },
] as const;

export const ulListedCard: ULListedCardData = {
  title: "UL Listed Product Families (cULus)",
  fileNo: "E530024",
  productCategory: "Wire Connectors and Soldering Lugs",
  markets: "USA & Canada",
  highlights: [
    "Verified in UL Product iQ database",
    "Selected product families currently listed",
    "Additional coverage discussable for qualified OEM projects",
  ],
  supportText:
    "Selected product families are currently listed.\n\nAdditional product coverage can be discussed for qualified OEM projects.",
  actions: [
    {
      label: "Verify on UL Website",
      href: "https://productiq.ulprospector.com/",
      external: true,
      variant: "primary",
    },
    {
      label: "Request UL Project Review",
      href: "#request-documents",
      variant: "secondary",
    },
  ],
};

export const coverageRows = [
  {
    category: "Existing document match",
    document: "CE Certificate",
    coverage: "Product family, model, and target-market fit",
  },
  {
    category: "Material compliance review",
    document: "RoHS Report",
    coverage: "Material type, plating, and restricted-substance requirement",
  },
  {
    category: "Regulated-market screening",
    document: "REACH Report",
    coverage: "SVHC requirement, export market, and customer specification",
  },
  {
    category: "UL planning",
    document: "UL Product iQ / UL-related documents",
    coverage: "Selected listed families and qualified OEM coverage discussion",
  },
  {
    category: "Additional certification",
    document: "Project evaluation",
    coverage: "Product type, target market, volume, and project scope",
  },
] as const;

export const qualitySteps = [
  {
    title: "Requirement Intake",
    description:
      "Collect product family, model, target market, customer specification, project volume, and required compliance route.",
  },
  {
    title: "Existing File Check",
    description:
      "Review whether current CE, RoHS, REACH, UL, or third-party documents cover the requested product scope.",
  },
  {
    title: "Coverage Confirmation",
    description:
      "Confirm model, material, batch, and validity details before documents are used for project approval.",
  },
  {
    title: "Gap Evaluation",
    description:
      "Identify whether additional testing, retesting, listing expansion, or customer-specific documents are required.",
  },
  {
    title: "Project Support Plan",
    description:
      "Discuss the feasible certification or documentation path for qualified OEM, distribution, or project requirements.",
  },
  {
    title: "Document Release",
    description:
      "Prepare available reports, references, and confirmation notes for qualified buyers after scope is confirmed.",
  },
] as const;

export const buyerBenefits = [
  {
    title: "Confirm existing coverage",
    description:
      "Clarify which current documents apply before a buyer relies on them for supplier approval or project use.",
  },
  {
    title: "Plan market requirements",
    description:
      "Evaluate destination-market expectations early so certification, testing, or documentation gaps can be discussed.",
  },
  {
    title: "Support OEM approvals",
    description:
      "For qualified OEM projects, additional product coverage or project-specific document support can be reviewed.",
  },
] as const;

export const certificateOptions = ["CE", "RoHS", "REACH", "UL", "Other"] as const;
