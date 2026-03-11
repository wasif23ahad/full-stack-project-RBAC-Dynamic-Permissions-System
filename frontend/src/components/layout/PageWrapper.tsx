export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-auto bg-neutral-50 flex flex-col min-h-0">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
