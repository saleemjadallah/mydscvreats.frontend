import { OwnerOnboarding } from "@/components/dashboard/owner-onboarding";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="text-xs uppercase tracking-[0.3em] text-stone">Getting Started</div>
      <OwnerOnboarding />
    </div>
  );
}
