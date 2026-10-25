import { Link } from 'react-router-dom';
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
    id: 'agreement',
    title: 'About these terms',
    body: (
      <p>
        These Terms of Service are an agreement between you and {COMPANY_NAME} (&quot;Aiko&quot;,
        &quot;we&quot;, &quot;us&quot;), which operates the Aiko mobile app and related services. By creating an account or using Aiko you
        agree to these terms and to our <Link to="/privacy">Privacy Policy</Link>. If you do not agree,
        please do not use the app.
      </p>
    ),
  },
  {
    id: 'service',
    title: 'What Aiko does',
    body: (
      <p>
        Aiko is a platform that connects customers who want items picked up and delivered in and
        around Minna, Niger State, with independent riders using bikes and tricycles (keke). Aiko
        provides the app that lets customers request deliveries and riders accept them; the delivery
        itself is carried out by the rider.
      </p>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and your account',
    body: (
      <ul>
        <li>You must be at least 18 years old to use Aiko.</li>
        <li>
          You must give accurate information, including your name, phone number and a selfie of
          yourself, and keep it up to date.
        </li>
        <li>
          You are responsible for activity on your account. Keep access to your phone and Google
          account secure, and tell us at {mail} if you think your account has been misused.
        </li>
        <li>One person may hold only one account.</li>
      </ul>
    ),
  },
  {
    id: 'customers',
    title: 'Using Aiko as a customer',
    body: (
      <ul>
        <li>
          Before you book, the app shows the fare for your delivery. The fare is agreed when you
          confirm the order.
        </li>
        <li>Fares are paid in cash to the rider when the delivery is completed, unless the app says otherwise.</li>
        <li>
          Describe your package honestly, make sure it is properly packed, and make sure someone is
          available at the pickup and drop-off points.
        </li>
        <li>You may cancel an order before a rider collects it. Repeated cancellations may limit your use of the app.</li>
      </ul>
    ),
  },
  {
    id: 'prohibited',
    title: 'Items you must not send',
    body: (
      <>
        <p>You must not use Aiko to send:</p>
        <ul>
          <li>anything illegal, stolen, or that requires a licence you do not hold;</li>
          <li>drugs, weapons, ammunition, explosives or other dangerous goods;</li>
          <li>cash, jewellery or other high-value items beyond what a rider can reasonably carry;</li>
          <li>live animals, or perishable items that cannot survive the journey;</li>
          <li>anything a rider could not safely carry on a bike or keke.</li>
        </ul>
        <p>Riders may refuse any package they reasonably believe breaks these rules.</p>
      </>
    ),
  },
  {
    id: 'riders',
    title: 'Riding with Aiko',
    body: (
      <ul>
        <li>
          To ride, you must pass our verification: a selfie check, a valid driver&apos;s licence, a
          national ID and details and photos of your vehicle. We may approve or decline any
          application.
        </li>
        <li>
          You must hold any licences, permits and insurance the law requires, keep your vehicle
          roadworthy, and obey traffic laws at all times.
        </li>
        <li>
          Riders use Aiko as independent service providers, choose when to go online, and decide
          which orders to accept.
        </li>
        <li>
          Aiko charges riders a commission on each completed delivery, shown in the app. On cash
          deliveries the commission is owed to Aiko; if the amount owed reaches the limit shown in
          the app, you will not receive new orders until it is paid.
        </li>
        <li>Treat customers and their packages with care and respect.</li>
      </ul>
    ),
  },
  {
    id: 'conduct',
    title: 'Acceptable use',
    body: (
      <>
        <p>Whether you are a customer or a rider, you must not:</p>
        <ul>
          <li>harass, threaten or abuse other users, including in in-app chat;</li>
          <li>use another person&apos;s identity, account or documents;</li>
          <li>interfere with the app, attempt to access it without permission, or misuse other users&apos; data;</li>
          <li>use Aiko for fraud or any unlawful purpose.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspension and closing your account',
    body: (
      <p>
        We may suspend or close an account that breaks these terms, puts others at risk, or is used
        fraudulently. You can close your account at any time in the app under{' '}
        <strong>Settings → Delete account</strong>, or by requesting deletion at{' '}
        <a href={DELETE_ACCOUNT_URL}>{DELETE_ACCOUNT_URL}</a>.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Responsibility and liability',
    body: (
      <>
        <p>
          We work to keep Aiko available and reliable, but we provide the app &quot;as is&quot; and
          cannot guarantee it will always be uninterrupted or error-free. Estimated arrival times are
          estimates only.
        </p>
        <p>
          To the extent the law allows, Aiko is not liable for indirect or consequential losses, and
          our total liability for any delivery is limited to the fare paid for it. Nothing in these
          terms limits rights you have under Nigerian consumer protection law that cannot be excluded.
        </p>
        <p>
          If something goes wrong with a delivery, contact us at {mail} and we will help resolve it
          with the rider.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms from time to time. When we make significant changes we will notify
        you in the app or by email and update the date at the top of this page. Continuing to use Aiko
        after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>,
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: <p>Questions about these terms? Email us at {mail}.</p>,
  },
];

export function TermsOfService() {
  return <LegalLayout title="Terms of Service" lastUpdated={LAST_UPDATED} sections={SECTIONS} />;
}
