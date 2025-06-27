import { useState } from 'react';

export default function KYCForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    idType: '',
    idNumber: '',
    idUpload: null as File | null,
    profilePicture: null as File | null,
    address: '',
    occupation: '',
    incomeSource: '',
    annualIncome: '',
    purpose: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.idType) newErrors.idType = 'ID type is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!formData.idUpload) newErrors.idUpload = 'ID document is required';
    if (!formData.profilePicture) newErrors.profilePicture = 'Profile picture is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.incomeSource) newErrors.incomeSource = 'Income source is required';
    if (!formData.annualIncome) newErrors.annualIncome = 'Annual income is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Example handling
    console.log('KYC form data:', formData);
    alert('KYC form submitted successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-teal-700">KYC (Know Your Customer) Form</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block font-medium text-gray-700">Full Name</label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="input w-full"
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>

        {/* Phone & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">Phone Number</label>
            <input
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input w-full"
              placeholder="+123456789"
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="block font-medium text-gray-700">Date of Birth</label>
            <input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input w-full"
            />
            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className="block font-medium text-gray-700">Nationality</label>
          <input
            name="nationality"
            type="text"
            value={formData.nationality}
            onChange={handleChange}
            className="input w-full"
          />
          {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
        </div>

        {/* ID Type */}
        <div>
          <label className="block font-medium text-gray-700">ID Type</label>
          <select
            name="idType"
            value={formData.idType}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="">Select ID Type</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="driver_license">Driver's License</option>
          </select>
          {errors.idType && <p className="text-sm text-red-500">{errors.idType}</p>}
        </div>

        {/* ID Number and Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">ID Number</label>
            <input
              name="idNumber"
              type="text"
              value={formData.idNumber}
              onChange={handleChange}
              className="input w-full"
            />
            {errors.idNumber && <p className="text-sm text-red-500">{errors.idNumber}</p>}
          </div>
          <div>
            <label className="block font-medium text-gray-700">Upload ID Document</label>
            <input
              name="idUpload"
              type="file"
              accept="image/*,.pdf"
              onChange={handleChange}
              className="input w-full bg-white"
            />
            {errors.idUpload && <p className="text-sm text-red-500">{errors.idUpload}</p>}
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block font-medium text-gray-700">Upload Profile Picture</label>
          <input
            name="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="input w-full bg-white"
          />
          {errors.profilePicture && <p className="text-sm text-red-500">{errors.profilePicture}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium text-gray-700">Residential Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input w-full"
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        {/* Occupation */}
        <div>
          <label className="block font-medium text-gray-700">Occupation</label>
          <input
            name="occupation"
            type="text"
            value={formData.occupation}
            onChange={handleChange}
            className="input w-full"
          />
          {errors.occupation && <p className="text-sm text-red-500">{errors.occupation}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">Source of Funds</label>
            <select
              name="incomeSource"
              value={formData.incomeSource}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="">Select Source</option>
              <option value="salary">Salary</option>
              <option value="business">Business</option>
              <option value="investment">Investment</option>
              <option value="other">Other</option>
            </select>
            {errors.incomeSource && <p className="text-sm text-red-500">{errors.incomeSource}</p>}
          </div>
          <div>
            <label className="block font-medium text-gray-700">Annual Income (USD)</label>
            <input
              name="annualIncome"
              type="number"
              value={formData.annualIncome}
              onChange={handleChange}
              className="input w-full"
            />
            {errors.annualIncome && <p className="text-sm text-red-500">{errors.annualIncome}</p>}
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Purpose of Investment</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="input w-full"
          />
          {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
        </div>

        <button
          type="submit"
          className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-teal-700 transition"
        >
          Submit KYC
        </button>
      </form>
    </div>
  );
}
