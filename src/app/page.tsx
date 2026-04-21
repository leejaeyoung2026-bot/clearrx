"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DrugSearch from "@/components/DrugSearch";
import InteractionMap from "@/components/InteractionMap";
import ResultsPanel from "@/components/ResultsPanel";
import InteractionModal from "@/components/InteractionModal";
import ShareModal from "@/components/ShareModal";
import { useInteractionChecker } from "@/hooks/useInteractionChecker";
import { generateDoctorReport } from "@/lib/generate-pdf";
import type { DrugInteraction } from "@/types/drug";

export default function Home() {
  const {
    selectedDrugs,
    interactions,
    cytoscapeElements,
    status,
    selectedInteraction,
    setSelectedInteraction,
    unresolvedIds,
    dismissUnresolved,
    addDrug,
    removeDrug,
    checkInteractions,
    loadFromUrl,
  } = useInteractionChecker();

  const [showMap, setShowMap] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [reportItems, setReportItems] = useState<DrugInteraction[]>([]);

  useEffect(() => {
    loadFromUrl();
  }, [loadFromUrl]);

  useEffect(() => {
    if (selectedDrugs.length >= 2 && status === "idle") {
      checkInteractions();
    }
  }, [selectedDrugs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleEdgeClick(pairKey: string) {
    const ix = interactions.find((i) => i.pairKey === pairKey);
    if (ix) setSelectedInteraction(ix);
  }

  function handleAddToReport(ix: DrugInteraction) {
    setReportItems((prev) => {
      if (prev.find((i) => i.pairKey === ix.pairKey)) return prev;
      return [...prev, ix];
    });
    setSelectedInteraction(null);
  }

  const canCheck = selectedDrugs.length >= 2;
  const hasResults = status === "done";

  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 pb-10 max-w-3xl mx-auto text-center">
        <h1
          className="font-serif leading-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
        >
          Know before
          <br />
          <em style={{ color: "var(--rx-accent)" }}>you swallow.</em>
        </h1>
        <p className="mt-4 text-base font-sans max-w-xl mx-auto" style={{ color: "var(--ink-muted)" }}>
          Enter your medications and instantly see how they interact — visualized as a network,
          explained in plain English. Written by a licensed pharmacist.
        </p>
      </section>

      {/* Tool */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        {unresolvedIds.length > 0 && (
          <div
            className="mb-4 p-3 border text-sm font-sans flex items-start gap-3"
            style={{
              borderColor: "var(--severity-moderate)",
              borderStyle: "dashed",
              color: "var(--ink-muted)",
            }}
          >
            <p className="flex-1 leading-relaxed">
              <strong style={{ color: "var(--severity-moderate)" }}>
                Heads up:
              </strong>{" "}
              {unresolvedIds.length} drug{unresolvedIds.length !== 1 ? "s" : ""} from the shared link could not be found in our database
              {unresolvedIds.length <= 3 ? ` (${unresolvedIds.join(", ")})` : ""}.
              The rest were loaded.
            </p>
            <button
              type="button"
              onClick={dismissUnresolved}
              className="text-xs font-mono underline"
              style={{ color: "var(--ink-muted)" }}
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full">
            <DrugSearch
              selectedDrugs={selectedDrugs}
              onAdd={addDrug}
              onRemove={removeDrug}
            />
          </div>
          <button
            onClick={checkInteractions}
            disabled={!canCheck || status === "checking"}
            className="px-6 py-3 text-sm font-mono text-white transition-colors disabled:opacity-40 whitespace-nowrap"
            style={{ background: canCheck ? "var(--rx-accent)" : "var(--border)" }}
          >
            {status === "checking"
              ? "Checking\u2026"
              : !canCheck
              ? `Add ${2 - selectedDrugs.length} more medication${2 - selectedDrugs.length !== 1 ? "s" : ""}`
              : "Check Interactions"}
          </button>
        </div>

        {/* Results */}
        {hasResults && (
          <div className="mt-8">
            {/* Desktop: side-by-side */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <ResultsPanel
                interactions={interactions}
                onSelectInteraction={setSelectedInteraction}
              />
              <InteractionMap
                elements={cytoscapeElements}
                onEdgeClick={handleEdgeClick}
                height={450}
              />
            </div>

            {/* Mobile/tablet: results first, map on demand */}
            <div className="lg:hidden space-y-4">
              <ResultsPanel
                interactions={interactions}
                onSelectInteraction={setSelectedInteraction}
              />
              {!showMap ? (
                <button
                  onClick={() => setShowMap(true)}
                  className="w-full py-3 text-sm font-mono border transition-colors"
                  style={{ borderColor: "var(--rx-accent)", color: "var(--rx-accent)" }}
                >
                  View Interaction Map
                </button>
              ) : (
                <InteractionMap
                  elements={cytoscapeElements}
                  onEdgeClick={handleEdgeClick}
                  height={350}
                />
              )}
            </div>

            {/* Share + PDF buttons */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowShare(true)}
                className="px-5 py-2 text-sm font-mono border"
                style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
              >
                Share Results
              </button>
              <button
                onClick={() => generateDoctorReport({ drugs: selectedDrugs, interactions })}
                className="px-5 py-2 text-sm font-mono border"
                style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
              >
                Download PDF Report
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      <InteractionModal
        interaction={selectedInteraction}
        onClose={() => setSelectedInteraction(null)}
        onAddToReport={handleAddToReport}
      />

      {showShare && (
        <ShareModal
          selectedDrugs={selectedDrugs}
          interactions={interactions}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Pharmacist Credibility Section */}
      <section
        className="px-4 py-12 border-t"
        style={{ borderColor: "var(--border)", background: "var(--rx-accent-light)" }}
      >
        <div className="max-w-2xl mx-auto">
          <blockquote
            className="font-serif italic text-lg leading-relaxed pl-5"
            style={{ borderLeft: "3px solid var(--rx-accent)", color: "var(--ink)" }}
          >
            &quot;Every year, <strong>125,000 Americans die</strong> from adverse drug reactions —
            many preventable with the right information at the right time.&quot;
          </blockquote>
          <div className="flex items-center gap-3 mt-4 ml-5">
            <div
              className="w-8 h-8 flex items-center justify-center text-sm font-mono text-white"
              style={{ background: "var(--rx-accent)" }}
            >
              J
            </div>
            <p className="text-sm font-sans" style={{ color: "var(--ink-muted)" }}>
              Jay — Licensed Pharmacist &amp; Senior Pharmaceutical Researcher
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "197+", label: "Drugs in database" },
            { value: "1,266+", label: "Interactions mapped" },
            { value: "RPh", label: "Pharmacist reviewed" },
            { value: "0", label: "Data collected" },
          ].map((badge) => (
            <div key={badge.label}>
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: "var(--rx-accent)" }}
              >
                {badge.value}
              </p>
              <p
                className="text-xs font-sans mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                {badge.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Educational static content (AdSense-critical: 700-900 words) */}
      <article className="px-4 py-16 max-w-2xl mx-auto space-y-10">
        <section>
          <h2 className="font-serif text-2xl mb-3">How to Use ClearRx</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Type the name of any medication — brand or generic — into the search field above.
            ClearRx uses intelligent fuzzy search to find drugs even if you misspell them.
            Add 2 or more medications and click &quot;Check Interactions&quot; to instantly see how they
            interact. You can add up to 10 medications at once. Results are displayed as a
            visual network map and a plain-English list, ranked by severity.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">What Drug Interactions Actually Are</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Drug interactions occur when two or more medications affect each other&apos;s behavior
            in the body. There are two main types: pharmacokinetic (PK) interactions affect
            how a drug is absorbed, distributed, metabolized, or excreted — often through
            liver enzymes called CYP450s. Pharmacodynamic (PD) interactions occur when two
            drugs have additive or opposing effects on the same target, even without affecting
            each other&apos;s blood levels. Understanding which type of interaction you&apos;re dealing
            with helps predict severity and manageability. Not all interactions are dangerous —
            many are minor and manageable with monitoring. ClearRx clearly distinguishes between
            contraindicated combinations, serious interactions, moderate ones, and minor concerns.{" "}
            <Link href="/learn/what-is-a-drug-interaction" style={{ color: "var(--rx-accent)" }}>
              Read the full guide →
            </Link>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">When to Be Concerned</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            <strong>Contraindicated</strong> combinations should generally never be used together.
            <strong> Serious</strong> interactions require close medical supervision and may
            require dose adjustments or alternative medications. <strong>Moderate</strong>{" "}
            interactions are manageable but warrant a conversation with your pharmacist.{" "}
            <strong>Minor</strong> interactions rarely cause problems but are worth noting.
            If you see a serious or contraindicated interaction in your results, do not stop
            taking prescribed medications without consulting your doctor — but do bring the
            results to your next appointment.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">From the Pharmacist — Why I Built This</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            As a licensed pharmacist, I review hundreds of medication profiles every week.
            The tools available to patients online are either buried under ads, written in
            FDA label language nobody understands, or require creating an account just to
            see a basic result. I built ClearRx because patients deserve a clean, honest
            tool that treats them as intelligent adults. No account required. No data collected.
            No ads between you and the answer you need. Just the interaction check, in plain
            English, when you need it.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">Popular Drug Interaction Articles</h2>
          <ul className="space-y-2 font-sans text-sm" style={{ color: "var(--ink-muted)" }}>
            {[
              { href: "/learn/warfarin-ibuprofen", text: "Warfarin + Ibuprofen: Why This Sends Thousands to the ER" },
              { href: "/learn/grapefruit-drug-interactions", text: "Grapefruit and Medications: The CYP3A4 Enzyme Story" },
              { href: "/learn/serotonin-syndrome", text: "Serotonin Syndrome: The Hidden Risk of Combining Antidepressants" },
              { href: "/learn/common-drug-pairs", text: "10 Most Commonly Checked Drug Pairs" },
              { href: "/learn/nsaid-safety-guide", text: "NSAIDs and Your Stomach: A Safety Guide" },
              { href: "/learn/antibiotic-food-interactions", text: "Antibiotics and Food: What Your Pharmacist Wants You to Know" },
              { href: "/learn/polypharmacy-elderly", text: "Polypharmacy in the Elderly: Managing Multiple Medications Safely" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={{ color: "var(--rx-accent)" }}>
                  {link.text} →
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-sans">
            <Link href="/learn" style={{ color: "var(--rx-accent)" }}>
              View all articles →
            </Link>
          </p>
        </section>

        {/* Medical Disclaimer */}
        <section
          className="p-5 border text-sm font-sans leading-relaxed"
          style={{ borderColor: "var(--severity-moderate)", borderStyle: "dashed" }}
        >
          <p className="font-mono text-xs uppercase tracking-wide mb-3" style={{ color: "var(--severity-moderate)" }}>
            Medical Disclaimer
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            The information provided by ClearRx is for educational and informational purposes
            only. It is not intended to substitute for professional medical advice, diagnosis,
            or treatment. Always consult a qualified healthcare provider, pharmacist, or physician
            before making any changes to your medications or medical regimen.
          </p>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            Drug interaction information is provided for general awareness. The absence of an
            interaction in this tool does not guarantee that no interaction exists.
          </p>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            ClearRx does not store, process, or transmit any medication information you enter.
            All interaction checks are performed locally in your browser.
          </p>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            Jay is a licensed pharmacist and senior pharmaceutical researcher. Content on this
            site reflects professional knowledge and is reviewed for accuracy, but does not
            constitute a pharmacist-patient relationship or formal clinical consultation.
          </p>
          <p className="mt-3 font-medium">
            If you believe you are experiencing a drug interaction emergency, call 911 or
            contact Poison Control at{" "}
            <a href="tel:18002221222" style={{ color: "var(--rx-accent)" }}>
              1-800-222-1222
            </a>{" "}
            (US).
          </p>
        </section>
      </article>
    </>
  );
}
