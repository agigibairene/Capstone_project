import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Loader2 } from 'lucide-react';
import { API_URL } from '../Utils/constants';

interface TotalAmountData {
  total_amount_needed: number;
  project_count: number;
  currency?: string;
}

export default function TotalAmount() {
  const [data, setData] = useState<TotalAmountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalAmount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      
      const response = await fetch(`${API_URL}/projects/sum/`, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      const processedData: TotalAmountData = {
        total_amount_needed: result.total_amount_needed || 0,
        project_count: result.project_count || 0,
        currency: result.currency || 'USD'
      };
      
      setData(processedData);
    } catch (err) {
      console.error('Error fetching total amount:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalAmount();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-bgColor" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="bg-red-100 p-3 rounded-lg mb-4">
            <span className="text-red-600 font-medium">Error Fetching data</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTotalAmount}
            className="px-4 py-2 bg-bgColor text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const fundedAmount =  0;
  const remainingAmount =  0;

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Total Funding Needed</h2>
            <p className="text-sm text-limeTxt">Active Projects</p>
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-limeTxt" />
      </div>

      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-gray-900">
            {formatCurrency(data?.total_amount_needed || 0)}
          </span>
        </div>
        <p className="text-sm text-bgColor mt-1">
          Across {data?.project_count || 0} active projects
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{formatCurrency(fundedAmount)}</p>
          <p className="text-xs text-limeTxt">Funded</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-limeTxt">{formatCurrency(remainingAmount)}</p>
          <p className="text-xs text-white">Remaining</p>
        </div>
      </div>

      
    </div>
  );
}