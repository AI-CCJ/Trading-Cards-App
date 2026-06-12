import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, Clock, Image as ImageIcon, Tag, Loader, Edit2, Trash2, Heart, ShoppingCart, Plus, Minus, X, Maximize2, EyeOff, Eye, Save } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import CardDetailDrawer from './CardDetailDrawer'
import ProductFormBlock from './upload/ProductFormBlock'

const CardGrid = ({ filterIds = null, mode = 'all' }) => {
  const [sortBy, setSortBy] = useState('created_at')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCardIds, setSelectedCardIds] = useState(new Set()) // 批量选择的 ID
  const [editingCard, setEditingCard] = useState(null) // 正在编辑的卡牌
  const [isSaving, setIsSaving] = useState(false)
  const { user, profile, cart, favorites, toggleCart, updateCartQuantity, toggleFavorite } = useAuth()

  // 判定是否为管理员
  const isAdmin = profile?.role === 'admin' || user?.email === 'admin@gmail.com';

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

  // 删除卡牌逻辑 (单张或批量)
  const handleDeleteCards = async (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids]
    if (idArray.length === 0) return
    
    const confirmMsg = idArray.length === 1 
      ? '确定要删除这张卡牌吗？此操作不可撤销。' 
      : `确定要删除选中的 ${idArray.length} 张卡牌吗？此操作不可撤销。`
    
    if (!window.confirm(confirmMsg)) return

    try {
      setLoading(true)
      
      console.log('执行删除, IDs:', idArray);
      
      // 逐条执行删除，以便精准捕获每一条的反馈
      let successCount = 0;
      let failCount = 0;

      for (const id of idArray) {
        // 使用 select() 配合 delete 可以返回受影响的数据，用来判断是否真的删除了
        const { data, error, status } = await supabase
          .from('cards')
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          console.error(`ID ${id} 删除失败:`, error);
          failCount++;
        } else if (data && data.length > 0) {
          successCount++;
        } else {
          // data 为空说明没有行被删除，通常是 RLS 策略拒绝了（即你不是该产品的拥有者）
          console.warn(`ID ${id} 删除未生效 (受影响行数为0)，请检查数据库权限或拥有者身份`);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`成功删除 ${successCount} 个产品。${failCount > 0 ? `另外 ${failCount} 个删除失败（可能是权限不足）。` : ''}`);
      } else {
        alert('删除失败：数据库未响应删除动作。这通常是因为您的账户没有该产品的删除权限（RLS策略拦截）。请检查下方的 SQL 设置指南。');
      }

      setSelectedCardIds(new Set()) // 清空选择
      await fetchCards(sortBy) // 强制刷新列表
    } catch (err) {
      console.error('删除过程发生异常:', err)
      alert(`删除异常: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 处理勾选
  const toggleSelectCard = (id) => {
    setSelectedCardIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedCardIds.size === cards.length) {
      setSelectedCardIds(new Set())
    } else {
      setSelectedCardIds(new Set(cards.map(c => c.id)))
    }
  }

  // 页面加载或状态改变时获取数据
  useEffect(() => {
    // 只有在非加载状态下或 Auth 已初始化时才执行
    fetchCards(sortBy)
  }, [sortBy, user?.id, profile?.role, filterIds, mode])

  // 修改卡牌逻辑
  const handleUpdateCard = async () => {
    if (!editingCard) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('cards')
        .update({
          character: editingCard.character,
          category: editingCard.category,
          year: parseInt(editingCard.year) || 0,
          price: parseFloat(editingCard.price.toString().replace(/[^\d.]/g, '')) || 0,
          notes: editingCard.notes,
          is_public: editingCard.is_public !== false
        })
        .eq('id', editingCard.id)

      if (error) throw error

      alert('修改成功！')
      setEditingCard(null)
      fetchCards(sortBy)
    } catch (err) {
      console.error('修改卡牌失败:', err)
      alert(`修改失败: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

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
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">排序方式：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
              >
                <option value="created_at">按上传时间</option>
                <option value="year">按年份</option>
                <option value="price_asc">价格：由低到高</option>
                <option value="price_desc">价格：由高到低</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              {/* 批量操作按钮 */}
              {cards.length > 0 && (user || isAdmin) && (
                <div className="flex items-center space-x-2 border-r dark:border-slate-800 pr-3 mr-1">
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {selectedCardIds.size === cards.length ? '取消全选' : '全选'}
                  </button>
                  {selectedCardIds.size > 0 && (
                    <button
                      onClick={() => handleDeleteCards(Array.from(selectedCardIds))}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>删除所选 ({selectedCardIds.size})</span>
                    </button>
                  )}
                </div>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                共 {cards.length} 张卡牌
              </span>
            </div>
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
              <div 
                key={card.id} 
                className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all flex flex-col h-full relative ${
                  selectedCardIds.has(card.id) ? 'ring-2 ring-blue-500 border-transparent shadow-lg' : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                {/* Selection Checkbox */}
                {(user || isAdmin) && (
                  <div className="absolute top-2 left-2 z-20">
                    <input 
                      type="checkbox"
                      checked={selectedCardIds.has(card.id)}
                      onChange={() => toggleSelectCard(card.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                    />
                  </div>
                )}

                {/* Auth Check: Only owner can edit/delete */}
                {(isAdmin || (user && user.id === card.user_id)) && (
                  <div className={`absolute top-2 left-8 z-10 flex space-x-2 transition-opacity ${selectedCardIds.size > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // 准备编辑数据，确保 images 格式符合 ProductFormBlock 预期
                        setEditingCard({
                          ...card,
                          images: [{ id: 'main', url: card.image_url }]
                        });
                      }}
                      className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-900/30"
                      title="编辑卡牌"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCards(card.id);
                      }}
                      className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors border border-red-100 dark:border-red-900/30"
                      title="删除卡牌"
                    >
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

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">修改产品信息</h3>
              <button 
                onClick={() => setEditingCard(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ProductFormBlock 
                index={0}
                product={editingCard}
                onUpdate={(id, field, value) => setEditingCard(prev => ({ ...prev, [field]: value }))}
                onRemove={() => setEditingCard(null)}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t dark:border-slate-800 flex justify-end space-x-4">
              <button
                onClick={() => setEditingCard(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleUpdateCard}
                disabled={isSaving}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center space-x-2"
              >
                {isSaving ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                <span>{isSaving ? '正在保存...' : '保存修改'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardGrid