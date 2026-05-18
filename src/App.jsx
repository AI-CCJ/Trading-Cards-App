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
  HelpCircle
} from 'lucide-react'
import Navbar from './components/Navbar'
import UploadSection from './components/UploadSection'
import CardGrid from './components/CardGrid'
import { AuthProvider, useAuth } from './contexts/AuthContext'

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-xl transition-all mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
)

const AppContent = () => {
  console.log('AppContent rendering...');
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('browse') // browse, upload, cart, favorites
  const { user, cart, favorites } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 shadow-xl ${
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
                <span className="font-bold text-gray-800 text-lg">CardTrade</span>
              </div>
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mx-auto"
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
              icon={Upload} 
              label="上传卡牌" 
              active={activeTab === 'upload'} 
              onClick={() => setActiveTab('upload')}
              collapsed={collapsed}
            />
            <div className="my-4 border-t border-gray-100 pt-4">
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
          <div className="mt-auto pt-4 border-t border-gray-100">
            <SidebarItem 
              icon={Settings} 
              label="设置" 
              collapsed={collapsed}
            />
            <SidebarItem 
              icon={HelpCircle} 
              label="帮助中心" 
              collapsed={collapsed}
            />
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
          {activeTab === 'upload' && <UploadSection />}
          {activeTab === 'cart' && (
            <div>
              <div className="mb-6 flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">我的购物车</h2>
              </div>
              {Object.keys(cart).length > 0 ? (
                <CardGrid filterIds={Object.keys(cart)} />
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">购物车空空如也</h3>
                  <p className="text-gray-500 mt-2">快去浏览卡牌并添加到购物车吧！</p>
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
                <h2 className="text-2xl font-bold text-gray-900">我的收藏夹</h2>
              </div>
              {favorites.size > 0 ? (
                <CardGrid filterIds={Array.from(favorites)} />
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">暂无收藏</h3>
                  <p className="text-gray-500 mt-2">点击卡牌上的心形图标即可收藏。</p>
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
