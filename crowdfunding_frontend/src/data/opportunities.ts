export interface Opportunity {
  id: number;
  title: string;
  location: string;
  organization: string;
  team: string;
  type: string;
  tags: string[];
  description: string;
  full_description: string; 
  amount: string;
  deadline: string;
  posted: string;
  views: number;
  applicants: number;
  application_link: string; 
}