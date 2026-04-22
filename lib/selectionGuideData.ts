export type TerminalTypeRow = {
  terminalType: string;
  code: string;
  insulationCode?: string;
  wireSizeRef?: string;
  sizeRef?: string;
  tongueWidthRef?: string;
};

export type InsulationRow = {
  crimpType: string;
  code: string;
  material: string;
  temperatureRating: string;
};

export type InsulationVisualCard = {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
};

export type ColorWireRow = {
  colorCode: string;
  wireSizeRangeMm2: string;
  awg: string;
  maxCurrentA: string;
  notes?: string;
};

export type StudSizeRow = {
  studSizeInch: string;
  studSizeMm: string;
  holeSizeMm: string;
  holeSizeInch: string;
};

export const selectionGuideImages = {
  namingDiagramTerminal:
    "https://assets.electriterminal.com/factory/ring-terminal-naming-convention-diagram.webp",
  namingDiagramConnector:
    "https://assets.electriterminal.com/factory/connector-model-code-explanation.webp",
  studSizeChart: "https://assets.electriterminal.com/factory/stud-size-chart.webp",
};

export const terminalTypeRows: TerminalTypeRow[] = [
  {
    terminalType: "Ring Terminals",
    code: "R",
    insulationCode: "NYD",
    wireSizeRef: "1.25",
    tongueWidthRef: "3.7",
  },
  {
    terminalType: "Spade Terminals",
    code: "S",
    insulationCode: "D",
    wireSizeRef: "2",
    tongueWidthRef: "4",
  },
  { terminalType: "Locking Spade Terminals", code: "LS" },
  { terminalType: "Flange Spade Terminals", code: "FS" },
  {
    terminalType: "Hook Terminals",
    code: "H",
    insulationCode: "NY",
    wireSizeRef: "5.5",
    tongueWidthRef: "5",
  },
  {
    terminalType: "Blade Terminals",
    code: "DB",
    insulationCode: "E",
    wireSizeRef: "0.2",
    tongueWidthRef: "6",
  },
  { terminalType: "Lipped Blade Terminals", code: "LB" },
  {
    terminalType: "Pin Terminals",
    code: "PT",
    insulationCode: "V",
    wireSizeRef: "1.25",
    tongueWidthRef: "10",
  },
  { terminalType: "Flag Terminals", code: "FG" },
  { terminalType: "DIN-Ring Terminals", code: "DR" },
  { terminalType: "DIN-Spade Terminals", code: "DS" },
  {
    terminalType: "Female Disconnects",
    code: "FD",
    insulationCode: "NYD",
    wireSizeRef: "5.5",
    sizeRef: "250",
  },
  { terminalType: "Male Disconnects", code: "MD" },
  {
    terminalType: "Female Disconnects - Fully Insulated",
    code: "FDF",
    insulationCode: "NYD",
    wireSizeRef: "2",
    sizeRef: "250",
  },
  {
    terminalType: "Flag Female Disconnects",
    code: "FLD",
    insulationCode: "NYD",
    wireSizeRef: "1.25",
    sizeRef: "250",
  },
  { terminalType: "Piggy Back Disconnects", code: "PBD" },
  { terminalType: "Female Receptacle Disconnects", code: "FR" },
  { terminalType: "Male Bullet Disconnects", code: "MP" },
  {
    terminalType: "Closed End Connectors",
    code: "CE",
    wireSizeRef: "1.25",
  },
  {
    terminalType: "Butt Connectors",
    code: "B",
    insulationCode: "V",
    wireSizeRef: "2",
  },
  {
    terminalType: "Cord End Terminals",
    code: "E",
    wireSizeRef: "75",
    sizeRef: "12",
  },
  {
    terminalType: "Double Line Cord End Terminals",
    code: "TE",
    wireSizeRef: "10",
    sizeRef: "08",
  },
];

export const insulationRows: InsulationRow[] = [
  {
    crimpType: "Nylon Insulated - Single Crimp",
    code: "NY",
    material: "Nylon",
    temperatureRating: "105 C",
  },
  {
    crimpType: "Vinyl Insulated - Double Crimp",
    code: "D",
    material: "Vinyl",
    temperatureRating: "75 C",
  },
  {
    crimpType: "Vinyl Insulated - Single Crimp",
    code: "V",
    material: "Vinyl",
    temperatureRating: "75 C",
  },
  {
    crimpType: "Non-Insulated with Brazed Seam",
    code: "NB",
    material: "None",
    temperatureRating: "-",
  },
];

