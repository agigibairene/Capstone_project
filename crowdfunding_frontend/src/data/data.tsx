import { BarChart3,PenLine,Bot, LogOut,FolderOpen, User, File} from "lucide-react";
import image from '../assets/dp.jpg'
import type { JSX } from "react";

export const menuItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    color: "bg-teal-500",
    active: true,
  },
  {
    name: 'NDA',
    icon: File,
    color: 'bg-lime-300',
    active: false
  },
  {
    name: "All Projects",
    icon: FolderOpen,
    color: "bg-blue-500",
    active: false,
  },
  {
    name: 'Your Profile',
    icon: User,
    color: "bg-fuchsia-500",
    active: false
  },
  {
    name: "Log Out",
    icon: LogOut,
    color: "bg-green-500",
    active: false,
  },

];

export const farmerMenuItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    color: "bg-teal-500",
    active: true,
  },
  {
    name: "Create Project",
    icon: PenLine,
    color: "bg-blue-500",
    active: false,
  },
  {
    name: "ChatBot",
    icon:  Bot,
    color: "bg-green-500",
    active: false,
  },
  {
    name: 'Your Profile',
    icon: User,
    color: "bg-fuchsia-500",
    active: false
  },
  {
    name: "Log Out",
    icon: LogOut,
    color: "bg-orange-500",
    active: false,
  },
];

export const projects = [
  {
    name: "Ama Owusu",
    title: "Organic Pineapple Expansion",
    email: "ama.owusu@agrogh.com",
    brief: "Scaling up organic pineapple farm for export.",
    description: "This project involves expanding an existing 5-acre organic pineapple farm to 20 acres, acquiring modern irrigation systems, and hiring additional labor to meet international export standards.",
    target: "₵200,000",
    deadline: "2025-08-15",
    image: image,
  },
  {
    name: "Kwame Mensah",
    title: "Smart Irrigation for Maize",
    email: "kwame.mensah@smartagri.com",
    brief: "Introduce IoT-based irrigation on a maize farm.",
    description: "Implementing smart sensors and mobile-controlled irrigation systems to improve water efficiency and yield on a 10-acre maize farm in the Eastern Region.",
    target: "₵150,000",
    deadline: "2025-07-30",
    image: "https://images.unsplash.com/photo-1613323593608-abc3fdd47766",
  },
  {
    name: "Efua Boateng",
    title: "Agri-Tech Hub for Women",
    email: "efua.boateng@agritech.org",
    brief: "A hub to train women in agritech innovation.",
    description: "Developing a local hub offering training, mentorship, and shared tools to empower over 100 women in tech-enabled agriculture practices.",
    target: "₵300,000",
    deadline: "2025-09-01",
    image: "https://images.pexels.com/photos/1546307/pexels-photo-1546307.jpeg",
  },
  {
    name: "Yaw Asante",
    title: "Cassava Processing Facility",
    email: "yaw.asante@cassavaco.com",
    brief: "Build a cassava value-add processing center.",
    description: "This facility will convert cassava into flour and starch for sale locally and internationally, increasing income for over 200 smallholder farmers.",
    target: "₵500,000",
    deadline: "2025-10-10",
    image: "https://images.unsplash.com/photo-1665561332670-59f749e4c9f4",
  },
  {
    name: "Akua Dapaah",
    title: "Vertical Farming in Kumasi",
    email: "akua.dapaah@urbanfarmers.org",
    brief: "Urban-based vertical vegetable farming.",
    description: "Utilizing vertical farming to grow leafy greens sustainably in Kumasi, reducing food transport cost and increasing urban food supply.",
    target: "₵250,000",
    deadline: "2025-08-20",
    image: "https://images.pexels.com/photos/6693392/pexels-photo-6693392.jpeg",
  },
  {
    name: "Kojo Adu",
    title: "Solar Cold Storage for Tomatoes",
    email: "kojo.adu@freshpackghana.com",
    brief: "Solar-powered cold storage to reduce post-harvest loss.",
    description: "Installing off-grid solar cold rooms in tomato-growing communities to preserve freshness and reduce wastage by 60%.",
    target: "₵180,000",
    deadline: "2025-07-28",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc",
  },
  {
    name: "Mariam Yakubu",
    title: "Rice Milling Modernization",
    email: "mariam.yakubu@ricecooperative.org",
    brief: "Upgrade community rice mill with modern equipment.",
    description: "Replace outdated equipment with high-capacity mills and dryers to improve rice quality and export competitiveness.",
    target: "₵400,000",
    deadline: "2025-08-31",
    image: "https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg",
  },
  {
    name: "Daniel Armah",
    title: "Beekeeping for Sustainable Honey",
    email: "daniel.armah@greenbuzz.org",
    brief: "Train youth in beekeeping and honey production.",
    description: "Create a honey cooperative involving 50 young farmers and provide eco-friendly hives to increase biodiversity and income.",
    target: "₵120,000",
    deadline: "2025-09-15",
    image: "https://images.unsplash.com/photo-1598961753721-797b5c0ad9f2",
  },
  {
    name: "Selina Addo",
    title: "Shea Butter Cooperative",
    email: "selina.addo@sheastar.org",
    brief: "Empowering rural women via shea butter production.",
    description: "Establish a shea butter production center with training, packaging, and export readiness for women in Northern Ghana.",
    target: "₵350,000",
    deadline: "2025-10-05",
    image: "https://images.unsplash.com/photo-1598866544495-eac72f1210b8",
  },
  {
    name: "Nana Kofi Boadu",
    title: "Hydroponic Greenhouse for Peppers",
    email: "nana.boadu@greenpeppertech.com",
    brief: "Introduce hydroponics to grow peppers year-round.",
    description: "Build a greenhouse system using hydroponics to produce high-yield peppers in a water-efficient and pesticide-free environment.",
    target: "₵275,000",
    deadline: "2025-09-10",
    image: "https://images.pexels.com/photos/6643627/pexels-photo-6643627.jpeg",
  },
];


