export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col justify-center gap-4">
      <div className="inline-block text-center justify-center">{children}</div>
    </section>
  );
}
