export const runtime = 'edge';

import { SignIn } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-stone">
          Add Clerk keys to `frontend/.env.local` to enable sign-in.
        </CardContent>
      </Card>
    );
  }

  return <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />;
}
