import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | mydscvr Eats",
  description:
    "Privacy Policy for MyDscvr Eats platform by Jasmine Entertainment FZE. Learn how we collect, use, and protect your data.",
  alternates: {
    canonical: "https://mydscvr.ai/privacy",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function SectionHeading({
  id,
  number,
  title,
}: {
  id: string;
  number: number;
  title: string;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 border-b border-[#E7DAC5] pb-3 text-2xl font-semibold text-ink md:text-3xl"
    >
      <span className="text-saffron">{number}.</span> {title}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-ink md:text-xl">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed text-ink/70">{children}</p>;
}

function Clause({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 font-medium text-stone">{n}</span>
      <div className="leading-relaxed text-ink/70">{children}</div>
    </div>
  );
}

function LetterItem({
  letter,
  children,
}: {
  letter: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 pl-4">
      <span className="shrink-0 font-medium text-saffron/70">({letter})</span>
      <span className="leading-relaxed text-ink/70">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                 */
/* ------------------------------------------------------------------ */

const TOC = [
  { id: "introduction", title: "Introduction" },
  { id: "definitions", title: "Definitions" },
  { id: "data-controller", title: "Data Controller Information" },
  { id: "info-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "ai-data", title: "AI Data Processing" },
  { id: "legal-basis", title: "Legal Basis for Processing" },
  { id: "sharing", title: "Sharing and Disclosure" },
  { id: "third-party", title: "Third-Party Service Providers" },
  { id: "international", title: "International Data Transfers" },
  { id: "security", title: "Data Storage and Security" },
  { id: "retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Rights as a Data Subject" },
  { id: "cookies", title: "Cookies and Tracking" },
  { id: "public-menus", title: "Public Menu Pages" },
  { id: "children", title: "Children's Privacy" },
  { id: "dnt", title: "Do Not Track Signals" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "jurisdictions", title: "Jurisdiction-Specific Provisions" },
  { id: "contact", title: "Contact Us" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function PrivacyPage() {
  return (
    <>
      <main className="grain">
        {/* Header bar */}
        <header className="sticky top-4 z-50 mx-4 md:mx-8">
          <div className="mx-auto max-w-7xl">
            <div className="glass-panel flex items-center justify-between rounded-[36px] border border-[#E7DAC5] px-6 py-5">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="MyDscvr Eats"
                  width={140}
                  height={56}
                  className="h-14 w-auto"
                />
              </Link>
              <nav className="flex items-center gap-6 text-base font-medium text-ink/70">
                <Link
                  href="/explore"
                  className="hidden transition-colors hover:text-ink sm:block"
                >
                  Explore
                </Link>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="px-4 pb-12 pt-16 md:px-8 md:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-saffron/70">
              Legal
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base text-ink/60">
              Effective Date: March 11, 2026 &middot; Version 1.0
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="px-4 pb-24 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[240px_1fr]">
            {/* Sidebar TOC — desktop only */}
            <aside className="hidden lg:block">
              <nav className="sticky top-32 space-y-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
                  Contents
                </p>
                {TOC.map((item, i) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block truncate rounded-lg px-3 py-1.5 text-sm text-ink/60 transition-colors hover:bg-oat hover:text-ink"
                  >
                    {i + 1}. {item.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <article className="max-w-none space-y-12">
              {/* ---- 1. Introduction ---- */}
              <section className="space-y-4">
                <SectionHeading id="introduction" number={1} title="Introduction" />
                <Clause n="1.1">
                  This Privacy Policy (&quot;<strong>Policy</strong>&quot;) describes how <strong>Jasmine Entertainment FZE</strong> (&quot;<strong>Company</strong>,&quot; &quot;<strong>We</strong>,&quot; &quot;<strong>Us</strong>,&quot; or &quot;<strong>Our</strong>&quot;), a Free Zone Establishment registered in Sharjah Publishing City, United Arab Emirates, collects, uses, processes, stores, shares, and protects personal data and other information in connection with the MyDscvr Eats platform, accessible at <Link href="/" className="text-saffron underline underline-offset-2 hover:text-saffron/80">mydscvr.ai</Link> (the &quot;<strong>Platform</strong>&quot;).
                </Clause>
                <Clause n="1.2">
                  This Policy applies to all users of the Platform, including restaurant owners and managers who register for accounts (&quot;<strong>Registered Users</strong>&quot; or &quot;<strong>You</strong>&quot;), and end consumers who access publicly available menu pages (&quot;<strong>Visitors</strong>&quot;).
                </Clause>
                <Clause n="1.3">
                  By accessing or using the Platform, You acknowledge that You have read and understood this Privacy Policy. If You are a Registered User, Your use of the Platform is also governed by our <Link href="/terms" className="text-saffron underline underline-offset-2 hover:text-saffron/80">Terms and Conditions</Link>.
                </Clause>
                <Clause n="1.4">
                  This Privacy Policy has been prepared in accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (&quot;<strong>UAE PDPL</strong>&quot;) and its Executive Regulations (Cabinet Decision No. 44 of 2024), and takes into account applicable international data protection standards.
                </Clause>
                <Clause n="1.5">
                  This Policy is published in the English language. Where applicable law requires an Arabic translation, the Arabic version shall prevail. For all other purposes, the English version shall govern.
                </Clause>
              </section>

              {/* ---- 2. Definitions ---- */}
              <section className="space-y-4">
                <SectionHeading id="definitions" number={2} title="Definitions" />
                <Clause n="2.1">&quot;<strong>Personal Data</strong>&quot; means any data relating to an identified or identifiable natural person (&quot;<strong>Data Subject</strong>&quot;), as defined under Article 1 of the UAE PDPL.</Clause>
                <Clause n="2.2">&quot;<strong>Processing</strong>&quot; means any operation or set of operations performed on Personal Data, whether by automated or non-automated means, including collection, recording, organization, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure by transmission, dissemination, alignment, combination, restriction, erasure, or destruction.</Clause>
                <Clause n="2.3">&quot;<strong>AI Features</strong>&quot; means the artificial intelligence-powered functionalities of the Platform, including AI-generated menu descriptions, dietary tag suggestions, and menu analysis.</Clause>
                <Clause n="2.4">&quot;<strong>Menu Data</strong>&quot; means all information related to restaurant menus submitted by Registered Users, including menu items, descriptions, pricing, categories, modifiers, dietary information, and associated images.</Clause>
                <Clause n="2.5">&quot;<strong>Sensitive Data</strong>&quot; means special categories of Personal Data as defined under the UAE PDPL, including data relating to health, religious beliefs, ethnic origin, and other categories specified in Article 7 of the UAE PDPL.</Clause>
              </section>

              {/* ---- 3. Data Controller ---- */}
              <section className="space-y-4">
                <SectionHeading id="data-controller" number={3} title="Data Controller Information" />
                <Clause n="3.1">The data controller for Personal Data processed through the Platform is:</Clause>
                <div className="rounded-2xl border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-6 backdrop-blur">
                  <p className="font-semibold text-ink">Jasmine Entertainment FZE</p>
                  <p className="mt-1 text-ink/70">Publishing City, Sharjah</p>
                  <p className="text-ink/70">United Arab Emirates</p>
                  <p className="mt-3 text-ink/70">
                    Email:{" "}
                    <a href="mailto:support@mydscvr.ai" className="text-saffron underline underline-offset-2 hover:text-saffron/80">
                      support@mydscvr.ai
                    </a>
                  </p>
                </div>
                <Clause n="3.2">For any inquiries regarding the processing of your Personal Data, you may contact our data protection point of contact at: <a href="mailto:support@mydscvr.ai" className="text-saffron underline underline-offset-2 hover:text-saffron/80">support@mydscvr.ai</a>.</Clause>
              </section>

              {/* ---- 4. Information We Collect ---- */}
              <section className="space-y-4">
                <SectionHeading id="info-we-collect" number={4} title="Information We Collect" />
                <P>We collect and process the following categories of information:</P>

                <Sub>4.1. Account Registration Information</Sub>
                <P>When You create an Account on the Platform, we collect the following information through our authentication provider (Clerk):</P>
                <LetterItem letter="a">Full name;</LetterItem>
                <LetterItem letter="b">Email address;</LetterItem>
                <LetterItem letter="c">Password (encrypted; managed by Clerk);</LetterItem>
                <LetterItem letter="d">Profile photograph (if voluntarily provided); and</LetterItem>
                <LetterItem letter="e">Authentication tokens and session identifiers.</LetterItem>

                <Sub>4.2. Restaurant and Business Information</Sub>
                <P>When You set up Your restaurant profile on the Platform, we collect:</P>
                <LetterItem letter="a">Restaurant or business name;</LetterItem>
                <LetterItem letter="b">Restaurant type and cuisine category;</LetterItem>
                <LetterItem letter="c">Business address and location;</LetterItem>
                <LetterItem letter="d">Contact telephone number;</LetterItem>
                <LetterItem letter="e">Business description;</LetterItem>
                <LetterItem letter="f">Operating hours;</LetterItem>
                <LetterItem letter="g">Logo and brand images; and</LetterItem>
                <LetterItem letter="h">Any additional business information You voluntarily provide.</LetterItem>

                <Sub>4.3. Menu Data</Sub>
                <P>As part of the Platform&apos;s core functionality, we collect and process:</P>
                <LetterItem letter="a">Menu item names and descriptions;</LetterItem>
                <LetterItem letter="b">Menu item pricing and currency;</LetterItem>
                <LetterItem letter="c">Menu categories and subcategories;</LetterItem>
                <LetterItem letter="d">Menu item modifiers (add-ons, variations, sizes);</LetterItem>
                <LetterItem letter="e">Dietary tags and allergen information (including AI-suggested tags);</LetterItem>
                <LetterItem letter="f">Menu item images and photographs;</LetterItem>
                <LetterItem letter="g">Menu structure and organization data; and</LetterItem>
                <LetterItem letter="h">AI-generated content associated with menu items.</LetterItem>

                <Sub>4.4. Payment and Billing Information</Sub>
                <P>When You subscribe to a paid Subscription Plan, payment information is collected and processed by our third-party payment processor, Stripe:</P>
                <LetterItem letter="a">Payment card details (card number, expiration date, CVV) &mdash; processed and stored exclusively by Stripe; We do not store full payment card details;</LetterItem>
                <LetterItem letter="b">Billing name and address;</LetterItem>
                <LetterItem letter="c">Transaction history and subscription status; and</LetterItem>
                <LetterItem letter="d">Stripe customer and subscription identifiers.</LetterItem>

                <Sub>4.5. Usage and Technical Data</Sub>
                <P>We automatically collect certain technical and usage information when You access or use the Platform:</P>
                <LetterItem letter="a">IP address;</LetterItem>
                <LetterItem letter="b">Browser type and version;</LetterItem>
                <LetterItem letter="c">Device type, operating system, and device identifiers;</LetterItem>
                <LetterItem letter="d">Referring URLs and exit pages;</LetterItem>
                <LetterItem letter="e">Pages visited, features used, and actions taken on the Platform;</LetterItem>
                <LetterItem letter="f">Date, time, and duration of access;</LetterItem>
                <LetterItem letter="g">Click patterns and navigation paths; and</LetterItem>
                <LetterItem letter="h">Error logs and performance data.</LetterItem>

                <Sub>4.6. AI Interaction Data</Sub>
                <P>When You use the AI Features of the Platform, we collect:</P>
                <LetterItem letter="a">Menu Data and other inputs submitted for AI processing;</LetterItem>
                <LetterItem letter="b">AI-generated outputs (descriptions, tags, analysis results, scores);</LetterItem>
                <LetterItem letter="c">Your interactions with AI-generated content (accept, reject, edit);</LetterItem>
                <LetterItem letter="d">AI feature usage frequency and patterns; and</LetterItem>
                <LetterItem letter="e">AI usage log data (timestamps, feature type, usage counts).</LetterItem>

                <Sub>4.7. Communications Data</Sub>
                <P>When You contact Us or interact with our support channels, we collect:</P>
                <LetterItem letter="a">Email correspondence;</LetterItem>
                <LetterItem letter="b">Support ticket contents;</LetterItem>
                <LetterItem letter="c">Feedback and survey responses; and</LetterItem>
                <LetterItem letter="d">Any other information You voluntarily provide in communications with Us.</LetterItem>

                <Sub>4.8. Information We Do Not Intentionally Collect</Sub>
                <Clause n="4.8.1">We do not intentionally collect Sensitive Data as defined under the UAE PDPL. However, Menu Data may incidentally contain information that could be considered sensitive, such as dietary information related to religious practices (e.g., halal, kosher). Such information is processed solely for the purpose of providing the Platform&apos;s menu management and dietary tagging functionalities.</Clause>
                <Clause n="4.8.2">We do not collect biometric data, genetic data, or data concerning criminal convictions through the Platform.</Clause>
              </section>

              {/* ---- 5. How We Use Your Information ---- */}
              <section className="space-y-4">
                <SectionHeading id="how-we-use" number={5} title="How We Use Your Information" />
                <Sub>5.1.1. Service Delivery and Account Management</Sub>
                <LetterItem letter="a">Creating, managing, and maintaining Your Account;</LetterItem>
                <LetterItem letter="b">Authenticating Your identity and managing access to the Platform;</LetterItem>
                <LetterItem letter="c">Processing and managing Your Subscription and billing;</LetterItem>
                <LetterItem letter="d">Providing the Platform&apos;s core menu management functionalities; and</LetterItem>
                <LetterItem letter="e">Providing customer support and responding to Your inquiries.</LetterItem>

                <Sub>5.1.2. AI Feature Delivery</Sub>
                <LetterItem letter="a">Processing Your Menu Data through AI models to generate menu descriptions;</LetterItem>
                <LetterItem letter="b">Analyzing menu items to suggest dietary tags and allergen information;</LetterItem>
                <LetterItem letter="c">Conducting menu analysis and generating scoring and recommendations;</LetterItem>
                <LetterItem letter="d">Tracking and managing Your AI feature usage entitlements; and</LetterItem>
                <LetterItem letter="e">Improving the quality and relevance of AI-generated outputs.</LetterItem>

                <Sub>5.1.3. Platform Improvement and Analytics</Sub>
                <LetterItem letter="a">Analyzing usage patterns to improve the Platform&apos;s features, performance, and user experience;</LetterItem>
                <LetterItem letter="b">Generating aggregated, anonymized analytics and insights;</LetterItem>
                <LetterItem letter="c">Conducting research and development for new features;</LetterItem>
                <LetterItem letter="d">Monitoring and improving Platform security and stability; and</LetterItem>
                <LetterItem letter="e">Identifying and resolving technical issues and bugs.</LetterItem>

                <Sub>5.1.4. Communications</Sub>
                <LetterItem letter="a">Sending transactional emails (account verification, subscription confirmations, billing receipts);</LetterItem>
                <LetterItem letter="b">Sending service-related notifications (feature updates, maintenance notices, policy changes);</LetterItem>
                <LetterItem letter="c">Sending marketing communications, subject to Your consent where required by applicable law; and</LetterItem>
                <LetterItem letter="d">Responding to Your support requests and inquiries.</LetterItem>

                <Sub>5.1.5. Legal and Compliance</Sub>
                <LetterItem letter="a">Complying with applicable legal obligations, including tax and accounting requirements;</LetterItem>
                <LetterItem letter="b">Enforcing our Terms and Conditions and other policies;</LetterItem>
                <LetterItem letter="c">Detecting, preventing, and addressing fraud, security incidents, and technical issues;</LetterItem>
                <LetterItem letter="d">Exercising or defending legal claims; and</LetterItem>
                <LetterItem letter="e">Meeting regulatory requirements, including data protection compliance.</LetterItem>
              </section>

              {/* ---- 6. AI Data Processing ---- */}
              <section className="space-y-4">
                <SectionHeading id="ai-data" number={6} title="AI Data Processing" />
                <div className="rounded-2xl border border-saffron/20 bg-saffron/5 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-saffron">Transparency Notice</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    This section provides specific transparency regarding how Your data is processed by AI Features, in accordance with emerging AI governance principles and the UAE PDPL&apos;s requirements for fair and transparent processing.
                  </p>
                </div>

                <Sub>6.1.1. How AI Features Work</Sub>
                <LetterItem letter="a"><strong>Description Writer:</strong> When You use the AI description writing feature, Your menu item data (name, category, existing description, modifiers, and pricing) is sent to the Anthropic Claude API. The AI model processes this input and generates enhanced or new menu item descriptions. The original menu data is transmitted to Anthropic&apos;s servers for real-time processing and is not retained by Anthropic beyond the processing session.</LetterItem>
                <LetterItem letter="b"><strong>Dietary Tagger:</strong> When You use the dietary tagging feature, Your menu item data (name, description, ingredients if provided, and modifiers) is sent to the Anthropic Claude API. The AI model analyzes the data and suggests relevant dietary tags (e.g., vegetarian, vegan, gluten-free, dairy-free, halal). These are suggestions only and require Your review and confirmation.</LetterItem>
                <LetterItem letter="c"><strong>Menu Analyzer:</strong> When You use the menu analysis feature, Your complete menu data (items, descriptions, categories, pricing, structure) is sent to the Anthropic Claude API for comprehensive analysis. The AI generates scores and recommendations across multiple dimensions. Analysis results are cached on Our servers for performance optimization.</LetterItem>

                <Sub>6.1.2. Data Sent to AI Providers</Sub>
                <P>The following categories of data may be transmitted to Anthropic&apos;s Claude API when You use AI Features:</P>
                <LetterItem letter="a">Menu item names and descriptions;</LetterItem>
                <LetterItem letter="b">Menu item pricing;</LetterItem>
                <LetterItem letter="c">Menu categories and structure;</LetterItem>
                <LetterItem letter="d">Menu item modifiers and variations;</LetterItem>
                <LetterItem letter="e">Existing dietary tags; and</LetterItem>
                <LetterItem letter="f">Restaurant cuisine type and category (for contextual processing).</LetterItem>

                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                  <p className="text-sm font-semibold text-green-700">What We Do Not Send to AI Providers</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    Your personal name, email address, payment information, IP address, account credentials, or any data not directly related to menu content processing.
                  </p>
                </div>

                <Sub>6.1.3. AI Provider Data Handling</Sub>
                <Clause n="a">We use the Anthropic Claude API under commercial API terms. Under Anthropic&apos;s API terms, data submitted through the API is <strong>not used by Anthropic to train its AI models</strong>.</Clause>
                <Clause n="b">Data transmitted to Anthropic is processed in accordance with Anthropic&apos;s privacy policy and data processing terms. Anthropic may temporarily retain API inputs and outputs for abuse prevention, safety monitoring, and limited debugging purposes.</Clause>

                <Sub>6.1.4. AI Content Accuracy</Sub>
                <Clause n="a">AI-Generated Content is produced by statistical language models and may contain errors, inaccuracies, or biases.</Clause>
                <div className="rounded-2xl border border-coral/20 bg-coral/5 p-5">
                  <p className="text-sm font-semibold text-coral">Important</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    AI-suggested dietary tags are not verified medical or nutritional assessments. You must independently verify all dietary and allergen information before publishing it to consumers.
                  </p>
                </div>
              </section>

              {/* ---- 7. Legal Basis ---- */}
              <section className="space-y-4">
                <SectionHeading id="legal-basis" number={7} title="Legal Basis for Processing" />
                <Clause n="7.1">In accordance with Article 5 of the UAE PDPL, we process Personal Data based on one or more of the following legal bases:</Clause>

                <Sub>7.1.1. Consent</Sub>
                <P>Where You have given Your explicit, informed, and freely given consent to the processing of Your Personal Data for specific purposes, including: (a) creating an Account and using the Platform; (b) receiving marketing communications; and (c) processing Your data through AI Features. You have the right to withdraw Your consent at any time.</P>

                <Sub>7.1.2. Performance of a Contract</Sub>
                <P>Processing that is necessary for the performance of a contract to which You are a party, including: (a) providing the Platform&apos;s services; (b) managing Your Account and Subscription; (c) processing payments; and (d) delivering AI Features that You have requested.</P>

                <Sub>7.1.3. Legitimate Interests</Sub>
                <P>Processing that is necessary for Our legitimate interests, provided that such interests do not override Your fundamental rights and freedoms, including: (a) improving and optimizing the Platform; (b) ensuring the security and integrity of the Platform; (c) generating aggregated analytics; (d) preventing fraud and abuse; and (e) direct marketing to existing customers (subject to opt-out rights).</P>

                <Sub>7.1.4. Legal Obligations</Sub>
                <P>Processing that is necessary for compliance with a legal obligation, including: (a) tax reporting and accounting requirements; (b) responding to lawful requests from competent authorities; and (c) compliance with data protection and consumer protection laws.</P>
              </section>

              {/* ---- 8. Sharing ---- */}
              <section className="space-y-4">
                <SectionHeading id="sharing" number={8} title="Sharing and Disclosure of Information" />
                <Clause n="8.1">We do not sell, rent, or trade Your Personal Data to third parties for their own marketing purposes.</Clause>
                <Clause n="8.2">We may share or disclose Your information in the following circumstances:</Clause>

                <Sub>8.2.1. Service Providers and Processors</Sub>
                <P>We share information with third-party service providers who process data on Our behalf, subject to data processing agreements that require them to protect Your data and process it only in accordance with Our instructions.</P>

                <Sub>8.2.2. Public Menu Pages</Sub>
                <P>If You configure Your restaurant menu to be publicly accessible, the following information will be visible to Visitors on Your Public Menu Page:</P>
                <LetterItem letter="a">Restaurant name and branding;</LetterItem>
                <LetterItem letter="b">Menu item names, descriptions, and pricing;</LetterItem>
                <LetterItem letter="c">Menu categories and structure;</LetterItem>
                <LetterItem letter="d">Dietary tags and allergen information;</LetterItem>
                <LetterItem letter="e">Menu item images; and</LetterItem>
                <LetterItem letter="f">Any other menu information You choose to make publicly visible.</LetterItem>
                <P><strong>You control what information is displayed on Your Public Menu Page through Your dashboard settings.</strong></P>

                <Sub>8.2.3. Legal and Regulatory Requirements</Sub>
                <P>We may disclose Your information when we believe in good faith that disclosure is necessary to: (a) comply with applicable law, regulation, legal process, or governmental request; (b) enforce our Terms and Conditions; (c) protect the rights, property, or safety of the Company, our Users, or the public; (d) detect, prevent, or address fraud, security, or technical issues; or (e) respond to a lawful request by a UAE government authority or court order.</P>

                <Sub>8.2.4. Business Transfers</Sub>
                <P>In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, Your information may be transferred to the successor entity, subject to applicable data protection requirements. We will notify You of any such transfer.</P>

                <Sub>8.2.5. Aggregated and Anonymized Data</Sub>
                <P>We may share aggregated, anonymized, or de-identified data that cannot reasonably be used to identify You. Such data is not considered Personal Data under the UAE PDPL.</P>
              </section>

              {/* ---- 9. Third-Party Service Providers ---- */}
              <section className="space-y-4">
                <SectionHeading id="third-party" number={9} title="Third-Party Service Providers" />
                <P>We use the following third-party service providers to operate the Platform:</P>

                {/* Provider cards */}
                {[
                  {
                    name: "Clerk",
                    purpose: "Authentication",
                    desc: "User authentication, account management, and session management.",
                    data: "Name, email address, profile image, authentication tokens, session data, IP address.",
                    location: "United States (with global edge infrastructure).",
                  },
                  {
                    name: "Stripe",
                    purpose: "Payment Processing",
                    desc: "Processing subscription payments, managing billing, issuing receipts and invoices.",
                    data: "Payment card details, billing name and address, transaction amounts, subscription status, customer identifiers.",
                    location: "United States (with global infrastructure; PCI DSS Level 1 certified).",
                  },
                  {
                    name: "Anthropic",
                    purpose: "AI Processing",
                    desc: "Processing menu data through the Claude AI API to provide AI-powered description writing, dietary tag suggestions, and menu analysis features.",
                    data: "Menu item data (names, descriptions, pricing, categories, modifiers, dietary information).",
                    location: "United States.",
                  },
                  {
                    name: "Cloudflare",
                    purpose: "Hosting, CDN, and Storage",
                    desc: "Hosting the Platform frontend (Cloudflare Workers), content delivery, DDoS protection, and storing menu item images and media files (Cloudflare R2).",
                    data: "IP address, request data, uploaded images and media files, usage logs.",
                    location: "Global network of data centers.",
                  },
                  {
                    name: "Railway",
                    purpose: "Backend Infrastructure and Database",
                    desc: "Hosting the Platform backend (API server) and the PostgreSQL database.",
                    data: "All data stored in the Platform database, including account information, restaurant data, menu data, AI usage logs, and subscription information.",
                    location: "United States.",
                  },
                ].map((provider) => (
                  <div
                    key={provider.name}
                    className="rounded-2xl border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-5 backdrop-blur"
                  >
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-ink">{provider.name}</p>
                      <span className="rounded-full bg-oat px-2.5 py-0.5 text-xs font-medium text-stone">
                        {provider.purpose}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{provider.desc}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-ink/70">
                        <span className="font-medium text-ink/80">Data processed:</span> {provider.data}
                      </p>
                      <p className="text-ink/70">
                        <span className="font-medium text-ink/80">Data location:</span> {provider.location}
                      </p>
                    </div>
                  </div>
                ))}
              </section>

              {/* ---- 10. International Data Transfers ---- */}
              <section className="space-y-4">
                <SectionHeading id="international" number={10} title="International Data Transfers" />
                <Sub>10.1. Transfer of Data Outside the UAE</Sub>
                <Clause n="10.1.1">As described in Section 9, certain Third-Party Service Providers process data outside the United Arab Emirates, including in the United States. This means that Your Personal Data may be transferred to and processed in countries outside the UAE.</Clause>
                <Clause n="10.1.2">In accordance with Articles 22 and 23 of the UAE PDPL and the relevant provisions of its Executive Regulations, We implement the following safeguards for international data transfers:</Clause>
                <LetterItem letter="a"><strong>Adequacy:</strong> Where the UAE Data Office has issued an adequacy finding for the recipient country, we rely on such finding as the legal basis for transfer.</LetterItem>
                <LetterItem letter="b"><strong>Contractual Safeguards:</strong> Where no adequacy finding exists, We ensure that appropriate contractual safeguards are in place with each data processor, including standard contractual clauses and data processing agreements that require the recipient to protect Personal Data to a standard substantially equivalent to the protections afforded under the UAE PDPL.</LetterItem>
                <LetterItem letter="c"><strong>Consent:</strong> Where required and appropriate, we obtain Your explicit consent for the transfer of Your Personal Data to countries outside the UAE.</LetterItem>

                <Sub>10.2. GCC Data Transfers</Sub>
                <Clause n="10.2.1">As We expand our operations to other GCC member states, additional data protection requirements may apply. We will update this Policy to reflect jurisdiction-specific requirements as applicable.</Clause>
              </section>

              {/* ---- 11. Data Storage and Security ---- */}
              <section className="space-y-4">
                <SectionHeading id="security" number={11} title="Data Storage and Security" />
                <Sub>11.1. Data Storage</Sub>
                <Clause n="11.1.1">Your data is stored using the infrastructure and service providers described in Section 9. Our primary database is hosted on Railway&apos;s infrastructure. Images and media files are stored on Cloudflare R2.</Clause>

                <Sub>11.2. Security Measures</Sub>
                <P>We implement technical and organizational security measures designed to protect Your Personal Data, in accordance with Article 8 of the UAE PDPL. These measures include:</P>
                <LetterItem letter="a"><strong>Encryption in Transit:</strong> All data transmitted between Your browser and the Platform is encrypted using TLS / HTTPS protocols.</LetterItem>
                <LetterItem letter="b"><strong>Encryption at Rest:</strong> Sensitive data stored in our database is encrypted at rest using industry-standard encryption algorithms.</LetterItem>
                <LetterItem letter="c"><strong>Authentication Security:</strong> User authentication is managed through Clerk, which implements industry-standard security practices including password hashing, secure session management, and optional multi-factor authentication.</LetterItem>
                <LetterItem letter="d"><strong>Access Controls:</strong> Access to Personal Data within Our organization is restricted to authorized personnel on a need-to-know basis.</LetterItem>
                <LetterItem letter="e"><strong>Payment Security:</strong> Payment card data is processed and stored by Stripe, which maintains PCI DSS Level 1 certification.</LetterItem>
                <LetterItem letter="f"><strong>Infrastructure Security:</strong> Our hosting providers (Cloudflare and Railway) implement comprehensive security measures including DDoS protection, network firewalls, and regular security monitoring.</LetterItem>

                <Sub>11.3. Security Incident Response</Sub>
                <P>In the event of a Personal Data breach, We will:</P>
                <LetterItem letter="a">Promptly assess the nature, scope, and potential impact of the breach;</LetterItem>
                <LetterItem letter="b">Notify the UAE Data Office within seventy-two (72) hours from becoming aware of the breach, where the breach is likely to result in a risk to the rights and freedoms of Data Subjects;</LetterItem>
                <LetterItem letter="c">Notify affected Data Subjects without undue delay where the breach is likely to result in a high risk to their rights and freedoms; and</LetterItem>
                <LetterItem letter="d">Take immediate steps to contain, investigate, and remediate the breach.</LetterItem>
              </section>

              {/* ---- 12. Data Retention ---- */}
              <section className="space-y-4">
                <SectionHeading id="retention" number={12} title="Data Retention" />
                <Sub>12.1. Retention Periods</Sub>
                <P>We retain Your Personal Data only for as long as necessary to fulfill the purposes for which it was collected. The following general retention periods apply:</P>

                {/* Retention table */}
                <div className="overflow-x-auto rounded-2xl border border-[#E7DAC5]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E7DAC5] bg-oat/50">
                        <th className="px-5 py-3 text-left font-semibold text-ink">Data Category</th>
                        <th className="px-5 py-3 text-left font-semibold text-ink">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7DAC5]">
                      {[
                        ["Account registration data", "Duration of account + 12 months after deletion"],
                        ["Restaurant and business information", "Duration of account + 12 months after deletion"],
                        ["Menu Data", "Duration of account + 30 days after deletion (data export period)"],
                        ["Payment and billing records", "7 years from the date of the transaction (UAE tax law)"],
                        ["AI interaction data (usage logs)", "24 months from the date of the interaction"],
                        ["AI-generated content", "Duration of account + 30 days after deletion"],
                        ["Usage and technical data", "24 months from the date of collection"],
                        ["Communications and support data", "36 months from the date of the communication"],
                      ].map(([category, period]) => (
                        <tr key={category} className="bg-[rgba(255,253,249,0.82)]">
                          <td className="px-5 py-3 font-medium text-ink/80">{category}</td>
                          <td className="px-5 py-3 text-ink/70">{period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Sub>12.2. Retention After Account Deletion</Sub>
                <P>Upon deletion of Your Account, We will delete or anonymize Your Personal Data within the retention periods specified above, except where: (a) retention is required by applicable law; (b) the data has been incorporated into aggregated, anonymized datasets; or (c) retention is necessary for the establishment, exercise, or defense of legal claims.</P>

                <Sub>12.3. Anonymization</Sub>
                <P>Where feasible, We may anonymize Your data rather than delete it. Anonymized data is no longer considered Personal Data under the UAE PDPL and may be retained indefinitely for analytics, research, and Platform improvement purposes.</P>
              </section>

              {/* ---- 13. Your Rights ---- */}
              <section className="space-y-4">
                <SectionHeading id="your-rights" number={13} title="Your Rights as a Data Subject" />
                <Clause n="13.1">In accordance with Articles 13 through 20 of the UAE PDPL, You have the following rights regarding Your Personal Data:</Clause>

                {/* Rights as styled cards */}
                {[
                  {
                    title: "Right of Access",
                    desc: "You have the right to request access to the Personal Data We hold about You, including information about the purposes of processing, the categories of data processed, the recipients of Your data, and the retention period.",
                  },
                  {
                    title: "Right to Rectification",
                    desc: "You have the right to request the correction of inaccurate Personal Data and the completion of incomplete Personal Data.",
                  },
                  {
                    title: "Right to Erasure",
                    desc: "You have the right to request the deletion of Your Personal Data where: the data is no longer necessary for the purposes for which it was collected; You withdraw Your consent; You object to the processing; or the data has been unlawfully processed.",
                  },
                  {
                    title: "Right to Restriction of Processing",
                    desc: "You have the right to request the restriction of processing of Your Personal Data in certain circumstances, including where You contest the accuracy of the data or the processing is unlawful.",
                  },
                  {
                    title: "Right to Data Portability",
                    desc: "You have the right to receive Your Personal Data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller, where technically feasible.",
                  },
                  {
                    title: "Right to Object",
                    desc: "You have the right to object to the processing of Your Personal Data on grounds relating to Your particular situation, where the processing is based on Our legitimate interests.",
                  },
                  {
                    title: "Right to Withdraw Consent",
                    desc: "Where processing is based on Your consent, You have the right to withdraw consent at any time without affecting the lawfulness of processing carried out prior to withdrawal.",
                  },
                  {
                    title: "Right Not to Be Subject to Automated Decision-Making",
                    desc: "You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning You or similarly significantly affects You. Our AI Features generate suggestions presented for Your review and manual acceptance.",
                  },
                ].map((right) => (
                  <div
                    key={right.title}
                    className="rounded-xl border border-[#E7DAC5] bg-[rgba(255,253,249,0.5)] px-5 py-4"
                  >
                    <p className="font-semibold text-ink">{right.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{right.desc}</p>
                  </div>
                ))}

                <Sub>13.2. Exercising Your Rights</Sub>
                <Clause n="13.2.1">To exercise any of the rights described above, please contact Us at <a href="mailto:support@mydscvr.ai" className="text-saffron underline underline-offset-2 hover:text-saffron/80">support@mydscvr.ai</a> with the subject line &quot;Data Subject Rights Request.&quot;</Clause>
                <Clause n="13.2.2">We will respond to Your request within thirty (30) days of receipt, as required by the UAE PDPL. This period may be extended by an additional sixty (60) days in cases of complexity.</Clause>
                <Clause n="13.2.3">We may request verification of Your identity before processing Your request.</Clause>
                <Clause n="13.2.4">There is no fee for exercising Your data protection rights. However, if requests are manifestly unfounded or excessive, We may charge a reasonable administrative fee or refuse to act on the request.</Clause>

                <Sub>13.3. Right to Lodge a Complaint</Sub>
                <Clause n="13.3.1">If You believe that Your data protection rights have been violated, You have the right to lodge a complaint with the UAE Data Office or any other competent supervisory authority.</Clause>
              </section>

              {/* ---- 14. Cookies ---- */}
              <section className="space-y-4">
                <SectionHeading id="cookies" number={14} title="Cookies and Tracking Technologies" />
                <Sub>14.1. What Are Cookies</Sub>
                <P>Cookies are small text files placed on Your device when You visit a website. They are widely used to make websites work more efficiently and to provide information to the website operator.</P>

                <Sub>14.2. Cookies We Use</Sub>
                <P>The Platform uses the following types of cookies and similar tracking technologies:</P>

                <div className="space-y-3">
                  {[
                    {
                      type: "Strictly Necessary Cookies",
                      desc: "Authentication cookies (set by Clerk), security cookies (CSRF protection), and load balancing cookies. These are essential and do not require consent.",
                      basis: "Strictly necessary for the provision of the Platform.",
                    },
                    {
                      type: "Functional Cookies",
                      desc: "Preference cookies (language, display settings) and feature state cookies (dashboard layout choices).",
                      basis: "Legitimate interest in providing a functional Platform.",
                    },
                    {
                      type: "Analytics Cookies",
                      desc: "Performance cookies (page load times, errors) and usage analytics cookies (page views, navigation paths, session duration).",
                      basis: "Legitimate interest in improving the Platform, subject to opt-out.",
                    },
                    {
                      type: "Third-Party Cookies",
                      desc: "Clerk authentication cookies, Stripe fraud detection cookies, and Cloudflare performance/security cookies.",
                      basis: "As set by each third-party provider.",
                    },
                  ].map((cookie) => (
                    <div
                      key={cookie.type}
                      className="rounded-xl border border-[#E7DAC5] bg-[rgba(255,253,249,0.5)] px-5 py-4"
                    >
                      <p className="font-semibold text-ink">{cookie.type}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/70">{cookie.desc}</p>
                      <p className="mt-1 text-xs text-stone">Legal basis: {cookie.basis}</p>
                    </div>
                  ))}
                </div>

                <Sub>14.3. Managing Cookies</Sub>
                <P>You can control and manage cookies through Your browser settings. Most browsers allow You to view, delete, and block cookies. Disabling certain cookies, particularly authentication cookies, may impair the functionality of the Platform.</P>
              </section>

              {/* ---- 15. Public Menu Pages ---- */}
              <section className="space-y-4">
                <SectionHeading id="public-menus" number={15} title="Public Menu Pages and Consumer Data" />
                <Sub>15.1. Consumer (Visitor) Data</Sub>
                <P>When end consumers (&quot;Visitors&quot;) access Public Menu Pages, We may collect limited information, including: IP address, browser type, device type, pages viewed, duration of visit, and referring URL. We do not require Visitors to create accounts to view Public Menu Pages.</P>

                <Sub>15.2. Registered User Responsibility</Sub>
                <P>Registered Users are responsible for ensuring that the information they publish on their Public Menu Pages, including dietary tags, allergen information, and item descriptions, is accurate and complies with applicable consumer protection and food safety laws.</P>
              </section>

              {/* ---- 16. Children ---- */}
              <section className="space-y-4">
                <SectionHeading id="children" number={16} title="Children's Privacy" />
                <Clause n="16.1">The Platform is a business-to-business service designed for use by restaurant owners, managers, and other authorized business representatives. The Platform is not directed at or intended for use by individuals under the age of eighteen (18).</Clause>
                <Clause n="16.2">We do not knowingly collect Personal Data from children under the age of eighteen (18). If We become aware that We have inadvertently collected Personal Data from a person under eighteen (18), We will take steps to delete such data promptly.</Clause>
                <Clause n="16.3">If You believe that We have collected Personal Data from a child under eighteen (18), please contact Us immediately at <a href="mailto:support@mydscvr.ai" className="text-saffron underline underline-offset-2 hover:text-saffron/80">support@mydscvr.ai</a>.</Clause>
              </section>

              {/* ---- 17. DNT ---- */}
              <section className="space-y-4">
                <SectionHeading id="dnt" number={17} title="Do Not Track Signals" />
                <Clause n="17.1">&quot;Do Not Track&quot; (DNT) is a privacy preference that users can set in certain web browsers. The Platform does not currently respond to DNT signals, as there is no industry-standard technology for recognizing or honoring DNT signals.</Clause>
                <Clause n="17.2">Regardless of DNT settings, We process data as described in this Policy. You may manage tracking through cookie settings as described in Section 14.</Clause>
              </section>

              {/* ---- 18. Changes ---- */}
              <section className="space-y-4">
                <SectionHeading id="changes" number={18} title="Changes to This Privacy Policy" />
                <Clause n="18.1">We reserve the right to update or modify this Privacy Policy at any time. Changes will be effective upon posting the updated Policy on the Platform with a revised &quot;Last Updated&quot; date.</Clause>
                <Clause n="18.2">For material changes that significantly affect how We collect, use, or share Your Personal Data, We will provide at least thirty (30) days&apos; advance notice via email or a prominent notice on the Platform.</Clause>
                <Clause n="18.3">Your continued use of the Platform after the effective date of any updated Policy constitutes Your acceptance of the changes. If You do not agree with the updated Policy, You should discontinue use of the Platform and delete Your Account.</Clause>
              </section>

              {/* ---- 19. Jurisdictions ---- */}
              <section className="space-y-4">
                <SectionHeading id="jurisdictions" number={19} title="Jurisdiction-Specific Provisions" />
                <Sub>19.1. United Arab Emirates</Sub>
                <P>This Privacy Policy has been prepared in compliance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (&quot;UAE PDPL&quot;) and its Executive Regulations (Cabinet Decision No. 44 of 2024). We are committed to complying with all requirements of the UAE PDPL, including lawful, fair, and transparent processing; purpose limitation and data minimization; accuracy; storage limitation; integrity and confidentiality; and accountability.</P>

                <Sub>19.2. Kingdom of Saudi Arabia (Future)</Sub>
                <P>As We expand operations to the Kingdom of Saudi Arabia, We will comply with the Saudi Personal Data Protection Law (Royal Decree M/19, dated 9/2/1443 AH) and its Implementing Regulations. A Saudi Arabia-specific addendum to this Policy will be published prior to the commencement of operations in that market.</P>

                <Sub>19.3. Other GCC Jurisdictions (Future)</Sub>
                <P>As We expand to additional GCC markets, we will publish jurisdiction-specific addenda to address the data protection requirements of each market, including: Bahrain&apos;s Personal Data Protection Law (Law No. 30 of 2018); Qatar&apos;s Law No. 13 of 2016 on Personal Data Privacy; Kuwait&apos;s applicable data protection provisions; and Oman&apos;s Personal Data Protection Law (Royal Decree No. 6/2022).</P>
              </section>

              {/* ---- 20. Contact ---- */}
              <section className="space-y-4">
                <SectionHeading id="contact" number={20} title="Contact Us" />
                <P>If You have any questions, concerns, or complaints about this Privacy Policy or Our data processing practices, please contact Us at:</P>
                <div className="rounded-2xl border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-6 backdrop-blur">
                  <p className="font-semibold text-ink">Jasmine Entertainment FZE</p>
                  <p className="mt-1 text-ink/70">Publishing City, Sharjah</p>
                  <p className="text-ink/70">United Arab Emirates</p>
                  <p className="mt-3 text-ink/70">
                    Email:{" "}
                    <a
                      href="mailto:support@mydscvr.ai"
                      className="text-saffron underline underline-offset-2 hover:text-saffron/80"
                    >
                      support@mydscvr.ai
                    </a>
                  </p>
                  <p className="text-ink/70">
                    Website:{" "}
                    <Link
                      href="/"
                      className="text-saffron underline underline-offset-2 hover:text-saffron/80"
                    >
                      mydscvr.ai
                    </Link>
                  </p>
                </div>
                <Clause n="20.2">For data protection inquiries or to exercise Your rights under the UAE PDPL, please email Us at <a href="mailto:support@mydscvr.ai" className="text-saffron underline underline-offset-2 hover:text-saffron/80">support@mydscvr.ai</a> with the subject line &quot;Data Privacy Inquiry.&quot;</Clause>
                <Clause n="20.3">We aim to respond to all inquiries within thirty (30) days of receipt.</Clause>
              </section>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
