import { Upload } from 'lucide-react';

interface InputProps{
  label: string,
  placeholder: string,
  inputType: string,
  isTextArea?: boolean,
  value: string,
  rows?: number,
  acceptFile?: string
  handleChange: (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>void
}


export default function InputField({acceptFile,rows,label,placeholder,inputType,isTextArea,value,handleChange}: InputProps) {
  return (
    <label className="flex-1 w-full flex flex-col">
      {label && (
        <span className="font-Outfit font-medium text-[14px] leading-[22px] text-limeTxt mb-[10px]">
          {label}
        </span>
      )}

      {inputType === 'file' ? (
        <div className="relative w-full">
          <label className="flex items-center justify-between gap-3 cursor-pointer bg-white/10 border border-white/30 px-4 py-3 rounded-[10px] text-white w-full">
            <div className="flex items-center gap-2 text-sm truncate">
              <Upload className="w-4 h-4 text-gray-300" />
              <span className="truncate">
                {value ? value : placeholder || 'Upload file'}
              </span>
            </div>
            <input
              type="file"
              accept={acceptFile}
              onChange={handleChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      ) : isTextArea ? (
        <textarea
          required
          value={value}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-white/30 bg-transparent font-Outfit text-white text-[14px] placeholder:text-gray-300 rounded-[10px] sm:min-w-[300px]"
        />
      ) : (
        <input
          required
          value={value}
          onChange={handleChange}
          type={inputType}
          step="0.1"
          accept={acceptFile}
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-white/30 bg-transparent font-Outfit text-white text-[14px] placeholder:text-gray-300 rounded-[10px] sm:min-w-[300px]"
        />
      )}
    </label>
  );
}
