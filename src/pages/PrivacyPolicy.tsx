import { Link } from 'react-router-dom';

const LAST_UPDATED = '25 October 2026';
const CONTACT_EMAIL = 'privacy@aiko.ng';

type Section = { id: string; title: string; body: React.ReactNode };

const SECTIONS: Section[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <p>
        Aiko is a delivery marketplace that connects customers who need items picked up and
        delivered with independent riders and drivers. This policy explains what personal data
        we collect through the Aiko mobile app and related services, why we collect it, and the
        choices you have. It applies to customers, riders and drivers alike.
      </p>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>We only collect what we need to run deliveries safely:</p>
        <ul>
          <li>
            <strong>Account details</strong> — your name, email address, phone number and profile
            photo. If you sign in with Google, we receive your name, email and photo from Google.
          </li>
          <li>
            <strong>Delivery details</strong> — pickup and drop-off addresses, recipient names and
            phone numbers, package descriptions, and the history of orders you create or carry.
          </li>
          <li>
            <strong>Location</strong> — customers share their location to set a pickup point.
            Riders and drivers share their location while they are online, including when the app
            is in the background, so nearby orders can reach them and customers can follow their
            delivery. We stop collecting a rider's location when they go offline.
          </li>
          <li>
            <strong>Verification (KYC) documents</strong> — for riders and drivers only: a photo of
            your face, your driver's licence, a government-issued ID and vehicle details, captured
            with your camera. We use these to confirm your identity before you can accept orders.
          </li>
          <li>
            <strong>Payment and wallet information</strong> — fares, payment method, earnings,
            wallet balance and payout history. Card and bank-transfer payments are handled by our
            payment providers; we do not store your full card number.
          </li>
          <li>
            <strong>Support conversations</strong> — messages you send us through in-app support.
          </li>
          <li>
            <strong>Device information</strong> — a push-notification token, device type and
            operating system version, used to deliver notifications and fix problems.
          </li>
        </ul>
        <p>
          We do not access your microphone, contacts or photo library. The camera is only used when
          you choose to take a photo.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your information',
    body: (
      <ul>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To match orders with nearby riders, calculate fares and show live delivery progress.</li>
        <li>To verify riders and drivers before they can carry orders.</li>
        <li>To process payments, credit earnings and settle wallet balances.</li>
        <li>To send notifications about your orders, account and verification status.</li>
        <li>To respond to support requests and resolve disputes.</li>
        <li>To detect and prevent fraud, abuse and violations of our terms.</li>
        <li>To meet our legal, tax and accounting obligations.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: 'How we share information',
    body: (
      <>
        <p>We do not sell your personal data. We share it only where needed:</p>
        <ul>
          <li>
            <strong>Between customers and riders</strong> — when an order is accepted, the customer
            sees the rider's name, photo, vehicle and live location, and the rider sees the pickup
            and drop-off details and contact numbers needed to complete the delivery.
          </li>
          <li>
            <strong>Service providers</strong> — companies that host our servers and files, provide
            sign-in and push notifications (Google Firebase), maps and address search (Google), and
            process payments (such as Paystack or Flutterwave). They may only use your data to
            provide their service to us.
          </li>
          <li>
            <strong>Legal reasons</strong> — when required by law, court order or a lawful request
            from authorities, or to protect the safety of our users and the public.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <p>
        We keep your data for as long as your account is active. When you delete your account we
        delete or anonymise your personal data, except for records we must keep for legal, tax,
        fraud-prevention or dispute purposes — for example completed order and payment records —
        which we keep only for as long as the law requires.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <p>
        Data is encrypted in transit, and access to personal data and verification documents is
        restricted to authorised staff and logged. No system is perfectly secure, but we work to
        protect your information and will notify you and the relevant authorities of a breach where
        required by law.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights and choices',
    body: (
      <>
        <p>
          Under the Nigeria Data Protection Act 2023 and other applicable laws, you can ask to
          access, correct or delete your personal data, object to or restrict how we use it, or
          withdraw your consent at any time. You can also:
        </p>
        <ul>
          <li>Edit your profile details in the app.</li>
          <li>Turn off location or notification access in your device settings (some features will stop working).</li>
          <li>
            Request deletion of your account and data by emailing{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the email linked to your
            account.
          </li>
        </ul>
        <p>
          You may also lodge a complaint with the Nigeria Data Protection Commission if you believe
          we have handled your data unlawfully.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        Aiko is not intended for anyone under 18. We do not knowingly collect data from children,
        and will delete it if we learn that we have.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We may update this policy from time to time. When we make significant changes we will notify
        you in the app or by email, and update the date at the top of this page.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <p>
        Questions about this policy or your data? Email us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export function PrivacyPolicy() {
  return (
    <div className="min-h-full bg-aiko-dark-50 dark:bg-aiko-dark-950">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aiko-green-500 font-bold text-white">
            A
          </div>
          <span className="text-lg font-semibold text-aiko-dark-900 dark:text-white">Aiko</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-aiko-dark-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-aiko-dark-500">Last updated: {LAST_UPDATED}</p>

        <nav className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">Contents</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-aiko-green-600 hover:underline">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <h2 className="mb-3 text-xl font-semibold text-aiko-dark-900 dark:text-white">
                {i + 1}. {section.title}
              </h2>
              <div className="space-y-3 leading-relaxed text-aiko-dark-700 dark:text-aiko-dark-300 [&_a]:text-aiko-green-600 [&_a]:underline [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-aiko-dark-900 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-aiko-dark-500">
        © {new Date().getFullYear()} Aiko ·{' '}
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
