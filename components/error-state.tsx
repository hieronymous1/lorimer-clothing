"use client";

import Link from "next/link";

type ErrorStateProps = {
  title: string;
  description: string;
  reset?: () => void;
};

export function ErrorState({ title, description, reset }: ErrorStateProps) {
  return (
    <main className="page-shell py-24">
      <section className="page-section space-y-6">
        <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">Route interruption</p>
        <h1 className="editorial-title max-w-4xl">{title}</h1>
        <p className="editorial-copy">{description}</p>
        <div className="flex flex-wrap gap-6 text-[0.82rem] uppercase tracking-[0.18em]">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className="border-b border-ink pb-1 text-left transition hover:opacity-70"
            >
              Try again
            </button>
          ) : null}
          <Link href="/" className="border-b border-ink/40 pb-1 text-fog transition hover:text-ink">
            Return home
          </Link>
          <Link href="/shop" className="border-b border-ink/40 pb-1 text-fog transition hover:text-ink">
            Open products
          </Link>
        </div>
      </section>
    </main>
  );
}
