import { CoachChat } from "@/components/coach/coach-chat";
import { createClient } from "@/lib/supabase/server";

// AI coach chat page. Sign-in is optional; if signed in we greet by name.
export default async function CoachPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const greetingName = user?.email ? user.email.split("@")[0] : "there";
  return <CoachChat greetingName={greetingName} />;
}
