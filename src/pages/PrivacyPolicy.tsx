import {
  COMPANY_NAME,
  DELETE_ACCOUNT_URL,
  LegalLayout,
  SUPPORT_EMAIL,
  type LegalSection,
} from '@/components/LegalLayout';

const LAST_UPDATED = '25 October 2026';
const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <p>
        Aiko is a delivery service in Minna, Niger State, Nigeria, operated by {COMPANY_NAME}
        (&quot;Aiko&quot;, &quot;we&quot;, &quot;us&quot;). It connects customers who need items picked up
        and delivered with independent bike and keke riders. {COMPANY_NAME} is the data controller for
        the personal data described here. This policy explains
        what personal data we collect through the Aiko mobile app and related services, why we
        collect it, and the choices you have. It applies to customers and riders alike. You can
        reach us at {mail}.
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
            <strong>Account details</strong> — your name, email address, phone number and date of
            birth. If you sign in with Google, we receive your name, email address and Google profile
            photo from Google.
          </li>
          <li>
            <strong>Selfie and liveness check</strong> — when you sign up, you take a selfie and nod
            your head in front of the camera. The nod is checked on your phone to confirm a real
            person is present; we do not create or store a face template. The selfie is saved as your
            profile photo, which riders and customers see during a delivery.
          </li>
          <li>
            <strong>Delivery details</strong> — pickup and drop-off addresses, sender and recipient
            phone numbers, package descriptions, and the history of orders you create or carry.
          </li>
          <li>
            <strong>Location</strong> — customers may share their location to set a pickup point.
            Riders share their location while they are online, including when the app is in the
            background, so nearby orders can reach them and customers can follow their delivery on
            a map. We stop collecting a rider&apos;s location when they go offline.
          </li>
          <li>
            <strong>Rider verification documents</strong> — for riders only: a driver&apos;s licence, a
            national ID, photos of the vehicle and its plate number, and vehicle details such as
            brand, model and colour. We use these to confirm identity before a rider can accept
            orders.
          </li>
          <li>
            <strong>Fares and earnings</strong> — order fares, and for riders, earnings and commission
            owed. Deliveries are paid in cash; we do not collect card or bank details.
          </li>
          <li>
            <strong>Messages</strong> — chat messages between a customer and rider about an order,
            and messages you send to our support team.
          </li>
          <li>
            <strong>Device information</strong> — a push-notification token, device type and
            operating system version, used to deliver notifications and fix problems.
          </li>
        </ul>
        <p>
          We do not access your microphone, contacts or photo library. The camera is used only when
          you take your selfie or photograph documents.
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
        <li>To verify riders before they can carry orders.</li>
        <li>To record fares, rider earnings and commission.</li>
        <li>To send notifications about your orders, account and verification status.</li>
        <li>To respond to support requests and resolve disputes.</li>
        <li>To detect and prevent fraud, abuse and violations of our Terms of Service.</li>
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
            sees the rider&apos;s name, photo, vehicle, plate number and live location, and the rider
            sees the pickup and drop-off details and the phone numbers needed to complete the
            delivery.
          </li>
          <li>
            <strong>Service providers</strong> — companies that host our servers, database and files,
            provide Google sign-in and push notifications (Google Firebase), address search (Google
            Places) and map tiles (OpenStreetMap data). They may only use your data to provide their
            service to us.
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
        delete your personal details, photos and documents, and anonymise the rest. We keep records
        of completed deliveries and fares, without your personal details, for accounting, tax,
        fraud-prevention and dispute purposes, only for as long as the law requires.
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
          Under the Nigeria Data Protection Act 2023, you can ask to access, correct or delete your
          personal data, object to or restrict how we use it, or withdraw your consent at any time.
          You can also:
        </p>
        <ul>
          <li>Edit your profile details in the app.</li>
          <li>
            Turn off location or notification access in your device settings (some features will stop
            working).
          </li>
          <li>
            Delete your account at any time in the app under <strong>Settings → Delete account</strong>,
            or request deletion at <a href={DELETE_ACCOUNT_URL}>{DELETE_ACCOUNT_URL}</a>.
          </li>
        </ul>
        <p>
          You may also lodge a complaint with the Nigeria Data Protection Commission if you believe we
          have handled your data unlawfully.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        Aiko is not intended for anyone under 18. We do not knowingly collect data from children, and
        will delete it if we learn that we have.
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
    body: <p>Questions about this policy or your data? Email us at {mail}.</p>,
  },
];

export function PrivacyPolicy() {
  return <LegalLayout title="Privacy Policy" lastUpdated={LAST_UPDATED} sections={SECTIONS} />;
}
