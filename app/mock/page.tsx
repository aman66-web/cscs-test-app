import { redirect } from "next/navigation";

// Legacy route — mocks are numbered now (/mock/1 … /mock/10) and live on the
// Home screen, matching the My Life in the UK Test app.
export default function MockIndexPage() {
  redirect("/dashboard");
}
