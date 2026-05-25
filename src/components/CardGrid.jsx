import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, Clock, Image as ImageIcon, Tag, Loader, Edit2, Trash2, Heart, ShoppingCart, Plus, Minus, X, Maximize2, EyeOff, Eye } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import CardDetailDrawer from './CardDetailDrawer'

const CardGrid = ({ filterIds = null, mode = 'all' }) => {
  const [sortBy, setSortBy] = useState('created_at')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const { user, profile, cart, favorites, toggleCart, updateCartQuantity, toggleFavorite } = useAuth()

  // 从数据库加载卡牌数据
  const fetchCards = async (sortField = 'created_at') => {
    console.log('开始获取卡牌列表, 排序:', sortField);
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('cards')
        .select('*')

      // 权限过滤逻辑
      // 1. 如果是管理员，可以看到所有
      // 2. 如果是普通登录用户，可以看到 [公开产品] OR [自己的非公开产品]
      // 3. 如果是未登录用户，只能看到 [公开产品]
      // 4. 如果是 my_cards 模式，仅看自己的
      
      const isAdmin = profile?.role === 'admin' || user?.email === 'admin@gmail.com'; 
      
      if (mode === 'my_cards') {
        if (user) {
          query = query.eq('user_id', user.id)
        } else {
          setCards([])
          setLoading(false)
          return
        }
      } else if (!isAdmin) {
        if (user) {
          // 登录用户：(is_public = true) OR (user_id = 当前用户ID)
          query = query.or(`is_public.eq.true,user_id.eq.${user.id}`)
        } else {
          // 未登录：只能看到公开的
          query = query.eq('is_public', true)
        }
      }

      if (filterIds) {
        query = query.in('id', Array.from(filterIds))
      }

      // 根据排序字段应用排序
      switch (sortField) {
        case 'year':
          query = query.order('year', { ascending: false })
          break
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'created_at':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        console.error('获取卡牌数据库返回错误:', error);
        throw error
      }
      
      console.log('获取卡牌成功, 数量:', data?.length);
      setCards(data || [])
    } catch (err) {
      console.error('加载卡牌失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载或状态改变时获取数据
  useEffect(() => {
    fetchCards(sortBy)
  }, [sortBy, user, profile, filterIds, mode])

  // 格式化价格为人民币格式
  const formatPrice = (price) => {
    return `¥${price.toLocaleString('zh-CN')}`
  }

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">卡牌展示</h2>
          
          {/* Sort Controls */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">排序方式：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at">按上传时间</option>
                <option value="year">按年份</option>
                <option value="price_asc">价格：由低到高</option>
                <option value="price_desc">价格：由高到低</option>
              </select>
            </div>
            <span className="text-sm text-gray-500">
              共 {cards.length} 张卡牌
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>加载卡牌失败: {error}</p>
            <button 
              onClick={() => fetchCards(sortBy)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              重试
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无卡牌</h3>
            <p className="mt-1 text-sm text-gray-500">快来上传第一张卡牌吧！</p>
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full relative">
                {/* Auth Check: Only owner can edit/delete */}
                {user && user.id === card.user_id && (
                  <div className="absolute top-2 left-2 z-10 flex space-x-2">
                    <button className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full text-blue-600 hover:bg-blue-50 transition-colors border border-blue-100">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full text-red-600 hover:bg-red-50 transition-colors border border-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Favorite Button */}
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
                  <button 
                    onClick={() => toggleFavorite(card.id)}
                    className={`p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full border transition-colors ${
                      favorites.has(card.id) ? 'text-red-500 border-red-100' : 'text-gray-400 border-gray-100 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(card.id) ? 'fill-current' : ''}`} />
                  </button>
                  {card.is_public === false ? (
                    <div className="p-1.5 bg-amber-500/90 backdrop-blur shadow-sm rounded-full text-white flex items-center justify-center" title="私密内容">
                      <EyeOff className="h-3 w-3" />
                    </div>
                  ) : (
                    mode === 'my_cards' && (
                      <div className="p-1.5 bg-green-500/90 backdrop-blur shadow-sm rounded-full text-white flex items-center justify-center" title="公开展示">
                        <Eye className="h-3 w-3" />
                      </div>
                    )
                  )}
                </div>

                {/* Card Image - Aspect Ratio 4:3 */}
                <div 
                  className="relative pt-[75%] bg-gray-100 overflow-hidden cursor-pointer group/img"
                  onClick={() => setSelectedCard(card)}
                >
                  <img
                    src={card.image_url}
                    alt={card.character || '未命名卡牌'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity h-8 w-8" />
                  </div>
                </div>
                
                {/* Card Info - Fixed heights for alignment */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="h-7 mb-2 overflow-hidden">
                    <h3 className="font-bold text-gray-900 truncate">
                      {card.character || <span className="text-gray-300 font-normal italic text-sm">暂无名称</span>}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                    <div className="flex items-center h-5">
                      <Tag className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {card.category || <span className="text-gray-300 italic">暂无种类</span>}
                      </span>
                    </div>
                    <div className="flex items-center h-5">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{card.year ? `${card.year}年` : <span className="text-gray-300 italic">年份未知</span>}</span>
                    </div>
                    <div className="h-10 overflow-hidden">
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {card.notes || <span className="text-gray-300 italic">暂无备注信息...</span>}
                      </p>
                    </div>
                  </div>
                  
                  {/* Price and Cart Actions */}
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-green-600 font-bold text-xl">
                        {formatPrice(card.price || 0)}
                      </div>
                      
                      {/* Quantity Selector (only if in cart) */}
                      {cart[card.id] && (
                        <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 space-x-2">
                          <button 
                            onClick={() => updateCartQuantity(card.id, -1)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{cart[card.id]}</span>
                          <button 
                            onClick={() => updateCartQuantity(card.id, 1)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => toggleCart(card.id)}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                        cart[card.id] 
                          ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{cart[card.id] ? '从购物车移除' : '加入购物车'}</span>
                    </button>
                  </div>
                  
                  {/* Upload Date */}
                  <div className="mt-3 text-[10px] text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDate(card.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Section */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            加载更多卡牌
          </button>
        </div>
      </div>

      {/* Card Detail Drawer */}
      <CardDetailDrawer 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
        card={selectedCard}
        user={user}
        cart={cart}
        favorites={favorites}
        toggleCart={toggleCart}
        updateCartQuantity={updateCartQuantity}
        toggleFavorite={toggleFavorite}
      />
    </div>
  )
}

export default CardGrid