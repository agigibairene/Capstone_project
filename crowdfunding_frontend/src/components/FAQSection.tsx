import { useState } from 'react';
import faq from "../assets/planb.png"
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeUp } from '../Utils/animations';


export default function FAQSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>();

  interface FAQs {
    title: string;
    content: string;
  }

  const faqs: FAQs[] = [
    {
      title: 'Project Listing',
      content:
        'Farmers or agricultural entrepreneurs can create profiles and list their projects on the platform. These projects could include initiatives such as expanding a farm, adopting new technology, or launching a sustainable agriculture program.',
    },
    {
      title: 'Investor Registration',
      content:
        'Investors interested in supporting agricultural projects can register on the platform. They might include individual investors, institutional investors, impact investors, or crowdfunding contributors.',
    },
    {
      title: 'Project Screening',
      content:
        "Before projects are listed on the platform, they undergo a screening process to assess their feasibility, impact, and alignment with the platform's criteria. This helps maintain quality standards and mitigate risks for investors.",
    },
    {
      title: 'Project Details and Documentation',
      content:
        'Each project listing provides detailed information about the project, including its goals, budget, expected returns, risks, and impact metrics. Relevant documentation such as business plans, financial projections, and legal agreements are also provided for due diligence.',
    },
    {
      title: 'Investment Options',
      content:
        'Investors can browse through the available projects and choose to invest in those that align with their preferences and investment criteria. Options may include equity investment, debt investment, revenue-sharing agreements, or donation-based crowdfunding.',
    },
    {
      title: 'Transaction Management',
      content:
        'The platform facilitates secure transactions between investors and project owners, handling processes such as payment processing, fund disbursement, and contract execution. It ensures transparency, confidentiality, and compliance with regulatory requirements.',
    },
  ];

  return (
    <section className="bg-bgColor px-6 pt-12 md:px-12 lg:px-24 font-Outfit">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        <div>
          <h2 className="font-bold text-xl md:text-2xl lg:text-5xl mb-2 text-limeTxt">
            What you need to Know
          </h2>
          <p className="text-white mb-4 mt-6 text-sm md:text-base">
            These are a couple of frequently asked questions and also things you
            need to know when you sign up as a farmer and investor, to satisfy
            all your curious questions.
          </p>
         <div className="w-[250px] h-[250px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px]">
            <img
              src={faq}
              alt="know more"
              className="w-full h-full object-contain"
            />
       </div>

        </div>

        <div className="w-full">
          {faqs.map((item, index) => {
            const { title, content } = item;
            const isOpen = selectedIndex === index;
            return (
              <motion.div
                variants={FadeUp(0.2*index)}
                initial={"hidden"}
                whileInView="visible"
                key={title}
                className="bg-white my-4 rounded-lg border border-gray-300 px-4 py-4"
              >
                <button
                  onClick={() =>
                    setSelectedIndex((prev) => (prev === index ? null : index))
                  }
                  className="flex w-full items-center justify-between bg-transparent outline-none cursor-pointer"
                >
                  <h4 className="text-base md:text-lg font-semibold text-gray-700 text-left">
                    {title}
                  </h4>
                  <span className="p-1 flex items-center justify-center bg-bgColor rounded-full text-white">
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2 text-bgColor text-sm md:text-base">{content}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
