import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  BarChart, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  GraduationCap,
  Search,
  Bell,
  ChevronRight,
  Play,
  Target,
  Award,
  ArrowRight
} from 'lucide-react';

export default function CoachProDashboard() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, color: 'bg-teal-500' },
    { name: 'Squad', icon: Users, color: 'bg-blue-500' },
    { name: 'Messenger', icon: MessageCircle, color: 'bg-green-500' },
    { name: 'Statistic', icon: BarChart, color: 'bg-orange-500' },
    { name: 'Calendar', icon: Calendar, color: 'bg-purple-500' },
    { name: 'Finance', icon: DollarSign, color: 'bg-yellow-500' },
    { name: 'Transfers', icon: TrendingUp, color: 'bg-red-500' },
    { name: 'Youth academy', icon: GraduationCap, color: 'bg-indigo-500' }
  ];

  const standings = [
    { pos: 1, team: 'Juventus', mp: 8, w: 6, d: 1, l: 1, gf: 13, ga: 9, pts: 19 },
    { pos: 2, team: 'Atalanta', mp: 8, w: 5, d: 1, l: 2, gf: 16, ga: 7, pts: 16 },
    { pos: 3, team: 'Inter', mp: 8, w: 5, d: 0, l: 3, gf: 15, ga: 4, pts: 15 },
    { pos: 4, team: 'Napoli', mp: 8, w: 4, d: 1, l: 3, gf: 13, ga: 9, pts: 13 },
    { pos: 5, team: 'Milan', mp: 8, w: 4, d: 1, l: 3, gf: 13, ga: 4, pts: 13 },
    { pos: 6, team: 'Roma', mp: 8, w: 4, d: 0, l: 4, gf: 12, ga: 3, pts: 12 }
  ];

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 h-screen bg-white/40 backdrop-blur-lg border-r border-white/30 flex flex-col fixed left-0 top-0 z-10">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">CoachPro</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;
              
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item.name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${item.color} ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                  <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Section - User Profile */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Andrea Pirlo</p>
                <p className="text-xs text-gray-600">Head Coach</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white/40 backdrop-blur-lg border-b border-white/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-600 text-sm font-medium">Welcome back, Andrea 👋</p>
                <h1 className="text-2xl font-bold text-gray-800 mt-1">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button className="p-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 hover:bg-white/70 transition-colors">
                  <Bell size={20} className="text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">AP</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Andrea Pirlo</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6 space-y-6">
            {/* Top Row - Next Game and Game Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Next Game */}
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Next game</h3>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center">
                    View calendar <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">🏆 Serie A</p>
                  <p className="text-sm text-gray-500 mb-4">21:00, 11 November, 2022</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">J</span>
                      </div>
                      <span className="font-semibold text-gray-800">Juventus</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-500">VS</span>
                      <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-800">Sassuolo</span>
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Statistics */}
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Games statistic</h3>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center">
                    View all statistic <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">PL</p>
                    <p className="text-2xl font-bold text-gray-800">8</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Victories</p>
                    <p className="text-2xl font-bold text-green-600">6</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Draws</p>
                    <p className="text-2xl font-bold text-yellow-600">1</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lost</p>
                    <p className="text-2xl font-bold text-red-600">1</p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* Middle Row - Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Possession</p>
                    <p className="text-2xl font-bold text-gray-800">65%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <DollarSign className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overall Price</p>
                    <p className="text-2xl font-bold text-gray-800">€690.2m</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transfer Budget</p>
                    <p className="text-2xl font-bold text-gray-800">€240.6m</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <Award className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Average Score</p>
                    <p className="text-2xl font-bold text-gray-800">7.2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Standings and Training */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Standings */}
              <div className="lg:col-span-2 bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Standings</h3>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center">
                    View all <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left pb-3">#</th>
                        <th className="text-left pb-3">Team</th>
                        <th className="text-center pb-3">MP</th>
                        <th className="text-center pb-3">W</th>
                        <th className="text-center pb-3">D</th>
                        <th className="text-center pb-3">L</th>
                        <th className="text-center pb-3">G</th>
                        <th className="text-center pb-3">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={index} className={`border-b border-gray-100 ${team.pos === 1 ? 'bg-yellow-50' : ''}`}>
                          <td className="py-3 text-sm font-medium text-gray-800">{team.pos}</td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                team.team === 'Juventus' ? 'bg-black' :
                                team.team === 'Atalanta' ? 'bg-blue-600' :
                                team.team === 'Inter' ? 'bg-blue-800' :
                                team.team === 'Napoli' ? 'bg-blue-400' :
                                team.team === 'Milan' ? 'bg-red-600' :
                                'bg-yellow-600'
                              }`}>
                                {team.team[0]}
                              </div>
                              <span className="text-sm font-medium text-gray-800">{team.team}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center text-sm text-gray-600">{team.mp}</td>
                          <td className="py-3 text-center text-sm text-gray-600">{team.w}</td>
                          <td className="py-3 text-center text-sm text-gray-600">{team.d}</td>
                          <td className="py-3 text-center text-sm text-gray-600">{team.l}</td>
                          <td className="py-3 text-center text-sm text-gray-600">{team.gf}:{team.ga}</td>
                          <td className="py-3 text-center text-sm font-bold text-gray-800">{team.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Training Setup */}
              <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm opacity-90 mb-2">DON'T FORGET</p>
                  <h3 className="text-xl font-bold mb-4">Setup training for next week</h3>
                  <button className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2">
                    <span>Go to training center</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <Play size={40} />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <div className="w-32 h-32 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}