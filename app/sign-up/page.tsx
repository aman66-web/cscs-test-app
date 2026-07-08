import { redirect } from "next/navigation";
import { SignUpScreen } from "@/components/auth/sign-up-screen";
import { createClient } from "@/lib/supabase/server";
import { authedRedirectTarget } from "@/lib/auth/redirect-target";

export default async function SignUpPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(await authedRedirectTarget(supabase));
  }

  return <SignUpScreen />;
}
