import { ConvexHttpClient } from "convex/browser";
import { pathToFileURL } from "node:url";
import {
  groupPatchFor,
  inheritancePolicy,
} from "./seed-first-five-intent-hierarchy.mjs";

export const nextTenFamilies = [
  {
    id: "kn7b2ep3zxs38z0pnbcpqk9k0983rk7d",
    key: "cold_press_pin_terminals",
    name: "Cold Press Pin Terminals",
    template: {
      goal: "Help industrial buyers understand and select cold-press pin terminal configurations using verified conductor fit, pin-interface dimensions, specification range, and installation criteria.",
      definition: "Define cold-press pin terminals and explain how their pin-style contact provides a compact conductor termination for compatible clamping or mating interfaces.",
      selection: "Guide selection by conductor compatibility, barrel fit, pin dimensions, specification range, receiving-interface compatibility, and installation requirements.",
      application: "Help buyers evaluate suitability for documented terminal-block, control-panel, equipment-wiring, and compact termination contexts.",
      overview: "Define cold-press pin terminal configurations and explain the compact pin-style termination problem they address.",
      selectionSection: "Explain shared pin-terminal selection logic and apply page-specific conductor, barrel, pin-interface, and specification-range limits.",
      applicationsSection: "Describe only approved pin-termination and equipment-wiring contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, conductor-fit, and pin-interface evidence without generalizing across specification ranges.",
    },
    groups: [
      {
        key: "pin_cold_press",
        name: "Pin Cold Press Terminals",
        description: "Cold-press pin terminal pages sharing pin-interface selection logic across documented specification ranges.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["pin-cold-press-terminals"], required: true }],
        differentiators: [{ key: "specification_range", label: "Pin terminal specification range", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02"], intentImpact: "Changes eligible conductor, barrel, and pin-interface dimensions while retaining the same pin-terminal selection objective." }],
        goal: "Help buyers understand and select cold-press pin terminal configurations based on conductor compatibility, barrel fit, pin-interface dimensions, and specification range.",
        selectionIntent: "Define the shared selection criteria for cold-press pin terminal configurations while keeping conductor, barrel, and pin dimensions bound to each specification-range page.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn7frgwjgsa5zg9nk7esa2s15d83spc4",
    key: "cold_press_ring_terminals",
    name: "Cold Press Ring Terminals",
    template: {
      goal: "Help industrial buyers understand and select cold-press ring terminal configurations using verified conductor fit, stud or screw interface, specification range, and installation criteria.",
      definition: "Define cold-press ring terminals and explain how their closed ring interface supports conductor termination to a compatible stud or screw connection.",
      selection: "Guide selection by conductor compatibility, barrel fit, stud or screw size, ring dimensions, specification range, and installation requirements.",
      application: "Help buyers evaluate suitability for documented wire-to-stud, panel, equipment, and secure fastening contexts.",
      overview: "Define cold-press ring terminal configurations and explain the secure wire-to-stud connection problem they address.",
      selectionSection: "Explain shared ring-terminal selection logic and apply page-specific conductor, barrel, stud-opening, and specification-range limits.",
      applicationsSection: "Describe only approved wire-to-stud and equipment-wiring contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, stud-fit, and conductor-fit evidence without generalizing across specification ranges.",
    },
    groups: [
      {
        key: "circular_cold_press",
        name: "Circular Cold Press Ring Terminals",
        description: "Circular cold-press ring terminal pages sharing wire-to-stud selection logic across documented specification ranges.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["circular-cold-press-terminals"], required: true }],
        differentiators: [{ key: "specification_range", label: "Ring terminal specification range", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02", "g03", "g04"], intentImpact: "Changes eligible conductor, barrel, and stud-opening combinations while retaining the same ring-terminal selection objective." }],
        goal: "Help buyers understand and select circular cold-press ring terminal configurations based on conductor compatibility, stud or screw fit, ring dimensions, and specification range.",
        selectionIntent: "Define the shared selection criteria for circular cold-press ring terminal configurations while keeping conductor, barrel, ring, and stud-opening limits bound to each specification-range page.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn784r0r80nrrp1bc7awmktmpd83rgfa",
    key: "standard_copper_lugs",
    name: "Copper Lugs (Standard Type)",
    template: {
      goal: "Help industrial buyers understand and select standard copper lug configurations using verified conductor fit, mounting interface, lug series, dimensional compatibility, and installation criteria.",
      definition: "Define standard copper lugs and explain how their conductor barrel and mounting palm provide a cable termination to compatible studs, bolts, or equipment interfaces.",
      selection: "Guide selection by conductor compatibility, barrel dimensions, stud or bolt opening, lug series and form, dimensional fit, and cable-routing requirements.",
      application: "Help buyers evaluate suitability for documented cable-termination, power-distribution, equipment, panel, and marine-series contexts.",
      overview: "Define standard copper lug configurations and explain the cable-to-mounting-interface termination problem they address.",
      selectionSection: "Explain shared lug-selection logic and apply page-specific conductor, barrel, mounting-hole, series, and dimensional limits.",
      applicationsSection: "Describe only approved cable-termination contexts supported by series-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, mounting, and conductor-fit evidence without transferring claims between SC, KSC, AWG, DTGY, or other lug series.",
    },
    groups: [
      {
        key: "sc_dtga_standard",
        name: "SC (DTGA) Standard Copper Lugs",
        description: "Straight SC/DTGA copper lug pages sharing conductor-to-mounting-interface selection logic.",
        criteria: [{ fieldPath: "product.model", operator: "in", values: ["sc-dtga-copper-lugs-g02"], required: true }],
        differentiators: [{ key: "lug_series", label: "Lug series and form", sourcePaths: ["product.model", "sourcePayload.title"], values: ["SC_DTGA_STRAIGHT"], intentImpact: "Keeps SC-series conductor, barrel, mounting-hole, and palm dimensions separate from other lug constructions." }],
        goal: "Help buyers understand and select straight SC (DTGA) copper lug configurations based on conductor compatibility, barrel dimensions, mounting-hole fit, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for straight SC (DTGA) copper lug configurations while keeping conductor ranges, mounting dimensions, and ratings bound to exact SC evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "ksc_dtga_bell_mouth",
        name: "KSC (DTGA) Bell-Mouth Copper Lugs",
        description: "KSC/DTGA bell-mouth copper lug pages with a documented flared barrel-entry form.",
        criteria: [{ fieldPath: "product.model", operator: "in", values: ["ksc-dtga-bell-mouth-copper-lugs-g02"], required: true }],
        differentiators: [{ key: "lug_series", label: "Lug series and barrel-entry form", sourcePaths: ["product.model", "sourcePayload.title"], values: ["KSC_DTGA_BELL_MOUTH"], intentImpact: "Makes the bell-mouth barrel-entry form and its documented dimensions part of selection without transferring SC-series data." }],
        goal: "Help buyers understand and select KSC (DTGA) bell-mouth copper lug configurations based on conductor compatibility, flared barrel-entry dimensions, mounting-hole fit, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for KSC (DTGA) bell-mouth copper lug configurations while keeping conductor ranges, bell-mouth geometry, mounting dimensions, and ratings bound to exact KSC evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "awg_american_standard",
        name: "AWG American Standard Copper Tube Lugs",
        description: "AWG-referenced copper tube lug pages sharing American conductor-size and mounting-interface selection logic.",
        criteria: [{ fieldPath: "product.model", operator: "in", values: ["awg-american-standard-copper-tube-lugs-g01"], required: true }],
        differentiators: [{ key: "sizing_system", label: "Conductor sizing system", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["AWG_AMERICAN_STANDARD"], intentImpact: "Requires buyers to verify the documented AWG conductor range and dimensional mapping rather than transfer metric-series assumptions." }],
        goal: "Help buyers understand and select AWG American-standard copper tube lug configurations based on documented conductor sizing, barrel dimensions, mounting-hole fit, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for AWG American-standard copper tube lug configurations while keeping conductor mappings, dimensions, and ratings bound to exact AWG-series evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "dtgy_marine",
        name: "DTGY Marine Series Copper Lugs",
        description: "DTGY marine-series copper lug pages sharing series-specific cable-termination logic across documented specification ranges.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["dtgy-marine-copper-lugs"], required: true }],
        differentiators: [{ key: "specification_range", label: "DTGY marine-series range", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02"], intentImpact: "Changes eligible conductor and mounting combinations while keeping marine-series claims strictly evidence-bound." }],
        goal: "Help buyers understand and select DTGY marine-series copper lug configurations based on conductor compatibility, barrel dimensions, mounting-hole fit, specification range, and documented installation requirements.",
        selectionIntent: "Define the shared selection criteria for DTGY marine-series copper lug configurations while keeping conductor ranges, dimensions, construction, and application claims bound to each product page.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn7dgsad9q3sdqpqzzdtmf6bh583rx43",
    key: "standard_cord_end_terminals",
    name: "Cord End Terminals (Standard Type)",
    template: {
      goal: "Help industrial buyers understand and select standard cord end terminal configurations using verified conductor fit, barrel dimensions, insulation construction, receiving-interface compatibility, and installation criteria.",
      definition: "Define standard cord end terminals and explain how they consolidate conductor strands into a controlled termination for compatible clamps or terminal blocks.",
      selection: "Guide selection by conductor compatibility, barrel diameter and length, insulated or non-insulated construction, specification range, receiving-interface fit, and installation requirements.",
      application: "Help buyers evaluate suitability for documented terminal-block, control-panel, equipment-wiring, and stranded-conductor termination contexts.",
      overview: "Define standard cord end terminal configurations and explain the stranded-conductor termination problem they address.",
      selectionSection: "Explain shared cord-end selection logic and apply page-specific conductor, barrel, length, insulation, and specification-range limits.",
      applicationsSection: "Describe only approved cord-end and terminal-block contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, insulation, and conductor-fit evidence without transferring claims between insulated and non-insulated configurations.",
    },
    groups: [
      {
        key: "vinyl_insulated_tg_jt",
        name: "Vinyl-Insulated Cord End Terminals (TG-JT Type)",
        description: "TG-JT cord end terminal pages with documented vinyl insulation construction.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["vinyl-insulated-cord-end-terminals"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["vinyl"], intentImpact: "Makes documented vinyl insulation and compatible conductor and barrel dimensions part of selection without implying unsupported safety ratings." }],
        goal: "Help buyers understand and select vinyl-insulated TG-JT cord end terminal configurations based on conductor compatibility, barrel dimensions, insulation construction, and receiving-interface fit.",
        selectionIntent: "Define the shared selection criteria for vinyl-insulated TG-JT cord end terminal configurations while keeping conductor ranges, barrel dimensions, and insulation claims bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "non_insulated_tg_jt",
        name: "Non-Insulated Cord End Terminals (TG-JT Type)",
        description: "Non-insulated TG-JT cord end terminal pages sharing barrel-fit selection logic across specification ranges.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["non-insulated-cord-end-terminals"], required: true }],
        differentiators: [{ key: "specification_range", label: "Non-insulated cord-end range", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02"], intentImpact: "Changes eligible conductor and barrel-length combinations without implying insulation properties." }],
        goal: "Help buyers understand and select non-insulated TG-JT cord end terminal configurations based on conductor compatibility, barrel dimensions, specification range, and receiving-interface fit.",
        selectionIntent: "Define the shared selection criteria for non-insulated TG-JT cord end terminal configurations while keeping conductor and barrel limits bound to each specification-range page.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn7fsfdbj5mbpebsrr7hjd3n4583sybc",
    key: "female_quick_disconnects",
    name: "Female Quick Disconnects",
    template: {
      goal: "Help industrial buyers understand and select female quick-disconnect configurations using verified conductor fit, receptacle interface, insulation construction, mating compatibility, and installation criteria.",
      definition: "Define female quick disconnects and explain how their receptacle interface enables a removable conductor connection to a compatible male tab.",
      selection: "Guide selection by conductor compatibility, receptacle width and thickness, mating-tab dimensions, vinyl or nylon insulation construction, and installation requirements.",
      application: "Help buyers evaluate suitability for documented removable wiring, equipment, appliance, panel, and maintenance-access contexts.",
      overview: "Define female quick-disconnect configurations and explain the removable tab-connection problem they address.",
      selectionSection: "Explain shared quick-disconnect selection logic and apply page-specific conductor, receptacle, mating-tab, and insulation limits.",
      applicationsSection: "Describe only approved removable-connection contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, insulation, and mating-interface evidence without transferring claims between vinyl- and nylon-insulated configurations.",
    },
    groups: [
      {
        key: "vinyl_insulated_female",
        name: "Vinyl-Insulated Female Quick Disconnects",
        description: "Female quick-disconnect pages with documented vinyl insulation construction.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["vinyl-insulated-female-quick-disconnects"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["vinyl"], intentImpact: "Keeps vinyl insulation, conductor fit, and receptacle dimensions separate from nylon-insulated configurations." }],
        goal: "Help buyers understand and select vinyl-insulated female quick-disconnect configurations based on conductor compatibility, receptacle dimensions, mating-tab fit, and documented insulation construction.",
        selectionIntent: "Define the shared selection criteria for vinyl-insulated female quick-disconnect configurations while keeping conductor ranges, receptacle dimensions, and insulation claims bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "nylon_insulated_female",
        name: "Nylon-Insulated Female Quick Disconnects",
        description: "Female quick-disconnect pages with documented nylon insulation construction.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["nylon-insulated-female-quick-disconnects"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["nylon"], intentImpact: "Keeps nylon insulation, conductor fit, and receptacle dimensions separate from vinyl-insulated configurations." }],
        goal: "Help buyers understand and select nylon-insulated female quick-disconnect configurations based on conductor compatibility, receptacle dimensions, mating-tab fit, and documented insulation construction.",
        selectionIntent: "Define the shared selection criteria for nylon-insulated female quick-disconnect configurations while keeping conductor ranges, receptacle dimensions, and insulation claims bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn74rtrbxq412xaza5zh33c2wd83s9ms",
    key: "standard_flag_terminals",
    name: "Flag Terminals (Standard Type)",
    template: {
      goal: "Help industrial buyers understand and select standard flag terminal configurations using verified conductor fit, receptacle interface, right-angle routing clearance, and installation criteria.",
      definition: "Define standard flag terminals and explain how their right-angle receptacle orientation supports removable connections where straight cable approach is constrained.",
      selection: "Guide selection by conductor compatibility, barrel fit, receptacle and mating-tab dimensions, right-angle orientation, routing clearance, and installation requirements.",
      application: "Help buyers evaluate suitability for documented equipment, panel, appliance, compact-routing, and maintenance-access contexts.",
      overview: "Define standard flag terminal configurations and explain the right-angle removable-connection problem they address.",
      selectionSection: "Explain shared flag-terminal selection logic and apply page-specific conductor, barrel, receptacle, mating-tab, and clearance limits.",
      applicationsSection: "Describe only approved right-angle removable-connection contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, conductor-fit, and mating-interface evidence without generalizing across variants.",
    },
    groups: [
      {
        key: "non_insulated_flag",
        name: "Non-Insulated Flag Terminals",
        description: "Non-insulated flag terminal pages sharing right-angle receptacle and routing-clearance selection logic.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["non-insulated-flag-terminals"], required: true }],
        differentiators: [{ key: "connection_orientation", label: "Receptacle orientation", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["flag_right_angle"], intentImpact: "Makes right-angle mating orientation and routing clearance explicit while avoiding unsupported insulation claims." }],
        goal: "Help buyers understand and select non-insulated flag terminal configurations based on conductor compatibility, receptacle dimensions, mating-tab fit, and right-angle routing clearance.",
        selectionIntent: "Define the shared selection criteria for non-insulated flag terminal configurations while keeping conductor ranges, receptacle dimensions, and clearance requirements bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn73b68aqnp9rjqx3m2bjbdqrx83sr3s",
    key: "standard_fork_terminals",
    name: "Fork Terminals (Standard Type)",
    template: {
      goal: "Help industrial buyers understand and select standard fork terminal configurations using verified conductor fit, stud or screw interface, fork geometry, orientation, and installation criteria.",
      definition: "Define standard fork terminals and explain how their open fork interface supports wire attachment and removal at compatible studs or screws.",
      selection: "Guide selection by conductor compatibility, barrel fit, stud or screw size, fork opening and tongue dimensions, orientation, specification range, and installation requirements.",
      application: "Help buyers evaluate suitability for documented terminal-strip, panel, equipment, serviceable wiring, and wire-to-screw contexts.",
      overview: "Define standard fork terminal configurations and explain the serviceable wire-to-screw connection problem they address.",
      selectionSection: "Explain shared fork-terminal selection logic and apply page-specific conductor, barrel, stud-opening, fork-geometry, orientation, and range limits.",
      applicationsSection: "Describe only approved wire-to-screw and serviceable wiring contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, stud-fit, orientation, and conductor-fit evidence without generalizing across specification ranges.",
    },
    groups: [
      {
        key: "non_insulated_tu_type",
        name: "Non-Insulated Fork Terminals (TU Type)",
        description: "Non-insulated TU-type fork terminal pages sharing wire-to-screw selection logic across specification and orientation ranges.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["non-insulated-fork-terminals"], required: true }],
        differentiators: [{ key: "specification_range", label: "Fork terminal range and orientation", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02"], intentImpact: "Changes conductor, stud-opening, fork-geometry, and documented orientation combinations while retaining the same TU-type selection objective." }],
        goal: "Help buyers understand and select non-insulated TU-type fork terminal configurations based on conductor compatibility, stud or screw fit, fork geometry, orientation, and specification range.",
        selectionIntent: "Define the shared selection criteria for non-insulated TU-type fork terminal configurations while keeping conductor, stud-opening, fork-dimension, and orientation limits bound to each page.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn72sgeq71bwgxmb9bx2m79tm183sy33",
    key: "fully_insulated_quick_disconnects",
    name: "Fully Insulated Quick Disconnects",
    template: {
      goal: "Help industrial buyers understand and select fully insulated quick-disconnect configurations using verified conductor fit, receptacle interface, insulation and crimp construction, mating compatibility, and installation criteria.",
      definition: "Define fully insulated quick disconnects and explain how their covered receptacle interface provides a removable conductor connection to a compatible male tab.",
      selection: "Guide selection by conductor compatibility, receptacle and mating-tab dimensions, full-insulation construction, documented single- or double-crimp arrangement, product range, and installation requirements.",
      application: "Help buyers evaluate suitability for documented removable wiring, equipment, appliance, panel, and maintenance-access contexts.",
      overview: "Define fully insulated quick-disconnect configurations and explain the covered removable-tab connection problem they address.",
      selectionSection: "Explain shared fully insulated quick-disconnect selection logic and apply page-specific conductor, receptacle, mating-tab, insulation, crimp, and range limits.",
      applicationsSection: "Describe only approved fully insulated removable-connection contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, insulation, crimp, and mating-interface evidence without generalizing across product ranges.",
    },
    groups: [
      {
        key: "double_crimp_vinyl_fully_insulated_female",
        name: "Double-Crimp Vinyl Fully Insulated Female Quick Disconnects",
        description: "Double-crimp vinyl fully insulated female quick-disconnect pages sharing covered receptacle and secondary-crimp selection logic.",
        criteria: [{ fieldPath: "product.model", operator: "in", values: ["double-crimp-vinyl-fully-insulated-female-quick-disconnects-g01", "double-crimp-vinyl-fully-insulated-female-quick-disconnects-g02", "double-crimp-vinyl-fully-insulated-female-quick-disconnects-g05"], required: true }],
        differentiators: [{ key: "crimp_construction", label: "Insulation and crimp construction", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["vinyl_fully_insulated_double_crimp"], intentImpact: "Makes documented double-crimp construction, covered receptacle geometry, and product range part of selection without transferring dimensions between pages." }],
        goal: "Help buyers understand and select double-crimp vinyl fully insulated female quick-disconnect configurations based on conductor compatibility, receptacle dimensions, mating-tab fit, crimp construction, and product range.",
        selectionIntent: "Define the shared selection criteria for double-crimp vinyl fully insulated female quick-disconnect configurations while keeping conductor ranges, receptacle dimensions, crimp details, and ratings bound to exact page evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "vinyl_fully_insulated_female",
        name: "Vinyl Fully Insulated Female Quick Disconnects",
        description: "Vinyl fully insulated female quick-disconnect pages sharing covered receptacle selection logic without assuming double-crimp construction.",
        criteria: [{ fieldPath: "product.model", operator: "in", values: ["vinyl-fully-insulated-female-quick-disconnects-g01"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation and crimp construction", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["vinyl_fully_insulated"], intentImpact: "Keeps covered receptacle, insulation, and documented crimp construction separate from double-crimp product ranges." }],
        goal: "Help buyers understand and select vinyl fully insulated female quick-disconnect configurations based on conductor compatibility, receptacle dimensions, mating-tab fit, insulation construction, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for vinyl fully insulated female quick-disconnect configurations while keeping conductor ranges, receptacle dimensions, crimp details, and ratings bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn7f84pxjmn6dx56n3wwjdf0px83rksm",
    key: "heat_shrink_fork_terminals",
    name: "Heat Shrink Fork Terminals",
    template: {
      goal: "Help industrial buyers understand and select heat-shrink fork terminal configurations using verified conductor fit, stud or screw interface, fork geometry, heat-shrink construction, and installation criteria.",
      definition: "Define heat-shrink fork terminals and explain how their fork interface and documented heat-shrink construction support a wire-to-screw termination.",
      selection: "Guide selection by conductor compatibility, barrel fit, stud or screw size, fork dimensions, documented heat-shrink construction, and installation-process requirements.",
      application: "Help buyers evaluate suitability for documented wire-to-screw, equipment, panel, maintenance, and installation contexts without assuming unsupported sealing or environmental ratings.",
      overview: "Define heat-shrink fork terminal configurations and explain the protected wire-to-screw termination problem they address.",
      selectionSection: "Explain shared heat-shrink fork selection logic and apply page-specific conductor, barrel, stud-opening, fork-geometry, and installation limits.",
      applicationsSection: "Describe only approved heat-shrink fork installation contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, heat-shrink, stud-fit, and conductor-fit evidence without implying undocumented environmental performance.",
    },
    groups: [
      {
        key: "shb_heat_shrink_fork",
        name: "SHB Heat Shrink Fork Terminals",
        description: "SHB-series heat-shrink fork terminal pages sharing conductor-to-stud and installation-process selection logic.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["shb-heat-shrink-fork-terminals"], required: true }],
        differentiators: [{ key: "terminal_series", label: "Heat-shrink fork series", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["SHB"], intentImpact: "Keeps SHB conductor, stud-opening, fork-geometry, heat-shrink, and installation evidence within the documented series." }],
        goal: "Help buyers understand and select SHB heat-shrink fork terminal configurations based on conductor compatibility, stud or screw fit, fork geometry, documented heat-shrink construction, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for SHB heat-shrink fork terminal configurations while keeping dimensions, installation conditions, and performance implications bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn78ea2zntkc0kmvk54bwd500583sxh6",
    key: "heat_shrink_quick_disconnects",
    name: "Heat Shrink Quick Disconnects",
    template: {
      goal: "Help industrial buyers understand and select heat-shrink quick-disconnect configurations using verified conductor fit, receptacle interface, mating compatibility, heat-shrink construction, and installation criteria.",
      definition: "Define heat-shrink quick disconnects and explain how their receptacle interface and documented heat-shrink construction support a removable connection to a compatible male tab.",
      selection: "Guide selection by conductor compatibility, barrel fit, receptacle and mating-tab dimensions, documented heat-shrink construction, and installation-process requirements.",
      application: "Help buyers evaluate suitability for documented removable wiring, equipment, maintenance, and installation contexts without assuming unsupported sealing or environmental ratings.",
      overview: "Define heat-shrink quick-disconnect configurations and explain the protected removable-tab connection problem they address.",
      selectionSection: "Explain shared heat-shrink quick-disconnect selection logic and apply page-specific conductor, barrel, receptacle, mating-tab, and installation limits.",
      applicationsSection: "Describe only approved heat-shrink removable-connection contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, heat-shrink, conductor-fit, and mating-interface evidence without implying undocumented environmental performance.",
    },
    groups: [
      {
        key: "fdh_heat_shrink_female",
        name: "FDH Heat Shrink Female Quick Disconnects",
        description: "FDH-series heat-shrink female quick-disconnect pages sharing receptacle, mating-tab, and installation-process selection logic.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["fdh-heat-shrink-female-terminals"], required: true }],
        differentiators: [{ key: "terminal_series", label: "Heat-shrink quick-disconnect series", sourcePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"], values: ["FDH"], intentImpact: "Keeps FDH conductor, receptacle, mating-tab, heat-shrink, and installation evidence within the documented series." }],
        goal: "Help buyers understand and select FDH heat-shrink female quick-disconnect configurations based on conductor compatibility, receptacle dimensions, mating-tab fit, documented heat-shrink construction, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for FDH heat-shrink female quick-disconnect configurations while keeping dimensions, installation conditions, and performance implications bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
];

export function intentForFamily(family) {
  return {
    schemaVersion: 2,
    pageRole: "industrial_product_selection",
    entityScope: "product_group",
    primaryAudience: [
      "electrical_engineer",
      "panel_builder",
      "industrial_buyer",
    ],
    buyerStage: ["product_discovery", "evaluation", "procurement"],
    primaryGoal: family.template.goal,
    primaryConceptIds: [],
    secondaryConceptIds: [],
    mustCommunicate: [
      {
        key: "product_definition",
        intent: family.template.definition,
        inheritanceMode: "shared",
        evidenceRequirement: "approved_group_or_page_evidence",
      },
      {
        key: "selection_logic",
        intent: family.template.selection,
        inheritanceMode: "shared_with_page_delta",
        evidenceRequirement:
          "shared_selection_logic_plus_page_specific_ranges",
      },
      {
        key: "application_fit",
        intent: family.template.application,
        inheritanceMode: "shared",
        evidenceRequirement: "approved_group_or_page_evidence",
      },
      {
        key: "evidence_boundary",
        intent:
          "Keep dimensions, construction details, ratings, and performance implications tied to exact product evidence.",
        inheritanceMode: "shared",
        evidenceRequirement: "mandatory_page_evidence_for_specific_claims",
      },
    ],
    verifiedClaims: [],
    prohibitedClaims: [
      "Unsupported certification, compliance, material, current, voltage, environmental, or safety claims",
      "Applying one variant's dimensions, ratings, or construction details to all variants or configurations without exact evidence",
      "Unqualified best, leading, universal, or guaranteed-performance claims",
    ],
    conversionIntent: {
      primaryAction: "request_quote",
      secondaryAction: "contact_engineering",
    },
    sectionIntents: [
      {
        sectionKey: "overview",
        purpose: family.template.overview,
        inheritanceMode: "shared",
        requiredEvidenceClass: "group_definition",
      },
      {
        sectionKey: "selection",
        purpose: family.template.selectionSection,
        inheritanceMode: "shared_with_page_delta",
        requiredEvidenceClass: "page_selection_data",
      },
      {
        sectionKey: "applications",
        purpose: family.template.applicationsSection,
        inheritanceMode: "shared",
        requiredEvidenceClass: "approved_application_evidence",
      },
      {
        sectionKey: "technical_evidence",
        purpose: family.template.technicalSection,
        inheritanceMode: "page_specific",
        requiredEvidenceClass: "page_product_evidence",
      },
    ],
    extensions: {
      pageSpecificSelectionMode: "optional_until_multiple_members",
      pageSpecificTechnicalEvidenceRequired: true,
      sharedApplicationStatus: "pending_approved_evidence",
      sharedDefinitionStatus: "approved",
    },
  };
}

function stable(value) {
  if (value === undefined) return "";
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`)
    .join(",")}}`;
}

export async function seedFamilyIntentTemplatesAndGroups(families) {
  const url =
    process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("convex_url_required");
  const actor = process.env.INTENT_SEED_ACTOR || "admin@admin.com";
  const client = new ConvexHttpClient(url);
  const results = [];

  for (const family of families) {
    const workspace = await client.query(
      "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
      { familyId: family.id },
    );
    let templateBundle = workspace.templates[0];
    let templateId = templateBundle?.template._id;
    if (!templateId) {
      templateId = await client.mutation(
        "mutations/admin/intentHierarchy:createFamilyIntentTemplate",
        {
          familyId: family.id,
          key: family.key,
          name: `${family.name} Shared Intent`,
          owner: actor,
          actor,
        },
      );
    }

    const approvedRevision = templateBundle?.revisions.find(
      (revision) =>
        String(revision._id) ===
        String(templateBundle.template.approvedRevisionId),
    );
    const desiredIntent = intentForFamily(family);
    const needsRevision =
      !approvedRevision ||
      approvedRevision.schemaVersion !== 2 ||
      stable(approvedRevision.intent) !== stable(desiredIntent) ||
      stable(approvedRevision.inheritancePolicy) !== stable(inheritancePolicy);

    let revisionId = approvedRevision?._id ?? null;
    if (needsRevision) {
      let sourceSnapshotIds = approvedRevision?.sourceSnapshotIds ?? [];
      if (!sourceSnapshotIds.length) {
        const snapshotId = await client.mutation(
          "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
          { entityType: "family", sourceId: family.id, actor },
        );
        sourceSnapshotIds = [snapshotId];
      }
      revisionId = await client.mutation(
        "mutations/admin/intentHierarchy:createFamilyIntentTemplateRevision",
        {
          templateId,
          sourceSnapshotIds,
          intent: desiredIntent,
          inheritancePolicy,
          coverageEvidence: {
            mode: "manual_catalog_review",
            familyName: family.name,
            formatAlignment: "angled_blade_v2_family_template",
            sourcePaths: [
              "sourcePayload.summary",
              "sourcePayload.pageConfig",
              "evidencePayload.products",
            ],
          },
          actor,
        },
      );
      await client.mutation(
        "mutations/admin/intentHierarchy:approveFamilyIntentTemplateRevision",
        {
          revisionId,
          actor,
          note: "Initial approved v2 Family Template",
        },
      );
    }

    const groupResults = [];
    for (const groupDefinition of family.groups) {
      const existingGroupBundle = workspace.groups.find(
        ({ group }) => group.key === groupDefinition.key,
      );
      let groupId = existingGroupBundle?.group._id;
      if (!groupId) {
        groupId = await client.mutation(
          "mutations/admin/intentHierarchy:createProductIntentGroup",
          {
            templateId,
            key: groupDefinition.key,
            name: groupDefinition.name,
            description: groupDefinition.description,
            owner: actor,
            actor,
          },
        );
      }
      const approvedGroupRevision = existingGroupBundle?.revisions.find(
        (revision) =>
          String(revision._id) ===
          String(existingGroupBundle.group.approvedRevisionId),
      );
      const desiredPatch = groupPatchFor(groupDefinition);
      const groupNeedsRevision =
        !approvedGroupRevision ||
        approvedGroupRevision.schemaVersion !== 2 ||
        stable(approvedGroupRevision.membershipCriteria) !==
          stable(groupDefinition.criteria) ||
        stable(approvedGroupRevision.differentiators) !==
          stable(groupDefinition.differentiators) ||
        stable(approvedGroupRevision.intentPatch) !== stable(desiredPatch) ||
        stable(approvedGroupRevision.requiredEvidencePaths) !==
          stable(groupDefinition.evidencePaths) ||
        approvedGroupRevision.samplePolicy.minimumCount !== 1;

      let groupRevisionId = approvedGroupRevision?._id ?? null;
      if (groupNeedsRevision) {
        groupRevisionId = await client.mutation(
          "mutations/admin/intentHierarchy:createProductIntentGroupRevision",
          {
            groupId,
            membershipCriteria: groupDefinition.criteria,
            differentiators: groupDefinition.differentiators,
            intentPatch: desiredPatch,
            requiredEvidencePaths: groupDefinition.evidencePaths,
            sampleMinimumCount: 1,
            samplePercentage:
              approvedGroupRevision?.samplePolicy.percentage ?? 20,
            actor,
          },
        );
        await client.mutation(
          "mutations/admin/intentHierarchy:approveProductIntentGroupRevision",
          {
            revisionId: groupRevisionId,
            actor,
            note: "Initial approved v2 Product Group",
          },
        );
      }

      groupResults.push({
        key: groupDefinition.key,
        groupCreated: !existingGroupBundle,
        revisionCreated: groupNeedsRevision,
        groupId,
        revisionId: groupRevisionId,
      });
    }

    results.push({
      family: family.name,
      templateCreated: !templateBundle,
      revisionCreated: needsRevision,
      templateId,
      revisionId,
      groups: groupResults,
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await seedFamilyIntentTemplatesAndGroups(nextTenFamilies);
}
