export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-5xl rounded-[40px] border border-[#E5D7C0] p-4 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,460px]">
          <div className="rounded-[32px] bg-[#201A17] p-8 text-white">
            <div className="text-xs uppercase tracking-[0.32em] text-[#F3D88C]">mydscvr Eats</div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Build a menu page your guests will actually want to browse.
            </h1>
            <p className="mt-4 max-w-md text-white/75">
              Sign in to manage restaurant details, AI menu imports, imagery generation, and billing from one dashboard.
            </p>
          </div>
          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </main>
  );
}
