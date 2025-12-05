import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar  from "@/components/app-sidebar";
import { Toaster } from "sonner";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
        <SidebarTrigger />
        {children}  
      <Toaster />
    </SidebarProvider>
  );
}