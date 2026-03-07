import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Common questions about ClearRx drug interaction checker — how it works, data privacy, severity ratings, and how to use results with your healthcare provider.",
};

const FAQS = [
  {
    question: "What is ClearRx?",
    answer:
      "ClearRx is a free, browser-based drug interaction checker built and reviewed by a licensed pharmacist. It lets you look up potential interactions between medications and understand them in plain English, without clinical jargon or information overload.",
  },
  {
    question: "How does the drug interaction checker work?",
    answer:
      "You enter the medications you are currently taking or considering, and ClearRx cross-references each pair against a curated database of known pharmacokinetic and pharmacodynamic interactions. Results are categorized by severity and include a plain-language explanation of the mechanism behind each interaction.",
  },
  {
    question: "Is ClearRx free?",
    answer:
      "Yes, ClearRx is completely free to use. There are no premium tiers, hidden fees, or paywalls. The site is supported by non-intrusive advertising, and every feature is available to every visitor at no cost.",
  },
  {
    question: "Do you store my medication data?",
    answer:
      "No. All interaction checks run entirely within your browser. Your medication list is never transmitted to our servers or any third party. When you close the tab, your data is gone. We have no database of user searches.",
  },
  {
    question: "Who reviews the interaction information?",
    answer:
      "Every interaction explanation on ClearRx is written or reviewed by Jay, a licensed pharmacist and senior pharmaceutical researcher specializing in CYP450-mediated drug interactions. The information is cross-checked against peer-reviewed clinical references and prescribing labels.",
  },
  {
    question: "What do the severity levels mean?",
    answer:
      "ClearRx uses four severity levels. Serious means the combination can cause life-threatening effects or is contraindicated. Moderate means the interaction may require dose adjustment or close monitoring. Minor means the interaction is unlikely to be clinically significant for most patients. None means no known interaction exists between the two drugs.",
  },
  {
    question: "How accurate is ClearRx compared to clinical databases?",
    answer:
      "ClearRx references the same primary literature and FDA labeling data that clinical databases use. However, no tool catches every possible interaction, and individual patient factors such as genetics, organ function, and dosing can change risk significantly. ClearRx is a screening tool, not a replacement for a full clinical review.",
  },
  {
    question: "Can I use ClearRx for over-the-counter medications?",
    answer:
      "Yes. The database includes common over-the-counter medications, supplements, and herbal products such as ibuprofen, acetaminophen, St. John’s Wort, and many others. OTC drugs can cause clinically significant interactions just like prescription medications, so checking them is important.",
  },
  {
    question: "What should I do if ClearRx shows a serious interaction?",
    answer:
      "Do not stop or change any medication on your own. Contact your prescribing physician or pharmacist and share the specific interaction ClearRx identified. They can evaluate whether the combination is appropriate for your individual situation or suggest a safer alternative.",
  },
  {
    question: "Can ClearRx replace my pharmacist?",
    answer:
      "No. ClearRx is an educational screening tool, not a substitute for professional medical advice. A pharmacist considers your full medical history, lab values, dosing, and individual risk factors in a way that no automated checker can. Use ClearRx to prepare better questions for your healthcare provider.",
  },
  {
    question: "How do I read the Interaction Map?",
    answer:
      "The Interaction Map is a visual grid that shows every pairwise combination of the medications you entered. Each cell is color-coded by severity: red for serious, amber for moderate, green for minor, and gray for no known interaction. Click or tap any cell to see the full explanation of that specific interaction.",
  },
  {
    question: "What is a CYP450 enzyme and why does it matter?",
    answer:
      "CYP450 enzymes are a family of proteins in your liver responsible for metabolizing most medications. When two drugs compete for the same enzyme, or when one drug inhibits or induces an enzyme that another drug depends on, blood levels can rise or fall unpredictably. This is the mechanism behind the majority of pharmacokinetic drug interactions.",
  },
  {
    question: "How often is the drug database updated?",
    answer:
      "The database is reviewed and updated on a regular basis as new FDA safety communications, drug approvals, and peer-reviewed studies are published. Major interaction alerts from the FDA are incorporated as soon as they are verified. Each entry includes a reference date so you can see when it was last reviewed.",
  },
  {
    question: "Can I share my results with my doctor?",
    answer:
      "Yes. ClearRx is designed to facilitate conversations with your healthcare provider. You can print the results page or take a screenshot of the Interaction Map and severity details to bring to your next appointment. Having this information ready helps your doctor make more informed decisions about your care.",
  },
  {
    question: "Are NSAIDs like ibuprofen safe to take with other medications?",
    answer:
      "NSAIDs (nonsteroidal anti-inflammatory drugs) like ibuprofen and naproxen interact with many common medications, including blood thinners, blood pressure medications, and other pain relievers. They also carry risks of GI bleeding and kidney damage, especially with long-term use. Check our NSAIDs safety guide in the Learn section for a detailed breakdown of risks and safer alternatives.",
  },
  {
    question: "Can food affect how my medications work?",
    answer:
      "Yes, significantly. Some antibiotics lose effectiveness when taken with dairy or calcium supplements. Grapefruit juice can increase blood levels of certain medications to dangerous levels. Even the timing of meals relative to medication doses matters. Our Learn section includes detailed guides on antibiotic-food interactions and medication timing.",
  },
  {
    question: "Is ClearRx available in languages other than English?",
    answer:
      "Currently, ClearRx is available in English only. Drug names, interaction descriptions, and clinical explanations are all provided in English. We are exploring the possibility of adding additional languages in the future, but accuracy and pharmacist review must come first.",
  },
  {
    question: "What is polypharmacy and why is it dangerous?",
    answer:
      "Polypharmacy refers to taking multiple medications simultaneously, typically defined as five or more. It is especially common in older adults managing multiple chronic conditions. The danger is that each additional drug adds more potential interaction points. With five medications, there are 10 possible drug pairs to check; with ten medications, there are 45. Elderly patients also process drugs more slowly due to age-related kidney and liver changes, causing drugs to accumulate to higher levels. Our guide on polypharmacy in the elderly covers the most dangerous combinations and practical management strategies.",
  },
  {
    question: "How does my kidney function affect drug interactions?",
    answer:
      "Many medications are eliminated from the body through the kidneys. When kidney function declines — as it naturally does with age, or from diabetes or high blood pressure — drugs that rely on renal clearance can accumulate to toxic levels. This can turn an otherwise safe dose into an overdose. Medications like metformin, gabapentin, certain antibiotics, and direct oral anticoagulants all require dose adjustments in kidney disease. ClearRx flags interactions that become more dangerous with renal impairment.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://clearrx.vibed-lab.com" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://clearrx.vibed-lab.com/faq" },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="max-w-2xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="font-serif text-4xl">Frequently Asked Questions</h1>
          <p
            className="mt-4 font-sans text-base"
            style={{ color: "var(--ink-muted)" }}
          >
            Everything you need to know about ClearRx, how it works, and how to
            use it alongside your healthcare provider.
          </p>
        </header>

        <div className="space-y-0">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <summary
                className="flex items-center justify-between cursor-pointer py-5 font-serif text-lg select-none list-none [&::-webkit-details-marker]:hidden"
                style={{ color: "var(--ink)" }}
              >
                <span className="pr-4">{faq.question}</span>
                <span
                  className="shrink-0 text-xl transition-transform duration-200 group-open:rotate-45"
                  style={{ color: "var(--rx-accent)" }}
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div
                className="pb-5 pr-8 font-sans text-base leading-relaxed"
                style={{ color: "var(--ink-muted)" }}
              >
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div
          className="mt-12 p-5 border text-sm font-sans"
          style={{
            borderColor: "var(--border)",
            background: "var(--rx-accent-light)",
          }}
        >
          <p
            className="font-mono text-xs uppercase mb-2"
            style={{ color: "var(--rx-accent)" }}
          >
            Still have questions?
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            If your question is not answered here, visit the{" "}
            <a href="/contact" style={{ color: "var(--rx-accent)" }}>
              contact page
            </a>{" "}
            to send a message directly to the pharmacist behind ClearRx.
          </p>
        </div>
      </article>
    </>
  );
}
