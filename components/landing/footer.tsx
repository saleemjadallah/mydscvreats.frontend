import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="MyDscvr Eats" width={36} height={36} className="h-9 w-9 brightness-0 invert" />
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-white/60">
                mydscvr Eats
              </div>
            <p className="mt-1 text-sm text-white/70">
              Living menu pages for Dubai restaurants.
            </p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm text-white/70">
            <Link href="/explore" className="hover:text-white/80">
              Explore
            </Link>
            <a href="#pricing" className="hover:text-white/80">
              Pricing
            </a>
            <Link href="/dashboard" className="hover:text-white/80">
              Sign in
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          Made in Dubai &middot; {new Date().getFullYear()} mydscvr
        </div>
      </div>
    </footer>
  );
}
