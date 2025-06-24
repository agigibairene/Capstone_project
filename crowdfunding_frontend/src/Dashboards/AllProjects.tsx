import { useState, useEffect } from 'react';
import ProjectCard from '../Utils/ProjectCard';

import { useStateContext } from '../context'

export default function AllProjects(){
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getUserCampaigns } = useStateContext();

  const fetchAllProjects = async () => {
    setIsLoading(true);
    const data = await getUserCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if(contract) fetchAllProjects();
  }, [address, contract]);

  return (
    <ProjectCard
      title=""
      isLoading={isLoading}
      campaigns={campaigns}
    />
  )
}

