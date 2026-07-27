export type SolutionIndustry = {
  slug: string;
  shortTitle: string;
  overviewSummary: string;
  seoTitle: string;
  description: string;
  bullets: string[];
  categorySlug: string;
  categoryLabel: string;
  imageAlt: string;
};

export type MaterialHighlight = {
  title: string;
  summary: string;
};

export type ExportMarket = {
  country: string;
  regionLabel: string;
  summary: string;
};

export type SolutionFaqItem = {
  question: string;
  answer: string;
};

export const solutionsHeroEyebrow = "Industry Connection Solutions";

export const solutionsHeroTitle = "Electrical Terminal Solutions for Industrial Applications";

export const solutionsHeroDescription =
  "Copper electrical terminals engineered for machine tools, motors, rail, marine, and control equipment. Matte tin plating and silver-soldered barrels support stable contact performance for export projects in Germany, France, the United States, and Japan.";

export const solutionsMetadataTitle =
  "Industrial Electrical Terminal Solutions by Application | Electri Terminal";

export const solutionsMetadataDescription =
  "Application-focused copper terminal solutions for machine tools, motors, railway, marine, and control systems. 99.9% pure copper, matte tin plating, and silver-soldered barrels for Germany, France, US, and Japan export projects.";

export const materialSectionTitle = "Material & Surface Treatment";

export const materialSectionDescription =
  "Terminal performance in industrial wiring depends on conductive base material, plating consistency, and barrel integrity. Our production approach focuses on repeatable contact resistance and assembly reliability across batches.";

export const materialHighlights: MaterialHighlight[] = [
  {
    title: "99.9% Pure Copper",
    summary:
      "High-conductivity copper supports stable crimp geometry and predictable electrical performance in power and signal circuits.",
  },
  {
    title: "Matte Tin Plating",
    summary:
      "Matte tin surface treatment improves oxidation resistance, solderability, and visual consistency for cabinet and OEM assembly.",
  },
  {
    title: "Silver Soldering at the Barrel",
    summary:
      "Silver soldering at the barrel tail strengthens the connection zone and supports dependable termination in vibration-prone environments.",
  },
];

export const industriesOverviewTitle = "Industry Applications";

export const industriesOverviewSubtitle =
  "Nine application areas where insulated copper terminals support reliable wiring, grounding, and power distribution.";

