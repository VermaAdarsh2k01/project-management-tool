"use client"
import { GetProjectLists } from "@/app/actions/Project";
import { useProjectStore , } from "@/store/ProjectStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useTransition } from "react";
import Loading from "./loading";
export default  function ProjectTable(){

    const { projects , setProjects , shouldRefetchProjects , triggerProjectsRefetch , clearProjectsRefetch} = useProjectStore();
    const [isPending, startTransition] = useTransition();
  
    useEffect(() => {
      if (!shouldRefetchProjects && projects.length > 0) return;

      startTransition(async () => {
        const projectData = await GetProjectLists();
        setProjects(projectData);
        clearProjectsRefetch()
      });
    }, [shouldRefetchProjects]); 
    

    return(
        <div className="w-full">
            {isPending ? <Loading/> : <DataTable columns={columns} data={projects} />}
        </div>
    )
}