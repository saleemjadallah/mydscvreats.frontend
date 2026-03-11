import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms and Conditions | mydscvr Eats",
  description:
    "Terms and Conditions for MyDscvr Eats platform by Jasmine Entertainment FZE.",
  alternates: {
    canonical: "https://mydscvr.ai/terms",
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
  return (
    <p className="leading-relaxed text-ink/70">{children}</p>
  );
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
  { id: "introduction", title: "Introduction and Acceptance of Terms" },
  { id: "definitions", title: "Definitions" },
  { id: "eligibility", title: "Eligibility and Account Registration" },
  { id: "service", title: "Description of Service" },
  { id: "billing", title: "Subscription Plans and Billing" },
  { id: "ai", title: "AI-Powered Features" },
  { id: "content", title: "User Content and Data Ownership" },
  { id: "ip", title: "Intellectual Property Rights" },
  { id: "acceptable-use", title: "Acceptable Use Policy" },
  { id: "availability", title: "Service Availability and Performance" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "confidentiality", title: "Confidentiality" },
  { id: "warranties", title: "Warranties and Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "termination", title: "Term and Termination" },
  { id: "data-portability", title: "Data Portability and Post-Termination" },
  { id: "modifications", title: "Modifications to Terms" },
  { id: "governing-law", title: "Governing Law and Dispute Resolution" },
  { id: "general", title: "General Provisions" },
  { id: "contact", title: "Contact Information" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function TermsPage() {
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
              Terms &amp; Conditions
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
                <SectionHeading id="introduction" number={1} title="Introduction and Acceptance of Terms" />
                <Clause n="1.1">
                  These Terms and Conditions (&quot;<strong>Terms</strong>&quot;) constitute a legally binding agreement between you, whether personally or on behalf of an entity (&quot;<strong>You</strong>,&quot; &quot;<strong>Your</strong>,&quot; or &quot;<strong>User</strong>&quot;), and <strong>Jasmine Entertainment FZE</strong>, a Free Zone Establishment registered in Sharjah Publishing City, United Arab Emirates (&quot;<strong>Company</strong>,&quot; &quot;<strong>We</strong>,&quot; &quot;<strong>Us</strong>,&quot; or &quot;<strong>Our</strong>&quot;), governing your access to and use of the MyDscvr Eats platform, available at <Link href="/" className="text-saffron underline underline-offset-2 hover:text-saffron/80">mydscvr.ai</Link> and through any associated applications, APIs, or services (collectively, the &quot;<strong>Platform</strong>&quot;).
                </Clause>
                <Clause n="1.2">
                  By creating an account, accessing, or using the Platform, You acknowledge that You have read, understood, and agree to be bound by these Terms, our <Link href="/privacy" className="text-saffron underline underline-offset-2 hover:text-saffron/80">Privacy Policy</Link>, and any additional terms, policies, or guidelines referenced herein. If You do not agree with any part of these Terms, You must not access or use the Platform.
                </Clause>
                <Clause n="1.3">
                  If You are entering into these Terms on behalf of a business, company, or other legal entity, You represent and warrant that You have the authority to bind such entity to these Terms. In such case, &quot;You&quot; and &quot;Your&quot; shall refer to such entity.
                </Clause>
                <Clause n="1.4">
                  These Terms are published in the English language. Where a translation into Arabic or any other language is provided, the English version shall prevail in the event of any conflict or discrepancy, except where applicable law mandates otherwise.
                </Clause>
              </section>

              {/* ---- 2. Definitions ---- */}
              <section className="space-y-4">
                <SectionHeading id="definitions" number={2} title="Definitions" />
                <P>In these Terms, the following terms shall have the meanings set out below:</P>
                <Clause n="2.1">&quot;<strong>Account</strong>&quot; means the registered user account created by You to access and use the Platform.</Clause>
                <Clause n="2.2">&quot;<strong>AI Features</strong>&quot; means the artificial intelligence-powered functionalities available on the Platform, including but not limited to AI-generated menu descriptions, dietary tag suggestions, and menu analysis and scoring.</Clause>
                <Clause n="2.3">&quot;<strong>AI-Generated Content</strong>&quot; means any text, suggestions, analysis, scores, tags, or other outputs generated by the AI Features of the Platform.</Clause>
                <Clause n="2.4">&quot;<strong>Confidential Information</strong>&quot; means any non-public information disclosed by either party to the other in connection with these Terms, including but not limited to business plans, pricing, customer data, technical information, and trade secrets.</Clause>
                <Clause n="2.5">&quot;<strong>Content</strong>&quot; means any text, images, photographs, data, information, or other materials uploaded, submitted, or made available by You through the Platform.</Clause>
                <Clause n="2.6">&quot;<strong>Effective Date</strong>&quot; means March 11, 2026, or the date on which You first access or use the Platform, whichever is later.</Clause>
                <Clause n="2.7">&quot;<strong>Menu Data</strong>&quot; means all information related to Your restaurant menus, including but not limited to menu items, descriptions, pricing, categories, modifiers, dietary information, and associated images.</Clause>
                <Clause n="2.8">&quot;<strong>Platform</strong>&quot; means the MyDscvr Eats software-as-a-service platform, including the website at mydscvr.ai, the backend services at api.mydscvr.ai, all associated APIs, features, and functionalities.</Clause>
                <Clause n="2.9">&quot;<strong>Public Menu Page</strong>&quot; means the publicly accessible webpage generated by the Platform displaying Your restaurant&apos;s menu information to end consumers.</Clause>
                <Clause n="2.10">&quot;<strong>Subscription</strong>&quot; or &quot;<strong>Subscription Plan</strong>&quot; means the paid or free service tier selected by You, which determines the features, entitlements, and usage limits available to Your Account.</Clause>
                <Clause n="2.11">&quot;<strong>Third-Party Services</strong>&quot; means services, applications, or platforms provided by third parties that integrate with or are used by the Platform.</Clause>
              </section>

              {/* ---- 3. Eligibility ---- */}
              <section className="space-y-4">
                <SectionHeading id="eligibility" number={3} title="Eligibility and Account Registration" />
                <Sub>3.1. Eligibility</Sub>
                <Clause n="3.1.1">To use the Platform, You must be at least eighteen (18) years of age and possess the legal capacity to enter into binding contracts under applicable law.</Clause>
                <Clause n="3.1.2">You must be an authorized representative of a food and beverage establishment, restaurant, cafe, or similar hospitality business, or an individual acting in a professional capacity in connection with such a business.</Clause>
                <Clause n="3.1.3">The Platform is available to Users operating within the United Arab Emirates. Availability in other jurisdictions, including but not limited to the Kingdom of Saudi Arabia and other Gulf Cooperation Council (GCC) member states, may be extended at Our sole discretion and subject to jurisdiction-specific addenda.</Clause>

                <Sub>3.2. Account Registration</Sub>
                <Clause n="3.2.1">To access the Platform, You must create an Account by providing accurate, complete, and current information as prompted during the registration process. Account authentication is managed through our third-party authentication provider, Clerk.</Clause>
                <Clause n="3.2.2">You are responsible for maintaining the confidentiality and security of Your Account credentials. You agree to immediately notify Us of any unauthorized access to or use of Your Account.</Clause>
                <Clause n="3.2.3">You are solely responsible for all activities that occur under Your Account, whether or not authorized by You. We shall not be liable for any loss or damage arising from Your failure to secure Your Account credentials.</Clause>
                <Clause n="3.2.4">You may not create more than one Account per restaurant establishment unless expressly authorized by Us. You may not assign, transfer, or share Your Account with any third party without Our prior written consent.</Clause>
                <Clause n="3.2.5">We reserve the right to suspend or terminate any Account that We reasonably believe has been created using false, incomplete, or misleading information, or that is being used in violation of these Terms.</Clause>
              </section>

              {/* ---- 4. Description of Service ---- */}
              <section className="space-y-4">
                <SectionHeading id="service" number={4} title="Description of Service" />
                <Sub>4.1. Platform Overview</Sub>
                <Clause n="4.1.1">MyDscvr Eats is a business-to-business (B2B) software-as-a-service platform designed to assist food and beverage establishments in managing their digital menus. The Platform provides the following core functionalities:</Clause>
                <LetterItem letter="a"><strong>Menu Management:</strong> Creation, editing, organization, and management of digital menus, including menu items, categories, modifiers, pricing, and associated images.</LetterItem>
                <LetterItem letter="b"><strong>AI-Powered Description Writing:</strong> Artificial intelligence-assisted generation and enhancement of menu item descriptions, available in single-item and bulk modes depending on Your Subscription Plan.</LetterItem>
                <LetterItem letter="c"><strong>AI-Powered Dietary Tagging:</strong> AI-assisted identification and suggestion of dietary tags (e.g., vegetarian, vegan, gluten-free, halal) for menu items, with a confirm-or-reject workflow.</LetterItem>
                <LetterItem letter="d"><strong>Menu Analysis and Scoring:</strong> AI-powered analysis of Your menu with scoring across multiple dimensions, including pricing strategy, description quality, structural organization, gap identification, and seasonal relevance.</LetterItem>
                <LetterItem letter="e"><strong>Public Menu Pages:</strong> Generation of publicly accessible digital menu pages that can be shared with or viewed by end consumers.</LetterItem>
                <LetterItem letter="f"><strong>Dashboard and Analytics:</strong> A centralized management dashboard with analytics and insights related to Your menu and its performance.</LetterItem>

                <Sub>4.2. Service Modifications</Sub>
                <Clause n="4.2.1">We reserve the right to modify, update, enhance, or discontinue any features or functionalities of the Platform at any time, with or without notice. Material changes that significantly reduce the functionality included in Your Subscription Plan will be communicated to You with at least thirty (30) days&apos; prior written notice.</Clause>
              </section>

              {/* ---- 5. Subscription Plans and Billing ---- */}
              <section className="space-y-4">
                <SectionHeading id="billing" number={5} title="Subscription Plans and Billing" />
                <Sub>5.1. Subscription Plans</Sub>
                <Clause n="5.1.1">The Platform is offered through multiple Subscription Plans, which may include a free tier and one or more paid tiers (e.g., Pro). Each Subscription Plan provides different levels of access to features, entitlements, and usage limits.</Clause>
                <Clause n="5.1.2">Details of the available Subscription Plans, including features, pricing, and entitlements, are published on the Platform and may be updated from time to time.</Clause>
                <Clause n="5.1.3">We reserve the right to modify the features, pricing, or entitlements of any Subscription Plan. Changes to paid Subscription Plans will take effect at the beginning of Your next billing cycle following at least thirty (30) days&apos; prior written notice.</Clause>

                <Sub>5.2. Billing and Payment</Sub>
                <Clause n="5.2.1">Paid Subscription Plans are billed on a recurring basis (monthly or annually, as selected by You) through our third-party payment processor, Stripe. By subscribing to a paid plan, You authorize Us (through Stripe) to charge the payment method associated with Your Account.</Clause>
                <Clause n="5.2.2">All fees are quoted and payable in the currency specified on the Platform. Fees are exclusive of applicable taxes, including but not limited to Value Added Tax (VAT) as required under UAE Federal Decree-Law No. 8 of 2017 on Value Added Tax and its Executive Regulations. Applicable VAT will be added to Your invoices in accordance with prevailing tax law.</Clause>
                <Clause n="5.2.3">You are responsible for providing and maintaining accurate and complete payment information. Failure to make timely payment may result in suspension or downgrade of Your Account.</Clause>

                <Sub>5.3. Free Trial</Sub>
                <Clause n="5.3.1">We may, at Our sole discretion, offer free trial periods for paid Subscription Plans. Unless You cancel before the end of the free trial period, Your Subscription will automatically convert to a paid Subscription and You will be charged in accordance with the applicable plan pricing.</Clause>

                <Sub>5.4. Refunds and Cancellation</Sub>
                <Clause n="5.4.1">You may cancel Your paid Subscription at any time through Your Account dashboard. Upon cancellation, Your Subscription will remain active until the end of the current billing period, after which Your Account will be downgraded to the free tier (if available) or deactivated.</Clause>
                <Clause n="5.4.2">Fees paid for any Subscription period are generally non-refundable, except as required by applicable consumer protection laws of the United Arab Emirates, including UAE Federal Law No. 15 of 2020 on Consumer Protection, or as otherwise determined by Us at Our sole discretion.</Clause>
                <Clause n="5.4.3">If We materially reduce the functionality of Your paid Subscription Plan in a manner that substantially impairs the value of the services You have paid for, You may be entitled to a pro-rated refund for the unused portion of Your current billing period, provided You notify Us within fourteen (14) days of such change.</Clause>
              </section>

              {/* ---- 6. AI-Powered Features ---- */}
              <section className="space-y-4">
                <SectionHeading id="ai" number={6} title="AI-Powered Features" />
                <Sub>6.1. Nature of AI Features</Sub>
                <Clause n="6.1.1">The AI Features of the Platform utilize third-party artificial intelligence models, including Anthropic&apos;s Claude API, to generate content, suggestions, and analyses based on Your Menu Data and other inputs.</Clause>
                <Clause n="6.1.2"><strong>AI-Generated Content is provided &quot;as is&quot; for informational and suggestive purposes only.</strong> You expressly acknowledge and agree that:</Clause>
                <LetterItem letter="a">AI-Generated Content constitutes automated suggestions and is not a substitute for Your own professional judgment, expertise, or decision-making.</LetterItem>
                <LetterItem letter="b">AI-generated menu descriptions are suggestions that should be reviewed, edited, and approved by You before publication. We do not guarantee the accuracy, completeness, appropriateness, or suitability of any AI-generated description.</LetterItem>
                <LetterItem letter="c">AI-suggested dietary tags are computational suggestions only and <strong>do not constitute medical, nutritional, or dietary advice</strong>. You bear sole responsibility for verifying the accuracy of all dietary claims, allergen information, and nutritional labeling associated with Your menu items. Incorrect dietary information may pose serious health risks to consumers with allergies or dietary restrictions.</LetterItem>
                <LetterItem letter="d">Menu analysis scores and recommendations are analytical suggestions based on algorithmic processing and do not guarantee any specific business outcomes, revenue improvements, or customer satisfaction results.</LetterItem>
                <LetterItem letter="e">AI-Generated Content may occasionally contain errors, inaccuracies, biases, or inappropriate outputs. You must exercise independent judgment before adopting or publishing any AI-Generated Content.</LetterItem>

                <Sub>6.2. Your Responsibilities Regarding AI Features</Sub>
                <Clause n="6.2.1">You are solely responsible for reviewing, verifying, editing, and approving all AI-Generated Content before it is published or otherwise made available to consumers or the public.</Clause>
                <Clause n="6.2.2">You assume full responsibility and liability for any AI-Generated Content that You adopt, publish, or distribute, including but not limited to any claims arising from inaccurate dietary information, misleading descriptions, or regulatory non-compliance.</Clause>
                <Clause n="6.2.3">You agree not to use AI Features for any purpose other than those directly related to the management and enhancement of Your restaurant menus through the Platform.</Clause>

                <Sub>6.3. AI Data Processing</Sub>
                <Clause n="6.3.1">To provide AI Features, Your Menu Data and related inputs will be transmitted to third-party AI service providers (currently Anthropic/Claude) for processing. The handling of such data is described in Our <Link href="/privacy" className="text-saffron underline underline-offset-2 hover:text-saffron/80">Privacy Policy</Link>.</Clause>
                <Clause n="6.3.2">We do not use Your Menu Data to train proprietary AI models. However, third-party AI providers may process data in accordance with their own terms and policies.</Clause>

                <Sub>6.4. AI Feature Usage Limits</Sub>
                <Clause n="6.4.1">AI Features are subject to usage limits as determined by Your Subscription Plan. Usage limits may include, without limitation, the number of AI-generated descriptions, dietary tag analyses, and menu analyses available per billing period.</Clause>
                <Clause n="6.4.2">We reserve the right to modify usage limits, implement rate limiting, or restrict access to AI Features to maintain platform performance and manage costs.</Clause>
              </section>

              {/* ---- 7. User Content ---- */}
              <section className="space-y-4">
                <SectionHeading id="content" number={7} title="User Content and Data Ownership" />
                <Sub>7.1. Your Content</Sub>
                <Clause n="7.1.1">You retain all ownership rights in and to Your Content, including Your Menu Data, images, and other materials that You upload, submit, or make available through the Platform. Nothing in these Terms shall transfer ownership of Your Content to Us.</Clause>
                <Clause n="7.1.2">By uploading or submitting Content to the Platform, You grant Us a non-exclusive, worldwide, royalty-free, sublicensable license to use, reproduce, modify, adapt, process, display, and distribute Your Content solely for the following purposes:</Clause>
                <LetterItem letter="a">Operating, maintaining, and providing the Platform and its features to You;</LetterItem>
                <LetterItem letter="b">Processing Your Content through AI Features to generate suggestions and analyses as requested by You;</LetterItem>
                <LetterItem letter="c">Displaying Your Content on Public Menu Pages as configured by You;</LetterItem>
                <LetterItem letter="d">Generating aggregated, anonymized, and de-identified analytics and insights (which shall not identify You or Your restaurant); and</LetterItem>
                <LetterItem letter="e">As otherwise necessary to perform Our obligations under these Terms.</LetterItem>
                <Clause n="7.1.3">The license granted in Section 7.1.2 shall terminate upon deletion of the relevant Content from the Platform or termination of Your Account, except to the extent that (a) the Content has been incorporated into aggregated or anonymized datasets, or (b) retention is required by applicable law.</Clause>

                <Sub>7.2. AI-Generated Content Ownership</Sub>
                <Clause n="7.2.1">Subject to applicable law regarding the copyrightability of AI-generated works, as between You and the Company, You shall have the right to use, modify, and publish AI-Generated Content that was specifically generated for Your Account, upon Your review and approval.</Clause>
                <Clause n="7.2.2">You acknowledge that AI-Generated Content may be similar or identical to content generated for other users, as it is produced by algorithmic processes. We make no representation of exclusivity with respect to AI-Generated Content.</Clause>
                <Clause n="7.2.3">We retain the right to use AI-Generated Content for purposes of improving, developing, and enhancing the Platform and its features, in aggregated and de-identified form.</Clause>

                <Sub>7.3. Content Representations</Sub>
                <Clause n="7.3.1">You represent and warrant that:</Clause>
                <LetterItem letter="a">You own or have obtained all necessary rights, licenses, and permissions to submit Your Content to the Platform;</LetterItem>
                <LetterItem letter="b">Your Content does not infringe, misappropriate, or violate the intellectual property rights, privacy rights, or other rights of any third party;</LetterItem>
                <LetterItem letter="c">Your Content is accurate and not misleading, particularly with respect to menu item descriptions, pricing, and dietary or allergen information;</LetterItem>
                <LetterItem letter="d">Your Content does not contain any material that is defamatory, obscene, offensive, or otherwise unlawful under the laws of the United Arab Emirates; and</LetterItem>
                <LetterItem letter="e">Your Content complies with all applicable food safety, labeling, and advertising regulations in Your jurisdiction of operation.</LetterItem>
              </section>

              {/* ---- 8. IP ---- */}
              <section className="space-y-4">
                <SectionHeading id="ip" number={8} title="Intellectual Property Rights" />
                <Sub>8.1. Company Intellectual Property</Sub>
                <Clause n="8.1.1">The Platform, including but not limited to its software, code, design, user interface, graphics, logos, trademarks, trade names, and documentation, is owned by or licensed to the Company and is protected by applicable intellectual property laws of the United Arab Emirates and international treaties.</Clause>
                <Clause n="8.1.2">&quot;MyDscvr Eats,&quot; &quot;MyDscvr,&quot; the MyDscvr Eats logo, and associated trademarks, service marks, and trade dress are the exclusive property of Jasmine Entertainment FZE. You may not use these marks without Our prior written consent.</Clause>
                <Clause n="8.1.3">Except for the limited rights expressly granted under these Terms, no rights, title, or interest in or to the Platform or any Company intellectual property are transferred or licensed to You.</Clause>

                <Sub>8.2. Feedback</Sub>
                <Clause n="8.2.1">If You provide Us with any suggestions, ideas, enhancement requests, feedback, or other communications regarding the Platform (&quot;<strong>Feedback</strong>&quot;), You hereby grant Us an unrestricted, irrevocable, perpetual, non-exclusive, fully paid, royalty-free right to use, exploit, modify, and incorporate such Feedback in any manner and for any purpose, without obligation or compensation to You.</Clause>
              </section>

              {/* ---- 9. Acceptable Use ---- */}
              <section className="space-y-4">
                <SectionHeading id="acceptable-use" number={9} title="Acceptable Use Policy" />
                <Sub>9.1. Permitted Use</Sub>
                <Clause n="9.1.1">You may use the Platform solely for lawful purposes directly related to the management and digital presence of Your food and beverage establishment, in accordance with these Terms and Your Subscription Plan.</Clause>

                <Sub>9.2. Prohibited Conduct</Sub>
                <Clause n="9.2.1">You agree not to, and shall not permit any third party to:</Clause>
                <LetterItem letter="a">Use the Platform for any purpose that is unlawful, fraudulent, or prohibited by these Terms or by the laws of the United Arab Emirates;</LetterItem>
                <LetterItem letter="b">Upload, submit, or transmit any Content that is false, misleading, defamatory, obscene, hateful, discriminatory, or otherwise objectionable;</LetterItem>
                <LetterItem letter="c">Impersonate any person or entity, or falsely represent Your affiliation with any person or entity;</LetterItem>
                <LetterItem letter="d">Interfere with, disrupt, or impose an unreasonable burden on the Platform, its servers, or connected networks;</LetterItem>
                <LetterItem letter="e">Attempt to gain unauthorized access to any part of the Platform, other user accounts, or any systems or networks connected to the Platform;</LetterItem>
                <LetterItem letter="f">Use any automated means (including bots, scrapers, crawlers, or similar tools) to access the Platform, except through APIs provided and authorized by Us;</LetterItem>
                <LetterItem letter="g">Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the Platform or any component thereof;</LetterItem>
                <LetterItem letter="h">Reproduce, duplicate, copy, sell, resell, lease, sublicense, or otherwise exploit the Platform or any portion thereof for any commercial purpose not expressly permitted by these Terms;</LetterItem>
                <LetterItem letter="i">Use the AI Features to generate content unrelated to restaurant menu management, or attempt to manipulate, exploit, or misuse AI Features in any manner;</LetterItem>
                <LetterItem letter="j">Use the Platform to compete directly with the Company by developing a competing product or service;</LetterItem>
                <LetterItem letter="k">Remove, alter, or obscure any proprietary notices, labels, or markings on or within the Platform;</LetterItem>
                <LetterItem letter="l">Upload Content that contains viruses, malware, or other harmful code; or</LetterItem>
                <LetterItem letter="m">Violate any applicable laws, regulations, or industry standards, including but not limited to food safety regulations, consumer protection laws, and data protection legislation.</LetterItem>
              </section>

              {/* ---- 10. Availability ---- */}
              <section className="space-y-4">
                <SectionHeading id="availability" number={10} title="Service Availability and Performance" />
                <Sub>10.1. Availability</Sub>
                <Clause n="10.1.1">We shall use commercially reasonable efforts to maintain the availability of the Platform. However, we do not guarantee uninterrupted, error-free, or continuous access to the Platform.</Clause>
                <Clause n="10.1.2">The Platform may be temporarily unavailable due to scheduled maintenance, upgrades, emergency repairs, force majeure events, or circumstances beyond Our reasonable control.</Clause>

                <Sub>10.2. No Service Level Guarantee</Sub>
                <Clause n="10.2.1">Unless a separate Service Level Agreement (&quot;SLA&quot;) has been executed between You and the Company, the Platform is provided without any specific uptime guarantees, response time commitments, or performance benchmarks.</Clause>

                <Sub>10.3. Support</Sub>
                <Clause n="10.3.1">We provide customer support via email at support@mydscvr.ai. Response times may vary based on Your Subscription Plan and the nature of Your inquiry.</Clause>
              </section>

              {/* ---- 11. Third-Party ---- */}
              <section className="space-y-4">
                <SectionHeading id="third-party" number={11} title="Third-Party Services" />
                <Clause n="11.1">The Platform integrates with and relies upon various Third-Party Services to provide its functionalities, including:</Clause>
                <LetterItem letter="a"><strong>Clerk</strong> for user authentication and account management;</LetterItem>
                <LetterItem letter="b"><strong>Stripe</strong> for payment processing and subscription billing;</LetterItem>
                <LetterItem letter="c"><strong>Anthropic (Claude)</strong> for AI-powered features;</LetterItem>
                <LetterItem letter="d"><strong>Cloudflare</strong> for content delivery, hosting, and media storage; and</LetterItem>
                <LetterItem letter="e"><strong>Railway</strong> for backend infrastructure and database hosting.</LetterItem>
                <Clause n="11.2">Your use of the Platform may be subject to the terms, conditions, and privacy policies of these Third-Party Services. We are not responsible for the acts, omissions, policies, or practices of any third-party service provider.</Clause>
                <Clause n="11.3">We do not guarantee the continued availability or compatibility of any Third-Party Service.</Clause>
              </section>

              {/* ---- 12. Confidentiality ---- */}
              <section className="space-y-4">
                <SectionHeading id="confidentiality" number={12} title="Confidentiality" />
                <Clause n="12.1">Each party agrees to maintain the confidentiality of the other party&apos;s Confidential Information and to not disclose such information to any third party without the prior written consent of the disclosing party, except as required by applicable law, regulation, or court order.</Clause>
                <Clause n="12.2">Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was known to the receiving party prior to disclosure; (c) is independently developed by the receiving party; or (d) is rightfully obtained from a third party without restriction.</Clause>
                <Clause n="12.3">Your Menu Data, pricing, and business information submitted to the Platform shall be treated as Your Confidential Information, subject to the licenses granted in Section 7.</Clause>
              </section>

              {/* ---- 13. Warranties ---- */}
              <section className="space-y-4">
                <SectionHeading id="warranties" number={13} title="Warranties and Disclaimers" />
                <Sub>13.1. Company Warranties</Sub>
                <Clause n="13.1.1">We warrant that: (a) We have the right and authority to enter into these Terms and to provide the Platform; (b) the Platform will perform materially in accordance with its published documentation; and (c) We will provide the Platform using reasonable skill and care.</Clause>

                <Sub>13.2. Disclaimers</Sub>
                <div className="rounded-2xl border border-coral/20 bg-coral/5 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-coral">Important Disclaimer</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    Except as expressly set forth in Section 13.1, the Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by applicable law, the Company expressly disclaims all warranties, whether express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    The Company does not warrant that: (a) the Platform will meet Your specific requirements; (b) the Platform will be uninterrupted, timely, secure, or error-free; (c) any AI-Generated Content will be accurate, complete, reliable, or free from errors or biases; (d) any results or business improvements will be achieved through use of the Platform; or (e) any defects in the Platform will be corrected.
                  </p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink/70">
                    No advice, information, or AI-Generated Content obtained through the Platform shall create any warranty not expressly stated in these Terms.
                  </p>
                </div>
              </section>

              {/* ---- 14. Limitation of Liability ---- */}
              <section className="space-y-4">
                <SectionHeading id="liability" number={14} title="Limitation of Liability" />
                <div className="rounded-2xl border border-coral/20 bg-coral/5 p-5 space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-coral">Limitation of Liability</p>
                  <p className="text-sm leading-relaxed text-ink/70">
                    To the maximum extent permitted by applicable law, in no event shall the Company, its directors, officers, employees, agents, affiliates, or licensors be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to: loss of profits, revenue, business, goodwill, or anticipated savings; loss of data or Content; business interruption; personal injury or property damage arising from AI-Generated Content; cost of procurement of substitute goods or services; or any other intangible losses.
                  </p>
                  <p className="text-sm leading-relaxed text-ink/70">
                    The Company&apos;s total aggregate liability arising out of or in connection with these Terms or Your use of the Platform shall not exceed the greater of: (a) the total fees paid by You to the Company during the twelve (12) months immediately preceding the event giving rise to the claim; or (b) five hundred United Arab Emirates Dirhams (AED 500).
                  </p>
                </div>
                <Clause n="14.3">You acknowledge that the limitations and exclusions of liability set forth in this section represent a fair and reasonable allocation of risk between the parties, and form an essential basis of the bargain between the parties.</Clause>
                <Clause n="14.4">Nothing in these Terms shall exclude or limit liability that cannot be excluded or limited under mandatory applicable law of the United Arab Emirates, including liability for fraud, willful misconduct, or death or personal injury caused by negligence.</Clause>
              </section>

              {/* ---- 15. Indemnification ---- */}
              <section className="space-y-4">
                <SectionHeading id="indemnification" number={15} title="Indemnification" />
                <Clause n="15.1">You agree to indemnify, defend, and hold harmless the Company, its directors, officers, employees, agents, affiliates, and licensors from and against any and all claims, demands, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to:</Clause>
                <LetterItem letter="a">Your use of or access to the Platform;</LetterItem>
                <LetterItem letter="b">Your Content, including any claims that Your Content infringes or misappropriates the rights of any third party;</LetterItem>
                <LetterItem letter="c">Your adoption, publication, or distribution of AI-Generated Content, including any claims arising from inaccurate dietary information, allergen labeling, or misleading descriptions;</LetterItem>
                <LetterItem letter="d">Your violation of these Terms;</LetterItem>
                <LetterItem letter="e">Your violation of any applicable law, regulation, or third-party rights; or</LetterItem>
                <LetterItem letter="f">Any dispute between You and any end consumer or third party in connection with Your use of the Platform or the Public Menu Pages.</LetterItem>
              </section>

              {/* ---- 16. Termination ---- */}
              <section className="space-y-4">
                <SectionHeading id="termination" number={16} title="Term and Termination" />
                <Sub>16.1. Term</Sub>
                <Clause n="16.1.1">These Terms shall commence on the Effective Date and shall continue in effect until terminated by either party in accordance with this Section.</Clause>

                <Sub>16.2. Termination by You</Sub>
                <Clause n="16.2.1">You may terminate these Terms at any time by canceling Your Subscription (if applicable) and deleting Your Account through the Platform, or by contacting Us at support@mydscvr.ai.</Clause>

                <Sub>16.3. Termination by Company</Sub>
                <Clause n="16.3.1">We may terminate or suspend Your access to the Platform, in whole or in part, at any time and without prior notice, if:</Clause>
                <LetterItem letter="a">You breach any material provision of these Terms;</LetterItem>
                <LetterItem letter="b">You fail to make any required payment when due and do not cure such failure within fourteen (14) days of written notice;</LetterItem>
                <LetterItem letter="c">Your use of the Platform poses a security risk or may adversely affect the Platform or other users;</LetterItem>
                <LetterItem letter="d">We are required to do so by applicable law, regulation, or court order;</LetterItem>
                <LetterItem letter="e">A Third-Party Service essential to the operation of Your Account is discontinued; or</LetterItem>
                <LetterItem letter="f">Your Account has been inactive for a period exceeding twelve (12) consecutive months.</LetterItem>

                <Sub>16.4. Effect of Termination</Sub>
                <Clause n="16.4.1">Upon termination: (a) Your right to access and use the Platform shall immediately cease; (b) all licenses granted to You under these Terms shall terminate; (c) You shall remain liable for all fees accrued prior to the effective date of termination; and (d) Sections 2, 6.1.2, 7, 8, 12, 13.2, 14, 15, 17, 19, and 20 shall survive termination.</Clause>
              </section>

              {/* ---- 17. Data Portability ---- */}
              <section className="space-y-4">
                <SectionHeading id="data-portability" number={17} title="Data Portability and Post-Termination" />
                <Clause n="17.1">Upon written request made within thirty (30) days following termination of Your Account, We will make Your Content (including Menu Data and uploaded images) available for download in a commonly used electronic format (such as CSV or JSON for data, and original format for images), subject to payment of any outstanding fees.</Clause>
                <Clause n="17.2">After the thirty (30) day period, We reserve the right to delete Your Content from Our systems, except to the extent that retention is required by applicable law or as part of anonymized and aggregated datasets.</Clause>
                <Clause n="17.3">AI-Generated Content that has not been downloaded or exported prior to termination may be permanently deleted and shall not be recoverable.</Clause>
              </section>

              {/* ---- 18. Modifications ---- */}
              <section className="space-y-4">
                <SectionHeading id="modifications" number={18} title="Modifications to Terms" />
                <Clause n="18.1">We reserve the right to modify, amend, or update these Terms at any time. Modified Terms will be posted on the Platform with a revised &quot;Last Updated&quot; date.</Clause>
                <Clause n="18.2">For material changes, We will provide at least thirty (30) days&apos; advance notice via email to the address associated with Your Account or through a prominent notice on the Platform.</Clause>
                <Clause n="18.3">Your continued use of the Platform after the effective date of any modified Terms constitutes Your acceptance of such modifications. If You do not agree with any modification, You must discontinue Your use of the Platform and terminate Your Account.</Clause>
              </section>

              {/* ---- 19. Governing Law ---- */}
              <section className="space-y-4">
                <SectionHeading id="governing-law" number={19} title="Governing Law and Dispute Resolution" />
                <Sub>19.1. Governing Law</Sub>
                <Clause n="19.1.1">These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, without regard to principles of conflicts of law.</Clause>

                <Sub>19.2. Dispute Resolution</Sub>
                <Clause n="19.2.1">In the event of any dispute arising out of or relating to these Terms, the parties shall first attempt to resolve the dispute through good-faith negotiation for a period of not less than thirty (30) days following written notice of the dispute.</Clause>
                <Clause n="19.2.2">If the dispute is not resolved through negotiation, either party may submit the dispute to the competent courts of the Emirate of Sharjah, United Arab Emirates, which shall have exclusive jurisdiction.</Clause>
                <Clause n="19.2.3">Notwithstanding the foregoing, either party may seek injunctive or other equitable relief from any court of competent jurisdiction to protect its intellectual property rights or Confidential Information.</Clause>

                <Sub>19.3. Language</Sub>
                <Clause n="19.3.1">These Terms are drafted in the English language. In the event any proceedings are conducted in Arabic or any translation is required, the English text shall be the authoritative version, except where mandatory law requires otherwise.</Clause>
              </section>

              {/* ---- 20. General ---- */}
              <section className="space-y-4">
                <SectionHeading id="general" number={20} title="General Provisions" />
                <Clause n="20.1"><strong>Entire Agreement.</strong> These Terms, together with the Privacy Policy and any other documents expressly incorporated by reference, constitute the entire agreement between You and the Company regarding the subject matter hereof.</Clause>
                <Clause n="20.2"><strong>Severability.</strong> If any provision of these Terms is held to be invalid, illegal, or unenforceable, such provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable, and the remaining provisions shall continue in full force and effect.</Clause>
                <Clause n="20.3"><strong>Waiver.</strong> No failure or delay by the Company in exercising any right, power, or remedy under these Terms shall constitute a waiver thereof.</Clause>
                <Clause n="20.4"><strong>Assignment.</strong> You may not assign or transfer these Terms without Our prior written consent. We may assign these Terms in whole or in part without Your consent.</Clause>
                <Clause n="20.5"><strong>Force Majeure.</strong> Neither party shall be liable for any failure or delay in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemics, war, terrorism, government actions, power failures, internet outages, or third-party service provider failures.</Clause>
                <Clause n="20.6"><strong>Notices.</strong> All notices shall be in writing and deemed given when sent by email to: (a) for notices to the Company, support@mydscvr.ai; and (b) for notices to You, the email address associated with Your Account.</Clause>
                <Clause n="20.7"><strong>No Third-Party Beneficiaries.</strong> These Terms do not create any third-party beneficiary rights. End consumers who view Public Menu Pages are not parties to these Terms.</Clause>
                <Clause n="20.8"><strong>Relationship of the Parties.</strong> The relationship between You and the Company is that of independent contracting parties. Nothing in these Terms shall be construed to create a partnership, joint venture, franchise, agency, or employment relationship.</Clause>
              </section>

              {/* ---- 21. Contact ---- */}
              <section className="space-y-4">
                <SectionHeading id="contact" number={21} title="Contact Information" />
                <P>For questions, concerns, or notices regarding these Terms, please contact Us at:</P>
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
              </section>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
