import { Suspense } from "react";
import Loading from "./loading";
import MenuSection from "@/components/project/menuSection";

export default async function ProjectsPage() {

  
  return (
    <Suspense fallback={<Loading/>}>
      
      <main className="flex flex-1 flex-col gap-2 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1> 
          <div className="w-full h-12 flex items-center justify-end">
          <MenuSection/>
        </div>
        </div>
        
      </main>
    </Suspense>
  );
}