export const solutionIndustries: SolutionIndustry[] = [
  {
    slug: "machine-tools",
    shortTitle: "Machine Tools",
    overviewSummary:
      "Control cabinets, servo drives, and spindle wiring in CNC and metalworking equipment.",
    seoTitle: "Terminals for Machine Tool Wiring",
    description:
      "Machine tool electrical systems combine control cabinets, servo drives, and spindle power circuits in compact, vibration-heavy environments. Ring, fork, and spade terminals are commonly used for panel wiring, motor leads, and grounding paths where crimp stability and dimensional repeatability matter across production batches.",
    bullets: [
      "Ring and fork terminals for cabinet power and grounding distribution",
      "Insulated terminals for servo and spindle lead connections",
      "Batch-consistent crimp zones for high-volume panel assembly",
    ],
    categorySlug: "ring-terminals",
    categoryLabel: "Browse Ring Terminals",
    imageAlt: "Engineer inspecting copper ring terminals in a machine tool control cabinet",
  },
  {
    slug: "textile-machinery",
    shortTitle: "Textile Machinery",
    overviewSummary:
      "Continuous-run equipment with dense cabinet wiring and frequent maintenance access.",
    seoTitle: "Connections for Textile Machinery",
    description:
      "Textile machinery operates continuously with dense control wiring and frequent service access. Insulated copper terminals help maintain organized cabinet layouts while supporting quick disconnect and spade-style connections where operators need efficient maintenance and replacement workflows.",
    bullets: [
      "Insulated terminals for long-run control cabinet wiring",
      "Spade and quick-disconnect options for service-friendly layouts",
      "Consistent insulation color coding for OEM assembly lines",
    ],
    categorySlug: "spade-terminals",
    categoryLabel: "Browse Spade Terminals",
    imageAlt: "Engineer inspecting insulated terminals in a textile machinery control panel",
  },
  {
    slug: "electric-motors",
    shortTitle: "Electric Motors",
    overviewSummary:
      "Motor lead termination, grounding rings, and fork-style connections for drives.",
    seoTitle: "Motor Lead & Ground Terminal Solutions",
    description:
      "Motor wiring requires dependable lead termination and secure grounding at stud-mounted connection points. Ring and fork terminals are widely used for motor leads, junction boxes, and drive cabinets where contact pressure, barrel integrity, and plating quality influence long-term connection reliability.",
    bullets: [
      "Ring terminals for stud-mounted motor ground and power leads",
      "Fork terminals for serviceable motor junction connections",
      "Copper barrels sized for common motor wire ranges",
    ],
    categorySlug: "fork-terminals",
    categoryLabel: "Browse Fork Terminals",
    imageAlt: "Engineer checking electric motor lead and ground terminal connections",
  },
  {
    slug: "railway",
    shortTitle: "Railway",
    overviewSummary:
      "Onboard and trackside control wiring with emphasis on contact stability.",
    seoTitle: "Railway Electrical Connection Components",
    description:
      "Railway electrical systems require stable contact performance in onboard control, signaling interfaces, and trackside equipment cabinets. Copper terminals with controlled plating and repeatable crimp geometry support qualification workflows where batch traceability and connection consistency are reviewed during supplier approval.",
    bullets: [
      "Copper terminals for onboard control and distribution wiring",
      "Repeatable barrel forming for project qualification samples",
      "Documentation support for export and compliance review",
    ],
    categorySlug: "ring-terminals",
    categoryLabel: "Browse Ring Terminals",
    imageAlt: "Railway engineer inspecting electrical control wiring and ring terminals",
  },
  {
    slug: "marine-ships",
    shortTitle: "Marine & Ships",
    overviewSummary:
      "Shipboard panels and enclosures in humid, salt-spray-prone environments.",
    seoTitle: "Marine & Shipboard Terminal Applications",
    description:
      "Marine electrical installations face humidity, temperature cycling, and salt-spray exposure in engine rooms and service panels. Matte tin plating on copper terminals helps reduce surface degradation while insulated barrels support organized wiring in shipboard control and distribution assemblies.",
    bullets: [
      "Tin-plated copper for improved surface stability in damp areas",
      "Insulated terminals for panel and junction box organization",
      "Project-based selection for shipboard power and signal circuits",
    ],
    categorySlug: "ring-terminals",
    categoryLabel: "Browse Ring Terminals",
    imageAlt: "Marine engineer inspecting tin-plated copper terminals in a shipboard panel",
  },
  {
    slug: "electrical-control",
    shortTitle: "Electrical Control",
    overviewSummary:
      "DIN cabinets, distribution panels, and mixed power/signal wiring.",
    seoTitle: "Control Panel & Cabinet Wiring",
    description:
      "Control cabinets and electrical distribution panels combine power circuits, signaling paths, and grounding networks in a single enclosure. A broad terminal portfolio—ring, fork, spade, pin, and disconnect types—supports structured wiring layouts and simplifies procurement for panel builders and system integrators.",
    bullets: [
      "Multi-type terminal portfolio for mixed cabinet wiring",
      "Stud-size coverage for common panel hardware",
      "Selection guide support for insulation and wire-size matching",
    ],
    categorySlug: "pin-terminals",
    categoryLabel: "Browse Pin Terminals",
    imageAlt: "Panel engineer reviewing pin and ring terminal wiring in a control cabinet",
  },
  {
    slug: "instruments",
    shortTitle: "Instruments",
    overviewSummary:
      "Compact termination for meters, sensors, and precision instrumentation.",
    seoTitle: "Compact Terminals for Instrumentation",
    description:
      "Instrumentation and measurement equipment often uses smaller wire gauges and compact connection points. Pin and insulated ring terminals support dense wiring in meters, sensors, and test assemblies where precise crimp fit and insulation integrity are important for signal stability and assembly repeatability.",
    bullets: [
      "Pin terminals for compact instrument connection points",
      "Small-gauge insulated terminals for sensor and meter wiring",
      "Consistent barrel sizing for precision assembly workflows",
    ],
    categorySlug: "pin-terminals",
    categoryLabel: "Browse Pin Terminals",
    imageAlt: "Instrumentation engineer calibrating equipment beside compact pin terminals",
  },
  {
    slug: "computing-equipment",
    shortTitle: "Computing Equipment",
    overviewSummary:
      "Industrial server racks, power distribution, and cabinet-level wiring.",
    seoTitle: "Power & Signal Terminals for Computing Hardware",
    description:
      "Industrial computing and rack-level equipment relies on dependable power distribution and organized internal wiring rather than consumer-grade connectors. Ring and fork terminals support PSU feeds, bus bars, and internal harnesses in server racks, industrial PCs, and telecom-style enclosures built for continuous operation.",
    bullets: [
      "Ring terminals for rack power feed and bus bar connections",
      "Fork terminals for serviceable internal harness points",
      "Batch packaging options for OEM rack and cabinet builders",
    ],
    categorySlug: "ring-terminals",
    categoryLabel: "Browse Ring Terminals",
    imageAlt: "Engineer inspecting ring terminals and bus bars in an industrial computing rack",
  },
  {
    slug: "home-appliances",
    shortTitle: "Home Appliances",
    overviewSummary:
      "OEM appliance harnesses with color-coded insulation and volume production.",
    seoTitle: "Appliance Wiring Terminal Components",
    description:
      "Appliance manufacturers need terminals that support high-volume harness production with stable crimp performance and clear insulation coding. Insulated copper terminals are used in motors, heaters, and control modules where OEM buyers evaluate MOQ, lead time, and packaging alongside electrical fit.",
    bullets: [
      "Insulated terminals for appliance motor and heater harnesses",
      "Color-coded insulation for assembly-line identification",
      "OEM packaging and volume production coordination",
    ],
    categorySlug: "quick-disconnect-terminals",
    categoryLabel: "Browse Quick Disconnect Terminals",
    imageAlt: "Quality engineer inspecting insulated terminals in an appliance wiring harness",
  },
];

