import { notFound } from "next/navigation";
import { getCase, toPublicCase } from "@/lib/verdict/cases";
import { panelFor } from "@/lib/verdict/jurors";
import { CaseNotes } from "@/components/verdict/case-notes";

// Server component: reads the full case (hidden facts and all), then hands the
// client only what toPublicCase() allows through.
export default function CaseNotesPage({
  params,
}: {
  params: { caseId: string };
}) {
  const trialCase = getCase(params.caseId);
  if (!trialCase) notFound();

  return (
    <CaseNotes
      publicCase={toPublicCase(trialCase)}
      panel={panelFor(trialCase.jurorIds)}
    />
  );
}
