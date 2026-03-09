import { MessageCircle, Instagram, Search, QrCode, Printer } from "lucide-react";

const shareTargets = [
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Instagram, label: "Instagram" },
  { icon: Search, label: "Google" },
  { icon: QrCode, label: "QR Code" },
  { icon: Printer, label: "Print" },
];

export function OneLinkSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
          One link. Everywhere.
        </h2>
        <p className="mt-4 text-lg text-stone">
          Replace PDF menus, outdated websites, and Instagram galleries with a
          single, always-up-to-date link.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-lg">
        {/* URL bar mockup */}
        <div className="rounded-[20px] border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-2 shadow-card backdrop-blur">
          <div className="flex items-center gap-3 rounded-full bg-oat/80 px-5 py-3.5">
            <div className="h-3 w-3 rounded-full bg-saffron/40" />
            <span className="font-medium text-ink">
              mydscvr.ai/
              <span className="text-saffron">your-restaurant</span>
            </span>
          </div>
        </div>

        {/* Share targets */}
        <div className="mt-8 flex items-center justify-center gap-5">
          {shareTargets.map((target) => (
            <div key={target.label} className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E7DAC5] bg-white/80">
                <target.icon className="h-5 w-5 text-stone" />
              </div>
              <span className="text-xs text-stone">{target.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
