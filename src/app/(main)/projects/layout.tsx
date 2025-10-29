export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-4 md:gap-8 xl:px-8 bg-[#101012] ">
      {children}
    </main>
  );
}

