export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Teacher Student Detail</h1>
      <p className="text-muted-foreground mt-2">Route: /teacher/student/{id}</p>
    </main>
  );
}
