import React, { useState } from 'react'
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  ShoppingCart, 
  Heart, 
  LayoutGrid,
  Settings,
  HelpCircle,
  Library
} from 'lucide-react'
import Navbar from './components/Navbar'
import UploadSection from './components/UploadSection'
import CardGrid from './components/CardGrid'
import SettingsModal from './components/SettingsModal'
import HelpModal from './components/HelpModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-xl transition-all mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
    }`}
  >
    <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
)

const AppContent = () => {
  console.log('AppContent rendering...');
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('browse') // browse, upload, inventory, cart, favorites
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const { user, cart, favorites } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transition-all duration-300 shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            {!collapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white text-lg">YukkeTrade</span>
              </div>
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 transition-colors mx-auto"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1">
            <SidebarItem 
              icon={LayoutGrid} 
              label="浏览卡牌" 
              active={activeTab === 'browse'} 
              onClick={() => setActiveTab('browse')}
              collapsed={collapsed}
            />
            <SidebarItem 
              icon={Library} 
              label="个人仓库" 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')}
              collapsed={collapsed}
            />
            <SidebarItem 
              icon={Upload} 
              label="上传卡牌" 
              active={activeTab === 'upload'} 
              onClick={() => setActiveTab('upload')}
              collapsed={collapsed}
            />
            <div className="my-4 border-t border-gray-100 dark:border-slate-800 pt-4">
              <SidebarItem 
                icon={ShoppingCart} 
                label="购物车" 
                active={activeTab === 'cart'} 
                onClick={() => setActiveTab('cart')}
                collapsed={collapsed}
              />
              <SidebarItem 
                icon={Heart} 
                label="收藏夹" 
                active={activeTab === 'favorites'} 
                onClick={() => setActiveTab('favorites')}
                collapsed={collapsed}
              />
            </div>
          </nav>

          {/* Footer Items */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
            <SidebarItem 
              icon={Settings} 
              label="设置" 
              onClick={() => setSettingsOpen(true)}
              collapsed={collapsed}
            />
            <SidebarItem 
              icon={HelpCircle} 
              label="帮助中心" 
              onClick={() => setHelpOpen(true)}
              collapsed={collapsed}
            />
          </div>

          {/* Version Number */}
          <div className="mt-4 px-3 py-2">
            <p className={`text-[10px] font-mono text-gray-400 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? 'v1.0' : '版本号：YV-2026/05/25'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Navbar />
        
        <div className="p-4 sm:p-8">
          {activeTab === 'browse' && <CardGrid />}
          {activeTab === 'inventory' && (
            <div>
              <div className="mb-6 flex items-center space-x-2">
                <Library className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">个人仓库</h2>
              </div>
              {user ? (
                <CardGrid mode="my_cards" />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-800">
                  <Library className="h-16 w-16 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">请先登录</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">登录后即可查看您上传的所有藏品。</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'upload' && <UploadSection />}
          {activeTab === 'cart' && (
            <div>
              <div className="mb-6 flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">我的购物车</h2>
              </div>
              {Object.keys(cart).length > 0 ? (
                <CardGrid filterIds={Object.keys(cart)} />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-800">
                  <ShoppingCart className="h-16 w-16 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">购物车空空如也</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">快去浏览卡牌并添加到购物车吧！</p>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    去浏览
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'favorites' && (
            <div>
              <div className="mb-6 flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">我的收藏夹</h2>
              </div>
              {favorites.size > 0 ? (
                <CardGrid filterIds={Array.from(favorites)} />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-800">
                  <Heart className="h-16 w-16 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">暂无收藏</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">点击卡牌上的心形图标即可收藏。</p>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    去寻找心仪卡牌
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
