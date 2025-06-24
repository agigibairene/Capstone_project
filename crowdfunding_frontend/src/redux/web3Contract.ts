import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ethers } from 'ethers';

export interface Project{
    owner: string;
    projectTitle: string;
    briefDescription: string;
    target: string;
    deadline: number;
    image: string;
    collectedAmount: string;
}

export interface Donations{
    donor: string;
    donation: string;
}

export interface ProjectForm{
    projectTitle: string;
    briefDescription: string;
    target: string;
    deadline: string;
    image: string
}

interface ProjectInterface{
    projects: Project[];
    user: Project[];
    donations: {
        [projectId: number]: Donations[];
    },
    loading: {
        projects: boolean;
        user: boolean;
        creating: boolean;
        donating: boolean;
        donations: boolean;
    };
    error: string|null;
    contract: unknown;
    address: string|null;
}

const initialState: ProjectInterface = {
    projects: [],
    user: [],
    donations: {},
    loading: {
        projects: false,
        user: false,
        creating: false,
        donating: false,
        donations: false,
    },
    error: null,
    contract: null,
    address: null
};

export const createCampaign = createAsyncThunk(
  'project/create',
  async ({ form, contract, address }: { form: ProjectForm; contract: any; address: string }) => {
    const createProjectWrite = contract.prepare('createProject');
    const data = await createProjectWrite({
      args: [
        address,
        form.projectTitle,
        form.briefDescription,
        form.target,
        new Date(form.deadline).getTime(),
        form.image,
      ],
    });
    return data;
  }
);


const projectSlice = createSlice({
    name: 'Project_proposal',
    initialState,
    reducers: {

    }
});

export default projectSlice;