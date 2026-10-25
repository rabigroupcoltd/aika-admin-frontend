import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const COMPANY_NAME = 'Nuriq Solutions';
export const SUPPORT_EMAIL = 'rabigroupcoltd@gmail.com';
export const DELETE_ACCOUNT_URL = 'https://aika-admin.onrender.com/delete-account';

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Shared public layout for the Privacy Policy and Terms of Service pages. */
export function LegalLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-aiko-dark-50 dark:bg-aiko-dark-950">
      <header className="bg-gradient-to-br from-[#21B85A] via-[#0D8A41] to-[#054A22] text-white">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-extrabold">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight">aiko</span>
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-white/80">Last updated: {lastUpdated}</p>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-3xl px-4 pb-12">
        {intro ? (
          <div className="mb-6 rounded-xl border border-aiko-dark-100 bg-white p-5 leading-relaxed text-aiko-dark-700 shadow-sm dark:border-aiko-dark-800 dark:bg-aiko-dark-900 dark:text-aiko-dark-300">
            {intro}
          </div>
        ) : null}

        <nav className="rounded-xl border border-aiko-dark-100 bg-white p-5 shadow-sm dark:border-aiko-dark-800 dark:bg-aiko-dark-900">
          <p className="mb-3 text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">Contents</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-aiko-green-600 hover:underline">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {sections.map((section, i) => (
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

      <footer className="border-t border-aiko-dark-100 py-6 text-center text-sm text-aiko-dark-500 dark:border-aiko-dark-800">
        © {new Date().getFullYear()} {COMPANY_NAME}. Aiko is a product of {COMPANY_NAME}. ·{' '}
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>{' '}
        ·{' '}
        <Link to="/terms" className="hover:underline">
          Terms of Service
        </Link>{' '}
        ·{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </footer>
    </div>
  );
}