interface Country{
  code: string
  country: string
  flag: string
}


export const countryCodes : Country[] = [
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+239', country: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'Republic of the Congo', flag: '🇨🇬' },
  { code: '+243', country: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+246', country: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+262', country: 'Réunion/Mayotte', flag: '🇷🇪' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+290', country: 'Saint Helena', flag: '🇸🇭' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼' },
  { code: '+298', country: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+383', country: 'Kosovo', flag: '🇽🇰' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+7', country: 'Russia/Kazakhstan', flag: '🇷🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫' },
  { code: '+596', country: 'Martinique', flag: '🇲🇶' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+599', country: 'Netherlands Antilles', flag: '🇧🇶' },
].sort((a, b) => a.country.localeCompare(b.country));


interface NDASection {
  title: string;
  content: string | JSX.Element | string[];
  subSections?: {
    title: string;
    content: string;
  }[];
}


export const NDAsections : NDASection[]= [
  {
    title: '1. Purpose',
    content: 'The purpose of this Agreement is to prevent unauthorized use, disclosure, or reproduction of confidential information and intellectual property belonging to project owners (Farmers or Agricultural Entrepreneurs) listed on the Platform.',
  },
  {
    title: '2. Definitions',
    subSections: [
      {
        title: '2.1 Confidential Information',
        content: 'Includes all business proposals, documentation, business plans, financial projections, technological concepts, sustainable methods, or any materials uploaded by project owners, whether marked as confidential or not.',
      },
      {
        title: '2.2 Intellectual Property (IP)',
        content: 'Includes all trademarks, copyrights, trade secrets, processes, techniques, ideas, inventions, and other proprietary content disclosed through proposal documents or listed projects.',
      },
    ],
    content: ""
  },
  {
    title: '3. Obligations of Recipient',
    content: [
      '3.1 Recipient agrees not to copy, reproduce, disclose, reverse-engineer, exploit, or use any part of the Confidential Information or IP for personal or commercial gain without express written consent of the rightful owner.',
      "3.2 Recipient shall not implement, replicate, or attempt to profit from any idea, concept, or structure disclosed through the Platform's proposals.",
      "3.3 Recipient agrees not to share, distribute, or disclose any content to third parties, including colleagues, partners, or competing platforms.",
      '3.4 Recipient agrees to use all reasonable means to protect and maintain the confidentiality and integrity of such information.',
    ],
  },
  {
    title: '4. Access Limitations',
    content: [
      '4.1 Only investors who have signed this NDA via digital e-signature may view watermarked PDF proposals on a read-only basis through the Platform.',
      '4.2 Farmers are restricted from accessing or viewing other users\' proposals or project documents.',
    ],
  },
  {
    title: '5. Ownership & IPR',
    content: [
      '5.1 All Confidential Information and associated Intellectual Property remains the sole property of the original project owner.',
      '5.2 This Agreement does not transfer any ownership rights to the Recipient, nor does it grant any license or rights beyond those expressly stated.',
    ],
  },
  {
    title: '6. Watermarking & Content Protection',
    content: [
      '6.1 All uploaded proposals are automatically embedded with "SeedLinq" watermarks using PyPDF2 and displayed in a secure PDF format.',
      '6.2 This protection is enforced to prevent unauthorized reproduction or sharing of materials.',
    ],
  },
  {
    title: '7. Legal Enforcement',
    content: [
      '7.1 Any breach of this Agreement, including misuse, unauthorized implementation, or disclosure of confidential material, will result in immediate legal action.',
      '7.2 The Platform reserves the right to suspend, terminate, or permanently ban users in breach of this Agreement and seek damages, injunctive relief, and/or prosecution.',
    ],
  },
  {
    title: '8. E-Signature & Acceptance',
    content: (
      <>
        <p>By signing electronically, the Recipient acknowledges that:</p>
        <ul>
          <li>• They have read and understood this Agreement</li>
          <li>• They agree to be legally bound by its terms</li>
          <li>• They accept that a violation may result in legal liability.</li>
        </ul>
      </>
    ),
  },
  {
    title: '9. Governing Law',
    content: `This Agreement shall be governed by and construed in accordance with the laws the Republic of Ghana, according to the Copyright Act, 2005 (Act 690), the Patents Act, 2003 (Act 657), the Trademarks Act, 2004 (Act 664),
     the Industrial Designs Act, 2003 (Act 660), 
    and the Protection Against Unfair Competition Act, 2000 (Act 589), without applying any 
    rules that might direct the use of another jurisdiction's laws.`,
  }
];

                 