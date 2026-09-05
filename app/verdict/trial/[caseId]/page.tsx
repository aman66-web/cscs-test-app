import { notFound } from "next/navigation";
import { getCase, toPublicCase } from "@/lib/verdict/cases";
import { panelFor } from "@/lib/verdict/jurors";
import { TrialRoom } from "@/components/verdict/trial-room";

// Server component. The witness's hidden facts, crack conditions and authored
// crack response stop here — the browser receives toPublicCase() output only,
// and every adjudication happens back on the server in /api/verdict/witness.
export default function TrialPage({
  params,
}: {
  params: { caseId: string };
}) {
  const trialCase = getCase(params.caseId);
  if (!trialCase) notFound();

  return (
    <TrialRoom
      publicCase={toPublicCase(trialCase)}
      panel={panelFor(trialCase.jurorIds)}
    />
  );
}
