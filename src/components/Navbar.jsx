import React, { useState } from 'react'
import { Search, User, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

const Navbar = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const { user, profile, signOut } = useAuth()

  const handleLoginClick = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleRegisterClick = () => {
    setAuthMode('register')
    setAuthModalOpen(true)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-xl font-bold text-slate-800 hidden sm:block">
                  YukkeTrade
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 sm:mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="搜索卡牌..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-blue-700 max-w-[100px] truncate">
                      {profile?.username || user.email.split('@')[0]}
                    </span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="退出登录"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleLoginClick}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    登录
                  </button>
                  <button 
                    onClick={handleRegisterClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <User className="h-4 w-4 mr-2" />
                    注册
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
      />
    </>
  )
}

export default Navbar