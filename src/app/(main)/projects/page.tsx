import { Suspense } from "react";
import Loading from "./loading";
import MenuSection from "@/components/project/menuSection";
import ProjectTable from "./projectTable";

export default async function ProjectsPage() {

  
  return (
    <Suspense fallback={<Loading/>}>
      <div className="flex items-center justify-between">
        <h1 className="md:text-lg font-medium tracking-tight">Projects</h1> 
        <div className="w-full h-12 flex items-center justify-end">
          <MenuSection/>
        </div>
      </div>
      <div>
        <ProjectTable/>
      </div>
    </Suspense>
  );
}
