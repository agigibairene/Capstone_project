import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ethers } from 'ethers';

export interface Project {
    owner: string;
    projectTitle: string;
    briefDescription: string;
    target: string | bigint;
    deadline: number;
    image: string;
    collectedAmount: string;
    id: number;
}

export interface Donations {
    donor: string;
    donation: string;
}

export interface ProjectForm {
    projectTitle: string;
    briefDescription: string;
    target: string;
    deadline: string;
    image: string;
}

interface LoadingState {
    projects: boolean;
    user: boolean;
    creating: boolean;
    donating: boolean;
    donations: boolean;
}

interface ProjectState {
    projects: Project[];
    user: Project[];
    donations: {
        [projectId: number]: Donations[];
    };
    loading: LoadingState;
    error: string | null;
    contract: any;
    address: string | null;
}

const initialState: ProjectState = {
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

// Async Thunks
export const createProject = createAsyncThunk(
    'project/create',
    async ({ form, contract, address }: { form: ProjectForm; contract: any; address: string }) => {
        try {
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
        } catch (error) {
            throw new Error(`Failed to create project: ${error}`);
        }
    }
);

export const fetchAllProjects = createAsyncThunk(
    'project/fetchAll',
    async (contract: any) => {
        try {
            const projects = await contract.call('getProjects');
            const allProjects = projects.map((project: any, index: number): Project => ({
                owner: project.owner,
                projectTitle: project.projectTitle,
                briefDescription: project.briefDescription,
                target: ethers.formatEther(project.target.toString()),
                deadline: Number(project.deadline),
                collectedAmount: ethers.formatEther(project.collectedAmount.toString()),
                image: project.image,
                id: index
            }));
            return allProjects;
        } catch (error) {
            throw new Error(`Failed to fetch projects: ${error}`);
        }
    }
);

export const fetchUserProjects = createAsyncThunk(
    'project/fetchUser',
    async ({ contract, address }: { contract: any; address: string }) => {
        try {
            const projects = await contract.call('getProjects');
            const allProjects = projects.map((project: any, index: number): Project => ({
                owner: project.owner,
                projectTitle: project.projectTitle,
                briefDescription: project.briefDescription,
                target: ethers.formatEther(project.target.toString()),
                deadline: Number(project.deadline),
                collectedAmount: ethers.formatEther(project.collectedAmount.toString()),
                image: project.image,
                id: index
            }));

            const filteredProjects = allProjects.filter((project: Project) => 
                project.owner === address
            );
            return filteredProjects;
        } catch (error) {
            throw new Error(`Failed to fetch user projects: ${error}`);
        }
    }
);

export const donateToProject = createAsyncThunk(
    'project/donate',
    async ({ id, amount, contract }: { id: number; amount: string; contract: any }) => {
        try {
            const data = await contract.call('donate', [id], { 
                value: ethers.parseEther(amount) 
            });
            return { id, amount, data };
        } catch (error) {
            throw new Error(`Failed to donate: ${error}`);
        }
    }
);

export const fetchProjectDonations = createAsyncThunk(
    'project/fetchDonations',
    async ({ id, contract }: { id: number; contract: any }) => {
        try {
            const donations = await contract.call('getDonators', [id]);
            const numberOfDonations = donations[0].length;
            const parsedDonations: Donations[] = [];
            
            for (let i = 0; i < numberOfDonations; i++) {
                parsedDonations.push({
                    donor: donations[0][i],
                    donation: ethers.formatEther(donations[1][i].toString()),
                });
            }
            
            return { id, donations: parsedDonations };
        } catch (error) {
            throw new Error(`Failed to fetch donations: ${error}`);
        }
    }
);

// Slice
const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setContract: (state, action: PayloadAction<any>) => {
            state.contract = action.payload;
        },
        setAddress: (state, action: PayloadAction<string | null>) => {
            state.address = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetState: () => {
            return initialState;
        },
        clearProjects: (state) => {
            state.projects = [];
        },
        clearUserProjects: (state) => {
            state.user = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Project
            .addCase(createProject.pending, (state) => {
                state.loading.creating = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.loading.creating = false;
                // Optionally add the created project to the state
            })
            .addCase(createProject.rejected, (state, action) => {
                state.loading.creating = false;
                state.error = action.error.message || 'Failed to create project';
            })
            
            // Fetch All Projects
            .addCase(fetchAllProjects.pending, (state) => {
                state.loading.projects = true;
                state.error = null;
            })
            .addCase(fetchAllProjects.fulfilled, (state, action) => {
                state.loading.projects = false;
                state.projects = action.payload;
            })
            .addCase(fetchAllProjects.rejected, (state, action) => {
                state.loading.projects = false;
                state.error = action.error.message || 'Failed to fetch projects';
            })
            
            // Fetch User Projects
            .addCase(fetchUserProjects.pending, (state) => {
                state.loading.user = true;
                state.error = null;
            })
            .addCase(fetchUserProjects.fulfilled, (state, action) => {
                state.loading.user = false;
                state.user = action.payload;
            })
            .addCase(fetchUserProjects.rejected, (state, action) => {
                state.loading.user = false;
                state.error = action.error.message || 'Failed to fetch user projects';
            })
            
            // Donate to Project
            .addCase(donateToProject.pending, (state) => {
                state.loading.donating = true;
                state.error = null;
            })
            .addCase(donateToProject.fulfilled, (state, action) => {
                state.loading.donating = false;
                // Update the project's collected amount if needed
                const { id, amount } = action.payload;
                const project = state.projects.find(p => p.id === id);
                if (project) {
                    const currentAmount = parseFloat(project.collectedAmount);
                    const donationAmount = parseFloat(amount);
                    project.collectedAmount = (currentAmount + donationAmount).toString();
                }
            })
            .addCase(donateToProject.rejected, (state, action) => {
                state.loading.donating = false;
                state.error = action.error.message || 'Failed to donate to project';
            })
            
            // Fetch Project Donations
            .addCase(fetchProjectDonations.pending, (state) => {
                state.loading.donations = true;
                state.error = null;
            })
            .addCase(fetchProjectDonations.fulfilled, (state, action) => {
                state.loading.donations = false;
                state.donations[action.payload.id] = action.payload.donations;
            })
            .addCase(fetchProjectDonations.rejected, (state, action) => {
                state.loading.donations = false;
                state.error = action.error.message || 'Failed to fetch donations';
            });
    }
});

export const projectReducer = projectSlice.reducer;
export const { 
    setContract, 
    setAddress, 
    clearError, 
    resetState, 
    clearProjects, 
    clearUserProjects 
} = projectSlice.actions;