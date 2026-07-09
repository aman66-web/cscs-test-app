import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata = { title: "Terms of Service — CSCS Test App" };

// Structure cloned from the My Life in the UK Test app's terms page; the
// wording is adapted for this app as a STARTING DRAFT — review the company
// details and text with your own legal advice before launch.
export default function TermsPage() {
  const strong = "font-semibold text-ink";
  const list = "list-disc space-y-1 ps-5";
  return (
    <LegalPage title="Terms of Service" updated="9 July 2026">
      <div className="space-y-2 text-sm leading-relaxed text-ink-soft">
        <p>
          <span className={strong}>CSCS Test App</span> — provided by{" "}
          <span className={strong}>Clarifo Developers Ltd</span>.
        </p>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
          CSCS Test App application and website at cscstestapp.com (the
          &ldquo;App&rdquo;), provided by Clarifo Developers Ltd
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a company
          registered in England and Wales (company number 17273261),
          registered office 739 Scott Hall Road, Leeds, England, LS17 5PG. By
          creating an account or using the App, you agree to these Terms. If
          you do not agree, please do not use the App.
        </p>
        <p>
          Questions? Contact{" "}
          <span className={strong}>support@cscstestapp.com</span>.
        </p>
      </div>

      <LegalSection heading="1. What the App is">
        <p>
          The App is a study tool designed to help you prepare for the CITB
          Health, Safety &amp; Environment (HS&amp;E) test — the test most
          people need to pass to apply for a CSCS card. It provides practice
          questions, study material, mock tests, progress tracking, and an
          optional AI study coach.
        </p>
        <p>
          <span className={strong}>
            The App is an independent study aid. It is not affiliated with,
            endorsed by, or connected to CITB, the CSCS scheme, or the
            official HS&amp;E test.
          </span>{" "}
          We do not administer the official test, and using the App does not
          guarantee that you will pass it.
        </p>
      </LegalSection>

      <LegalSection heading="2. No guarantee of results">
        <p>
          We work hard to keep our content accurate and aligned with the
          official HS&amp;E revision material. However:
        </p>
        <ul className={list}>
          <li>
            We do not guarantee that the App&rsquo;s content is complete,
            error-free, or up to date with the latest official materials.
          </li>
          <li>
            The official test questions are confidential; our questions are
            original practice questions based on the official revision
            material, not the actual exam questions.
          </li>
          <li>
            Passing practice tests in the App does not guarantee you will pass
            the official test.
          </li>
        </ul>
        <p>
          You are responsible for your own preparation and for checking
          official CITB guidance about the HS&amp;E test.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <ul className={list}>
          <li>
            You must provide accurate information when creating your account.
          </li>
          <li>
            You are responsible for keeping your account secure and for
            activity that happens under your account.
          </li>
          <li>
            You must be old enough to use the App and to take the official
            test.
          </li>
          <li>You may sign in using email, Google, or Apple.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className={list}>
          <li>Use the App for any unlawful purpose</li>
          <li>
            Attempt to copy, scrape, resell, or redistribute our questions or
            content
          </li>
          <li>
            Attempt to bypass usage limits, security, or access controls
          </li>
          <li>
            Misuse the AI study coach, including sending abusive, excessive, or
            automated requests
          </li>
          <li>Interfere with or disrupt the App or its infrastructure</li>
        </ul>
        <p>We may suspend or terminate accounts that breach these Terms.</p>
      </LegalSection>

      <LegalSection heading="5. The AI study coach">
        <p>
          The App includes an optional AI study coach powered by a third-party
          AI model. Its responses are generated automatically and may sometimes
          be inaccurate or incomplete. Do not rely on it as a definitive
          source; always check official guidance. Use of the coach is subject
          to daily usage limits.
        </p>
      </LegalSection>

      <LegalSection heading="6. Intellectual property">
        <p>
          All content in the App — including our original practice questions,
          study material, design, branding, and software — is owned by or
          licensed to Clarifo Developers Ltd and is protected by law. You are
          granted a personal, non-transferable, non-exclusive licence to use
          the App for your own study. You may not reproduce or distribute our
          content without our permission.
        </p>
      </LegalSection>

      <LegalSection heading='7. The App is provided "as is"'>
        <p>
          The App is provided on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis. To the fullest extent permitted by law, we
          make no warranties about the App&rsquo;s accuracy, availability, or
          fitness for a particular purpose. We do not warrant that the App will
          be uninterrupted or error-free.
        </p>
      </LegalSection>

      <LegalSection heading="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Clarifo Developers Ltd will
          not be liable for any indirect, incidental, or consequential losses,
          or for any loss arising from your reliance on the App&rsquo;s
          content, including any failure to pass the official HS&amp;E test.
          Nothing in these Terms excludes liability that cannot be excluded
          under law.
        </p>
      </LegalSection>

      <LegalSection heading="9. Changes to the App and these Terms">
        <p>
          We may update, change, or discontinue parts of the App at any time.
          We may also update these Terms from time to time; we will update the
          &ldquo;Last updated&rdquo; date above and, where appropriate, notify
          you in the App. Continued use of the App means you accept the updated
          Terms.
        </p>
      </LegalSection>

      <LegalSection heading="10. Ending your use">
        <p>
          You may stop using the App and delete your account at any time (see
          Profile in the App). We may suspend or end your access if you breach
          these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="11. Governing law">
        <p>
          These Terms are governed by the laws of England and Wales, and any
          disputes will be subject to the exclusive jurisdiction of the courts
          of England and Wales.
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
