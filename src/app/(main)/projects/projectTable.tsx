"use client"
import { GetProjects } from "@/app/actions/Project";
import { useProjectStore , } from "@/store/ProjectStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useTransition } from "react";
import Loading from "./loading";
export default  function ProjectTable(){

    const { projects , setProjects } = useProjectStore();
    const [isPending, startTransition] = useTransition();
  
    useEffect(() => {
      startTransition(async () => {
        const projectData = await GetProjects();
        setProjects(projectData);
      });
    }, [setProjects]); 
    

    return(
        <div className="w-full">
            {isPending ? <Loading/> : <DataTable columns={columns} data={projects} />}
        </div>
    )
}