export const insulationVisualCards: InsulationVisualCard[] = [
  {
    code: "NY",
    title: "NY TYPE",
    subtitle: "Nylon Insulated - Single Crimp",
    description:
      "Higher temperature resistance and improved durability for general applications.",
    image:
      "https://assets.electriterminal.com/factory/nylon-insulated-single-crimp-terminal-illustration.webp",
    alt: "nylon insulated ring terminal NY type",
  },
  {
    code: "D",
    title: "D TYPE",
    subtitle: "Vinyl Insulated - Double Crimp",
    description: "Enhanced insulation and mechanical support for secure crimping.",
    image:
      "https://assets.electriterminal.com/factory/vinyl-insulated-double-crimp-terminal-illustration.webp",
    alt: "vinyl insulated crimp terminal D type",
  },
  {
    code: "V",
    title: "V TYPE",
    subtitle: "Vinyl Insulated - Single Crimp",
    description: "Standard insulation for general-purpose electrical connections.",
    image:
      "https://assets.electriterminal.com/factory/vinyl-insulated-single-crimp-terminal-illustration.webp",
    alt: "vinyl insulated ring terminal V type",
  },
  {
    code: "NB",
    title: "NB TYPE",
    subtitle: "Non-Insulated - Brazed Seam",
    description: "For direct metal contact and high-strength mechanical performance.",
    image:
      "https://assets.electriterminal.com/factory/non-insulated-brazed-seam-terminal-illustration.webp",
    alt: "non insulated brazed seam terminal NB type",
  },
  {
    code: "N",
    title: "N TYPE",
    subtitle: "Non-Insulated - Butted Seam",
    description: "Basic non-insulated structure for cost-sensitive applications.",
    image:
      "https://assets.electriterminal.com/factory/non-insulated-butted-seam-terminal-illustration.webp",
    alt: "non insulated butted seam terminal N type",
  },
  {
    code: "VE",
    title: "VE TYPE",
    subtitle: "PVC Insulated with Easy Entry Sleeve",
    description: "Simplifies wire insertion during crimping.",
    image:
      "https://assets.electriterminal.com/factory/end-to-end-easy-entry-pvc-insulating-sleeve-illustration.webp",
    alt: "PVC insulated easy entry sleeve terminal VE type",
  },
  {
    code: "FD",
    title: "FD TYPE",
    subtitle: "PC Insulated - Double Crimp",
    description: "Improved rigidity and structural support for demanding applications.",
    image:
      "https://assets.electriterminal.com/factory/pc-insulated-douoble-crimp-terminal-illustration.webp",
    alt: "PC insulated double crimp terminal FD type",
  },
  {
    code: "NYD",
    title: "NYD TYPE",
    subtitle: "Nylon Insulated - Double Crimp",
    description:
      "Nylon sleeve with reinforced double-crimp retention for stable connections.",
    image:
      "https://assets.electriterminal.com/factory/nylon-min-sulated-double-crimp-terminal-illustration.webp",
    alt: "nylon insulated double crimp terminal NYD type",
  },
];

export const colorWireRows: ColorWireRow[] = [
  {
    colorCode: "Yellow",
    wireSizeRangeMm2: "0.10-0.40",
    awg: "26-22",
    maxCurrentA: "9",
    notes: "Small-gauge insulated range.",
  },
  {
    colorCode: "Red",
    wireSizeRangeMm2: "0.25-1.65",
    awg: "20",
    maxCurrentA: "12",
  },
  {
    colorCode: "Blue",
    wireSizeRangeMm2: "1.04-2.63",
    awg: "18",
    maxCurrentA: "17",
  },
  {
    colorCode: "Black",
    wireSizeRangeMm2: "2.63-4.60",
    awg: "16",
    maxCurrentA: "19",
  },
  {
    colorCode: "Black",
    wireSizeRangeMm2: "2.63-4.60",
    awg: "14",
    maxCurrentA: "27",
  },
  {
    colorCode: "Yellow",
    wireSizeRangeMm2: "2.63-6.64",
    awg: "12",
    maxCurrentA: "37",
  },
  {
    colorCode: "Yellow",
    wireSizeRangeMm2: "2.63-6.64",
    awg: "10",
    maxCurrentA: "48",
  },
  {
    colorCode: "Red",
    wireSizeRangeMm2: "6.64-10.52",
    awg: "8",
    maxCurrentA: "62",
  },
  {
    colorCode: "Blue",
    wireSizeRangeMm2: "10.52-16.78",
    awg: "6",
    maxCurrentA: "88",
  },
  {
    colorCode: "Yellow",
    wireSizeRangeMm2: "16.78-26.66",
    awg: "4",
    maxCurrentA: "115",
  },
  {
    colorCode: "Red",
    wireSizeRangeMm2: "26.66-42.42",
    awg: "2",
    maxCurrentA: "160",
  },
  {
    colorCode: "Blue",
    wireSizeRangeMm2: "42.42-60.57",
    awg: "1/0",
    maxCurrentA: "215",
    notes: "Largest stable range retained in the main table.",
  },
];

