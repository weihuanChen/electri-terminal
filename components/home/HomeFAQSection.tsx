import SectionHeader from "@/components/shared/SectionHeader";
import FAQAccordion from "@/components/shared/FAQAccordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface HomeFAQSectionProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
}

export default function HomeFAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Quick answers for product selection, customization, and project sourcing.",
  items = [
    {
      question: "What are ring terminals used for?",
      answer:
        "Ring terminals are used to create secure and stable connections in electrical wiring systems, especially where vibration resistance is required.",
    },
    {
      question: "How do I choose the right ring terminal size?",
      answer:
        "Selection depends on wire size, stud size, and current requirements. Contact us for recommendations.",
    },
    {
      question: "Do you support custom specifications?",
      answer:
        "Yes. We support customization based on drawings, samples, or application requirements, with tolerances down to ±0.01 mm on critical dimensions.",
    },
    {
      question: "What materials are available?",
      answer:
        "Common materials include copper, tinned copper, and other conductive metals depending on application.",
    },
    {
      question: "Do you provide certifications like UL?",
      answer:
        "We offer products manufactured by partner factories with certifications such as UL, cULus, and CE. Certified models are available for specific product series. Please contact us to confirm certification details for your application.",
    },
  ],
}: HomeFAQSectionProps) {
  return (
    <section className="section bg-slate-50/70 dark:bg-slate-900/50">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              eyebrow="Sourcing Q&A"
              title={title}
              subtitle={subtitle}
              align="left"
              className="!mb-0"
            />
          </div>
          <div>
            <FAQAccordion items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}
