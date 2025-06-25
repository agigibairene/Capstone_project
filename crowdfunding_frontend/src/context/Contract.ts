// import { useContext, createContext} from 'react';
// import 
// import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
// import { Contract, ethers } from 'ethers';

// // Types
// interface Campaign {
//   owner: string;
//   title: string;
//   description: string;
//   target: string;
//   deadline: number;
//   amountCollected: string;
//   image: string;
//   pId: number;
// }

// interface CampaignForm {
//   title: string;
//   description: string;
//   target: string;
//   deadline: string;
//   image: string;
// }

// interface Donation {
//   donator: string;
//   donation: string;
// }

// interface StateContextType {
//   address: string | undefined;
//   contract: any;
//   connect: () => void;
//   createCampaign: (form: CampaignForm) => Promise<void>;
//   getCampaigns: () => Promise<Campaign[]>;
//   getUserCampaigns: () => Promise<Campaign[]>;
//   donate: (pId: number, amount: string) => Promise<any>;
//   getDonations: (pId: number) => Promise<Donation[]>;
// }

// interface StateContextProviderProps {
//   children: React.ReactNode;
// }

// export const ContractContext = createContext<StateContextType | undefined>(undefined);

// export default function ContractContextProvider({ children }: StateContextProviderProps) {
//   const { contract } = useContract('0xf59A1f8251864e1c5a6bD64020e3569be27e6AA9');
//   const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
//   const address = useAddress();
//   const connect = useMetamask();

//   const publishCampaign = async (form: CampaignForm): Promise<void> => {
//     try {
//       const data = await createCampaign({
//         args: [
//           address, 
//           form.title, 
//           form.description, 
//           form.target,
//           new Date(form.deadline).getTime(), 
//           form.image,
//         ],
//       });
//       console.log("contract call success", data);
//     } catch (error) {
//       console.log("contract call failure", error);
//     }
//   };

//   const getCampaigns = async (): Promise<Campaign[]> => {
//     const campaigns = await contract.call('getCampaigns');
//     const parsedCampaigns: Campaign[] = campaigns.map((campaign: any, i: number) => ({
//       owner: campaign.owner,
//       title: campaign.title,
//       description: campaign.description,
//       target: ethers.formatEther(campaign.target.toString()),
//       deadline: campaign.deadline.toNumber(),
//       amountCollected: ethers.formatEther(campaign.amountCollected.toString()),
//       image: campaign.image,
//       pId: i
//     }));
//     return parsedCampaigns;
//   };

//   const getUserCampaigns = async (): Promise<Campaign[]> => {
//     const allCampaigns = await getCampaigns();
//     const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
//     return filteredCampaigns;
//   };

//   const donate = async (pId: number, amount: string): Promise<any> => {
//     const data = await contract.call('donateToCampaign', [pId], { 
//       value: ethers.parseEther(amount)
//     });
//     return data;
//   };

//   const getDonations = async (pId: number): Promise<Donation[]> => {
//     const donations = await contract.call('getDonators', [pId]);
//     const numberOfDonations = donations[0].length;
//     const parsedDonations: Donation[] = [];
    
//     for (let i = 0; i < numberOfDonations; i++) {
//       parsedDonations.push({
//         donator: donations[0][i],
//         donation: ethers.formatEther(donations[1][i].toString())
//       });
//     }
    
//     return parsedDonations;
//   };

//   const values = { 
//         address,
//         contract,
//         connect,
//         createCampaign: publishCampaign,
//         getCampaigns,
//         getUserCampaigns,
//         donate,
//         getDonations
//     }

//   return (
//     <ContractContext.Provider value={values}>
//         {children}
//     <ContractContext.Provider>
//   )
// };

// export const useStateContext = (): StateContextType => {
//   const context = useContext(StateContext);
//   if (context === undefined) {
//     throw new Error('useStateContext must be used within a StateContextProvider');
//   }
//   return context;
// };