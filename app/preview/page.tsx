import type { Metadata } from "next";
import { PublicMenuPreview } from "@/components/public/public-menu-preview";

export const metadata: Metadata = {
  title: "Preview Your Menu | mydscvr Eats",
  description:
    "Upload a menu file or paste menu text to preview how your hosted restaurant page could look before you sign up.",
};

export default function PreviewPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8 max-w-3xl space-y-3">
        <div className="text-xs uppercase tracking-[0.3em] text-stone">Preview First</div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          See your menu before you commit
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink/70">
          Drop in a menu PDF, a phone photo, or raw text and get an instant draft preview of your future hosted page. No sign-up required.
        </p>
      </div>

      <PublicMenuPreview />
    </main>
  );
}
