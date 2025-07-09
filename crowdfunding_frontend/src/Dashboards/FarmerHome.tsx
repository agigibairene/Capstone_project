import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { API_URL } from '../Utils/constants';
import FarmerProjects from '../Utils/FarmerProject';

export default function FarmerHome() {
  const { kycData, role, loading, error } = useSelector((state: RootState) => state.kycReducer);

  if (loading) return <p>Loading KYC data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!kycData || !kycData.kyc) return <p>No KYC data found for your account</p>;

  const user = kycData.kyc;

  return (
    <section className='flex gap-8 items-start'>
      <div className="bg-white/20 backdrop-blur-sm w-[28rem] rounded-2xl p-6 border border-white/30">
        <div className="flex gap-2 items-center space-x-3">
          <div className="bg-purple-100 rounded-full flex items-center justify-center">
            {user.profile_picture && (
              <img
                src={`${API_URL}${user.profile_picture}`}
                className="w-[8rem] h-[8rem] rounded-full"
                alt="Profile"
              />
            )}
          </div>
          <div>
            <p className="text-xl text-limeTxt tracking-wide mb-3">{user.full_name}</p>
            <p className="text-md mb-1 text-limeTxt tracking-wide">{user.email || 'No email provided'}</p>
            <p className="text-md mb-1 text-white">Phone: {user.phone_number}</p>
            <p className="text-md mb-1 text-white">Address: {user.address}</p>
            <p className="text-md mb-1 text-white">Role: {role}</p>
          </div>
        </div>
      </div>

      <FarmerProjects />
    </section>
  );
}
