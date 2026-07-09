import { redirect } from "next/navigation";
import { SignInScreen } from "@/components/auth/sign-in-screen";
import { createClient } from "@/lib/supabase/server";
import { authedRedirectTarget } from "@/lib/auth/redirect-target";
import { friendlyAuthError } from "@/lib/auth/oauth-error";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string; reason?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(await authedRedirectTarget(supabase));
  }

  // /auth/callback lands here with ?error=auth&reason=<code> when an OAuth
  // or code exchange fails. The raw reason code stays in the URL/server logs
  // for debugging; the user only ever sees the mapped, readable message.
  const calloutMessage =
    searchParams?.error === "auth"
      ? friendlyAuthError(searchParams?.reason)
      : undefined;

  return <SignInScreen calloutMessage={calloutMessage} />;
}