export const studSizeRows: StudSizeRow[] = [
  { studSizeInch: "#2", studSizeMm: "2.0", holeSizeMm: "2.2", holeSizeInch: ".087" },
  { studSizeInch: "#3", studSizeMm: "2.5", holeSizeMm: "2.7", holeSizeInch: ".106" },
  { studSizeInch: "#4", studSizeMm: "3.0", holeSizeMm: "3.2", holeSizeInch: ".126" },
  { studSizeInch: "#6", studSizeMm: "3.5", holeSizeMm: "3.7", holeSizeInch: ".146" },
  { studSizeInch: "#8", studSizeMm: "4.0", holeSizeMm: "4.3", holeSizeInch: ".169" },
  { studSizeInch: "#10", studSizeMm: "5.0", holeSizeMm: "5.3", holeSizeInch: ".209" },
  { studSizeInch: "1/4\"", studSizeMm: "6.0", holeSizeMm: "6.4", holeSizeInch: ".252" },
  { studSizeInch: "5/16\"", studSizeMm: "8.0", holeSizeMm: "8.4", holeSizeInch: ".331" },
  { studSizeInch: "3/8\"", studSizeMm: "10.0", holeSizeMm: "10.5", holeSizeInch: ".413" },
  { studSizeInch: "7/16\"", studSizeMm: "11.0", holeSizeMm: "11.5", holeSizeInch: ".453" },
  { studSizeInch: "1/2\"", studSizeMm: "12.0", holeSizeMm: "13.0", holeSizeInch: ".512" },
  { studSizeInch: "9/16\"", studSizeMm: "14.0", holeSizeMm: "15.0", holeSizeInch: ".591" },
  { studSizeInch: "5/8\"", studSizeMm: "16.0", holeSizeMm: "17.0", holeSizeInch: ".669" },
  { studSizeInch: "11/16\"", studSizeMm: "18.0", holeSizeMm: "19.0", holeSizeInch: ".748" },
  { studSizeInch: "3/4\"", studSizeMm: "20.0", holeSizeMm: "21.0", holeSizeInch: ".827" },
  { studSizeInch: "7/8\"", studSizeMm: "22.0", holeSizeMm: "23.0", holeSizeInch: ".906" },
  { studSizeInch: "15/16\"", studSizeMm: "24.0", holeSizeMm: "25.0", holeSizeInch: ".984" },
];

export const selectionGuideFaqItems = [
  {
    question: "How should I start terminal selection?",
    answer:
      "Start with terminal form, then verify insulation code and wire range, and finally confirm stud and hole size for mounting.",
  },
  {
    question: "Why are some large-conductor ranges not shown in the main table?",
    answer:
      "Large-conductor tail ranges in the source chart contain inconsistent or incomplete values, so the main selection table keeps only stable intervals.",
  },
  {
    question: "Can I select only by wire size?",
    answer:
      "No. Wire size is only one factor. Terminal form, insulation style, and stud compatibility must be validated together.",
  },
  {
    question: "What is the difference between stud size and hole size?",
    answer:
      "Stud size is the fastener diameter. Hole size is the terminal opening needed to pass over that stud.",
  },
  {
    question: "Should I rely on this chart as a final product specification?",
    answer:
      "Use it as an engineering reference. Final selection should still be confirmed against the target product specification sheet.",
  },
] as const;

export const readMoreItems = [
  {
    title: "How terminal model codes work",
    body: "Model codes usually combine terminal form, insulation code, wire range, and mounting-related dimensions.",
  },
  {
    title: "Why insulation code matters",
    body: "Insulation code reflects material and crimp structure, which influences temperature rating and handling preference.",
  },
  {
    title: "Why color coding improves speed",
    body: "Color coding helps engineers quickly narrow applicable wire size ranges before checking full product specs.",
  },
  {
    title: "Why stud matching is critical",
    body: "Stud and hole mismatch can reduce fastening stability and increase contact risk during operation.",
  },
] as const;
