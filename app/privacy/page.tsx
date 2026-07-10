import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata = { title: "Privacy Policy — CSCS Test App" };

// Structure cloned from the My Life in the UK Test app's privacy page; the
// wording is adapted for this app as a STARTING DRAFT — review the company
// details and text with your own legal advice before launch.
export default function PrivacyPage() {
  const strong = "font-semibold text-ink";
  const list = "list-disc space-y-1 ps-5";
  return (
    <LegalPage title="Privacy Policy" updated="10 July 2026">
      <div className="space-y-2 text-sm leading-relaxed text-ink-soft">
        <p>
          <span className={strong}>CSCS Test App</span> — provided by{" "}
          <span className={strong}>Clarifo Developers Ltd</span>.
        </p>
        <p>
          Clarifo Developers Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) operates the CSCS Test App application and website
          at cscstestapp.com (the &ldquo;App&rdquo;). This Privacy Policy
          explains what personal information we collect, how we use it, who we
          share it with, and your rights. We are the &ldquo;data
          controller&rdquo; for the purposes of the UK General Data Protection
          Regulation (UK GDPR) and the Data Protection Act 2018.
        </p>
        <p>
          If you have any questions, contact us at{" "}
          <span className={strong}>support@cscstestapp.com</span>.
        </p>
      </div>

      <LegalSection heading="1. Who we are">
        <p>
          Clarifo Developers Ltd is a company registered in England and Wales
          (company number 17273261), with its registered office at 739 Scott
          Hall Road, Leeds, England, LS17 5PG. We provide a study tool to help
          people prepare for the CITB Health, Safety &amp; Environment
          (HS&amp;E) test.
        </p>
        <p>
          <span className={strong}>Important:</span> This App is an independent
          study aid. It is{" "}
          <span className={strong}>
            not affiliated with, endorsed by, or connected to CITB, the CSCS
            scheme, or the official HS&amp;E test.
          </span>
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <p>We collect the following personal information:</p>
        <p className={strong}>
          Information you give us when you create an account and set up the
          App:
        </p>
        <ul className={list}>
          <li>
            Your <span className={strong}>email address</span> (used to sign
            you in and send you sign-in codes)
          </li>
          <li>
            Your <span className={strong}>first name</span> (used to
            personalise your experience)
          </li>
          <li>
            Your <span className={strong}>test date</span> and{" "}
            <span className={strong}>study preferences</span>, if you choose to
            provide them (for example, how much time you want to study and
            whether you have taken the test before)
          </li>
        </ul>
        <p className={strong}>Information created as you use the App:</p>
        <ul className={list}>
          <li>
            Your <span className={strong}>study progress</span>, including quiz
            results, scores, mock test results, streaks, experience points
            (XP), and which lessons and modules you have completed
          </li>
        </ul>
        <p className={strong}>Information from sign-in providers:</p>
        <ul className={list}>
          <li>
            If you sign in using <span className={strong}>Google</span> or{" "}
            <span className={strong}>Apple</span>, we receive basic account
            information from them, such as your name and email address, in
            order to create and access your account. We do not receive your
            password. Apple may provide a private relay email address if you
            choose to hide your email.
          </li>
        </ul>
        <p className={strong}>We do not collect:</p>
        <ul className={list}>
          <li>
            We do <span className={strong}>not</span> use any analytics,
            advertising, or tracking tools.
          </li>
          <li>
            We do <span className={strong}>not</span> collect your precise
            location.
          </li>
          <li>
            We do <span className={strong}>not</span> collect payment
            information (the App is free).
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. How we use your information">
        <p>We use your personal information to:</p>
        <ul className={list}>
          <li>Create and manage your account and sign you in securely</li>
          <li>Personalise your study plan and track your progress</li>
          <li>Provide the AI study coach feature (see Section 4)</li>
          <li>
            Send you a daily study reminder notification, if you enable it
          </li>
          <li>Respond to your support requests</li>
          <li>Keep the App secure and prevent misuse</li>
        </ul>
        <p>
          <span className={strong}>Legal bases (UK GDPR):</span> We process
          your information to perform our contract with you (providing the
          App), on the basis of your consent (for example, notifications and
          the AI coach), and for our legitimate interests (keeping the App
          secure and improving it).
        </p>
      </LegalSection>

      <LegalSection heading="4. The AI study coach">
        <p>
          The App includes an optional AI study coach. When you use it,
          information about your study progress is sent to{" "}
          <span className={strong}>Anthropic</span> (the provider of the
          underlying AI model) so that it can generate personalised study
          guidance. Your message and relevant progress data are processed by
          Anthropic to produce a response. We do not send Anthropic your name
          or contact details for this purpose beyond what is needed to answer
          your question.
        </p>
        <p>
          To manage costs and prevent misuse, use of the AI coach is limited to
          a set number of messages per day.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who we share your information with">
        <p>
          We do not sell your personal information. We share it only with the
          service providers that help us run the App:
        </p>
        <ul className={list}>
          <li>
            <span className={strong}>Supabase</span> — secure database and
            account authentication (stores your account and progress data)
          </li>
          <li>
            <span className={strong}>Anthropic</span> — powers the AI study
            coach (see Section 4)
          </li>
          <li>
            <span className={strong}>Resend</span> — sends your sign-in code
            and account emails
          </li>
          <li>
            <span className={strong}>Vercel</span> — hosts the App
          </li>
          <li>
            <span className={strong}>Google and Apple</span> — only if you
            choose to sign in with them
          </li>
        </ul>
        <p>
          These providers process your data on our behalf under appropriate
          data-protection terms. Some of them may process data outside the UK;
          where this happens, we rely on appropriate safeguards (such as the
          International Data Transfer Agreement or equivalent) to protect your
          information.
        </p>
        <p>
          We may also disclose information if required by law, or to protect
          our rights, users, or the security of the App.
        </p>
      </LegalSection>

      <LegalSection heading="6. Storage on your device">
        <p>
          Some information, such as your reminder preference and certain
          progress data, is stored{" "}
          <span className={strong}>locally on your device</span> so the App
          works smoothly. You can clear this by signing out or deleting the
          App.
        </p>
      </LegalSection>

      <LegalSection heading="7. How long we keep your information">
        <p>
          We keep your personal information for as long as your account is
          active. If you delete your account, we delete your personal data from
          our systems, except where we are required to keep certain information
          to comply with legal obligations.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your rights">
        <p>Under UK data protection law, you have the right to:</p>
        <ul className={list}>
          <li>
            <span className={strong}>Access</span> the personal information we
            hold about you
          </li>
          <li>
            <span className={strong}>Correct</span> inaccurate information
          </li>
          <li>
            <span className={strong}>Delete</span> your account and personal
            data (available in the App under Profile, or by contacting us)
          </li>
          <li>
            <span className={strong}>Export</span> your data (available in the
            App, or by contacting us)
          </li>
          <li>
            <span className={strong}>Object to or restrict</span> certain
            processing
          </li>
          <li>
            <span className={strong}>Withdraw consent</span> where we rely on
            it
          </li>
        </ul>
        <p>
          To exercise any of these rights, use the options in the App or email{" "}
          <span className={strong}>support@cscstestapp.com</span>. You also
          have the right to complain to the UK Information
          Commissioner&rsquo;s Office (ICO) at ico.org.uk.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children">
        <p>
          The App is intended for people preparing for the CITB HS&amp;E test
          and is not directed at children under 13. We do not knowingly collect
          personal information from children under 13. If you believe a child
          has provided us with information, contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection heading="10. Security">
        <p>
          We take reasonable technical and organisational measures to protect
          your information, including secure authentication and encrypted
          connections. However, no method of transmission or storage is
          completely secure.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will update
          the &ldquo;Last updated&rdquo; date above and, where appropriate,
          notify you within the App.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact us">
        <p>
          <span className={strong}>Clarifo Developers Ltd</span>
          <br />
          Company number: 17273261
          <br />
          Registered office: 739 Scott Hall Road, Leeds, England, LS17 5PG
          <br />
          Email: <span className={strong}>support@cscstestapp.com</span>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
