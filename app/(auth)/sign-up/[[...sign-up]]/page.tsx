export const runtime = 'edge';

import { SignUp } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-stone">
          Add Clerk keys to `frontend/.env.local` to enable sign-up.
        </CardContent>
      </Card>
    );
  }

  return <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />;
}
