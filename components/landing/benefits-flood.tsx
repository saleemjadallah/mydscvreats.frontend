import {
  ScanText,
  ImagePlus,
  Zap,
  Link,
  RefreshCw,
  Search,
  Smartphone,
  MapPin,
  Code,
} from "lucide-react";

const benefits = [
  {
    icon: ScanText,
    title: "AI Menu Extraction",
    description: "No typing. No data entry. Upload any format and our AI handles the rest.",
    span: 2,
  },
  {
    icon: ImagePlus,
    title: "AI Dish Imagery",
    description: "Beautiful photos without a photoshoot. Generated for every dish automatically.",
    span: 1,
  },
  {
    icon: Zap,
    title: "Live in Minutes",
    description: "Live in minutes, not weeks. No developers, no designers, no waiting.",
    span: 1,
  },
  {
    icon: Link,
    title: "One Link Everywhere",
    description: "One link for WhatsApp, Instagram bio, Google, QR codes, and print.",
    span: 1,
  },
  {
    icon: RefreshCw,
    title: "Always Up to Date",
    description: "Update anytime, instantly. New dish? Price change? Done in seconds.",
    span: 1,
  },
  {
    icon: Search,
    title: "SEO Built In",
    description: "Structured data, meta tags, and fast loading so customers find you on Google.",
    span: 2,
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Designed for phones first. Because that's how your customers browse.",
    span: 1,
  },
  {
    icon: MapPin,
    title: "Dubai Native",
    description: "Built for Dubai. AED pricing, local cuisine tags, Arabic-ready.",
    span: 1,
  },
  {
    icon: Code,
    title: "Embeddable Widget",
    description: "Drop your menu into your own website with a single embed code.",
    span: 1,
  },
];

export function BenefitsFlood() {
  return (
    <section className="bg-oat py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone">
            Everything you get
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
            Built to make restaurants look&nbsp;great
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className={`rounded-[24px] border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-6 backdrop-blur transition-shadow hover:shadow-card ${
                benefit.span === 2 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron/10">
                <benefit.icon className="h-5 w-5 text-saffron" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-ink">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-stone">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
