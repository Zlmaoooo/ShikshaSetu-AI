export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-muted/30 px-6 py-3 border-b text-xs text-muted-foreground">
        Teacher Layout Shell
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
