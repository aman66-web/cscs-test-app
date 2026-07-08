import { redirect } from "next/navigation";
import { SignInScreen } from "@/components/auth/sign-in-screen";
import { createClient } from "@/lib/supabase/server";
import { authedRedirectTarget } from "@/lib/auth/redirect-target";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(await authedRedirectTarget(supabase));
  }

  // /auth/callback lands here with ?error=auth when a code exchange fails
  // (cancelled OAuth, expired confirmation or reset link).
  return <SignInScreen calloutError={searchParams?.error === "auth"} />;
}
