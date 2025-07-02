import ProjectCard from "../Utils/ProjectCard";
import { projects } from "../data/data";

export default function AllProjects(){
    return(
       <section id="projects">
            <h2 className="text-center text-2xl md:text-3xl text-limeTxt font-bold mb-10">~ Projects ~</h2>
            <div className="flex gap-6 flex-wrap">
                {
                  projects.map(project =>{
                    const {name,  brief, target} = project;
                    return <ProjectCard name={name} briefDescription={brief} target={target}/> 
                  })
                }
        </div>
       </section>
    )
}