export const exportMarketsTitle = "Export Markets";

export const exportMarketsDescription =
  "We support international buyers in major developed markets with export documentation, engineering samples, and project-based communication on MOQ and lead time.";

export const exportMarkets: ExportMarket[] = [
  {
    country: "Germany",
    regionLabel: "DE",
    summary:
      "Technical documentation, sample support, and specification alignment for German industrial buyers and panel builders.",
  },
  {
    country: "France",
    regionLabel: "FR",
    summary:
      "Project communication on terminal type, insulation code, and stud size for French OEM and distribution projects.",
  },
  {
    country: "United States",
    regionLabel: "US",
    summary:
      "Export shipment coordination, catalog references, and compliance documentation requests for US sourcing teams.",
  },
  {
    country: "Japan",
    regionLabel: "JP",
    summary:
      "Precision-focused sample evaluation and repeatable batch quality for Japanese equipment manufacturers.",
  },
];

export const solutionsFaqTitle = "Application & Sourcing FAQ";

export const solutionsFaqItems: SolutionFaqItem[] = [
  {
    question: "Which industries do your terminal solutions cover?",
    answer:
      "Our application focus includes machine tools, textile machinery, electric motors, railway, marine and ships, electrical control, instruments, computing equipment, and home appliances. Each industry section on this page outlines typical wiring scenarios and related terminal categories.",
  },
  {
    question: "Why use 99.9% pure copper for industrial terminals?",
    answer:
      "High-conductivity copper supports efficient current transfer and stable crimp forming. For industrial buyers, consistent copper quality helps reduce variation in contact resistance and termination reliability across production batches.",
  },
  {
    question: "What does matte tin plating provide?",
    answer:
      "Matte tin plating improves surface stability, solderability, and visual consistency compared with bare copper. It is commonly selected for cabinet wiring and OEM assemblies where oxidation resistance and assembly appearance are reviewed.",
  },
  {
    question: "What is the purpose of silver soldering at the barrel?",
    answer:
      "Silver soldering at the barrel tail strengthens the connection zone and supports dependable termination in applications with vibration or repeated thermal cycling. It is one factor buyers evaluate alongside crimp fit and stud compatibility.",
  },
  {
    question: "Do you support OEM and custom terminal projects?",
    answer:
      "Yes. OEM buyers can request engineering samples, packaging options, and project-based MOQ discussions. Share your wire size, stud size, insulation requirements, and target application so we can recommend suitable terminal types.",
  },
  {
    question: "How should I select terminals by application?",
    answer:
      "Start with the application section that matches your equipment, then confirm terminal form, insulation code, wire-size range, and stud dimensions. Use our Selection Guide for technical matching and contact us for project-specific recommendations.",
  },
  {
    question: "What export support is available for Germany, France, the US, and Japan?",
    answer:
      "We provide export shipment coordination, catalog and specification references, sample support, and compliance documentation requests where applicable. Certification needs are evaluated per product type, destination market, and project scope.",
  },
];
