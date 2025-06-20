import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../Utils/InputField";
import Loader from "../Utils/Loader";



export default function CreateProject(){
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: '',
    email: '',
    brief: '',
    description: '',
    target: '', 
    deadline: '',
    image: '',
    file: ''
  });

  function handleFormFieldChange( fieldName: keyof typeof form, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [fieldName]: e.target.value })
  }

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     checkIfImage(form.image, async (exists) => {
//       if(exists) {
//         setIsLoading(true)
//         await createCampaign({ ...form, target: ethers.utils.parseUnits(form.target, 18)})
//         setIsLoading(false);
//         navigate('/');
//       } else {
//         alert('Provide valid image URL')
//         setForm({ ...form, image: '' });
//       }
//     })
//   }

  return (
    <div className="bg-white/20 backdrop-blur-sm mx-auto w-[85%] flex justify-center items-center flex-col rounded-lg sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-bgColor rounded-[10px]">
        <h1 className="font-Outfit font-bold sm:text-[25px] text-[18px] leading-[38px] text-limeTxt">Start a Project</h1>
      </div>

      <form className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <InputField
            label="Your Name *"
            placeholder="Enter your full name"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)}
            isTextArea={false}
          />
          <InputField
            label="Project Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
            isTextArea={false}
          />
        </div>
        
         <div className="flex flex-wrap gap-[40px]">
          <InputField
            label="Email address*"
            placeholder="Enter your email address"
            inputType="text"
            value={form.email}
            handleChange={(e) => handleFormFieldChange('email', e)}
            isTextArea={false}
          />
          <InputField
            label="Brief description*"
            placeholder="Write a brief description not more than 0ne sentence"
            inputType="text"
            value={form.brief}
            handleChange={(e) => handleFormFieldChange('brief', e)}
            isTextArea={true}
            rows={2}
          />
        </div>


        <InputField
            label="Detailed Description *"
            inputType="textarea"
            placeholder="Write a description"
            isTextArea={true}
            value={form.description}
            rows={10}
            handleChange={(e) => handleFormFieldChange('description', e)}
          />

        <div className="flex flex-wrap gap-[40px]">
          <InputField
            label="Goal *"
            placeholder="USD/ETH 0.50"
            inputType="text"
            value={form.target}
            isTextArea={false}
            handleChange={(e) => handleFormFieldChange('target', e)}
          />
          <InputField
            label="End Date *"
            placeholder="End Date"
            inputType="date"
            isTextArea={false}
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
          />
        </div>

        <div className="flex flex-wrap gap-[40px]">
            <InputField
                label="Campaign image *"
                placeholder="Place image URL of your campaign"
                inputType="url"
                isTextArea={false}
                value={form.image}
                handleChange={(e) => handleFormFieldChange('image', e)}
            />

             <InputField
                label="Proposal upload *"
                placeholder="Upload your proposal"
                inputType="file"
                acceptFile=".pdf,.docx"
                isTextArea={false}
                value={form.file}
                handleChange={(e) => handleFormFieldChange('file', e)}
            />
        </div>

          <div className="flex justify-center items-center mt-[40px]">
            
            <button type="submit" className="transition hover:-translate-y-1 hover:shadow-xl cursor-pointer bg-bgColor font-Outfit font-semibold text-[16px] leading-[26px] text-limeTxt min-h-[52px] px-4 rounded-[10px]">
                Submit your project
            </button>
          </div>
      </form>
    </div>
  )
}

