import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Axios from '@/constants/api_management/MyHttpHelper';
import { COMPANY_NAME, SUPPORT_EMAIL } from '@/components/LegalLayout';

type Status = { kind: 'ok' | 'error'; text: string } | null;

/** Public page (no sign-in) where anyone can ask for their Aiko account and data to be deleted. */
export function DeleteAccount() {
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (contact.trim().length < 5) {
      setStatus({ kind: 'error', text: 'Enter the email address or phone number on your account.' });
      return;
    }
    if (!confirmed) {
      setStatus({ kind: 'error', text: 'Tick the box to confirm you want your account deleted.' });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      await Axios.post('/account/deletion-requests', {
        contact: contact.trim(),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      setContact('');
      setReason('');
      setConfirmed(false);
      setStatus({
        kind: 'ok',
        text: 'Request received. If an account matches these details, it will be deleted within 30 days.',
      });
    } catch {
      setStatus({
        kind: 'error',
        text: `Something went wrong. Please try again, or email ${SUPPORT_EMAIL}.`,
      });
    } finally {
      setSending(false);
    }
  }

  const card =
    'rounded-xl border border-aiko-dark-100 bg-white p-6 shadow-sm dark:border-aiko-dark-800 dark:bg-aiko-dark-900';
  const input =
    'w-full rounded-lg border border-aiko-dark-200 bg-transparent px-3 py-2.5 text-aiko-dark-900 outline-none focus:border-aiko-green-500 focus:ring-2 focus:ring-aiko-green-500/30 dark:border-aiko-dark-700 dark:text-white';

  return (
    <div className="min-h-screen bg-aiko-dark-50 dark:bg-aiko-dark-950">
      <header className="bg-gradient-to-br from-[#21B85A] via-[#0D8A41] to-[#054A22] text-white">
        <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-extrabold">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight">aiko</span>
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">Delete your Aiko account</h1>
          <p className="mt-2 text-white/85">
            Use this page to have your Aiko account and the data associated with it deleted.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-4 pb-12 text-aiko-dark-700 dark:text-aiko-dark-300">
        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-aiko-dark-900 dark:text-white">
            Fastest way: delete it in the app
          </h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Open the Aiko app and sign in.</li>
            <li>
              Open the menu, then tap <strong>Settings</strong>.
            </li>
            <li>
              Tap <strong>Delete account</strong> and confirm.
            </li>
          </ol>
          <p className="mt-3 text-sm text-aiko-dark-500">
            Your account is deleted immediately. Finish or cancel any order in progress first.
          </p>
        </section>

        <section className={card}>
          <h2 className="mb-1 text-lg font-semibold text-aiko-dark-900 dark:text-white">
            Can&apos;t use the app? Ask us here
          </h2>
          <p className="text-sm text-aiko-dark-500">
            Enter the email address or phone number on your account. We&apos;ll confirm it&apos;s yours and
            delete the account within 30 days.
          </p>
          <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="contact" className="mb-1.5 block text-sm font-semibold text-aiko-dark-900 dark:text-white">
                Email or phone number
              </label>
              <input
                id="contact"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="you@example.com or 0803 000 0000"
                autoComplete="email"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1.5 block text-sm font-semibold text-aiko-dark-900 dark:text-white">
                Reason (optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Anything you'd like to tell us"
                className={input}
              />
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4 accent-aiko-green-600"
              />
              I understand my account will be permanently deleted and can&apos;t be recovered.
            </label>
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
              {sending ? 'Sending…' : 'Request account deletion'}
            </button>
            {status ? (
              <div
                role="status"
                className={
                  status.kind === 'ok'
                    ? 'rounded-lg bg-aiko-green-50 px-4 py-3 text-sm text-aiko-green-800 dark:bg-aiko-green-900/30 dark:text-aiko-green-200'
                    : 'rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }>
                {status.text}
              </div>
            ) : null}
          </form>
          <p className="mt-4 text-sm text-aiko-dark-500">
            You can also email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20Aiko%20account`} className="text-aiko-green-600 underline">
              {SUPPORT_EMAIL}
            </a>{' '}
            from the email address on your account.
          </p>
        </section>

        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-aiko-dark-900 dark:text-white">What gets deleted</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name, email address, phone number and date of birth</li>
            <li>Your profile photo and, for riders, your licence, ID and vehicle photos</li>
            <li>Saved addresses, device notification tokens and your sign-in link</li>
            <li>For riders: your location history and vehicle details</li>
          </ul>
          <h2 className="mb-3 mt-6 text-lg font-semibold text-aiko-dark-900 dark:text-white">What we keep</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Records of completed deliveries and fares, with your personal details removed, for
              accounting, tax and fraud-prevention purposes, for as long as the law requires.
            </li>
            <li>Messages sent in an order chat stay with that order for the other party&apos;s record, without your name.</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-aiko-dark-100 py-6 text-center text-sm text-aiko-dark-500 dark:border-aiko-dark-800">
        © {new Date().getFullYear()} {COMPANY_NAME} ·{' '}
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>{' '}
        ·{' '}
        <Link to="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
