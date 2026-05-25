import React, { useState, useEffect } from 'react';
import { X, User, Tag, Calendar, DollarSign, Info, Maximize2, ShoppingCart, Heart, Minus, Plus, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const CardDetailDrawer = ({ isOpen, onClose, card, user, cart, favorites, toggleCart, updateCartQuantity, toggleFavorite }) => {
  const [holderName, setHolderName] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (card) {
      if (card.user_id) {
        setHolderName('加载中...');
        const fetchHolder = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', card.user_id)
              .single();
            
            if (!error && data) {
              setHolderName(data.username);
            } else {
              setHolderName('系统用户');
            }
          } catch (err) {
            console.error('获取持有者信息失败:', err);
            setHolderName('未知');
          }
        };
        fetchHolder();
      } else {
        setHolderName('系统用户');
      }
    }
  }, [card]);

  if (!card) return null;

  const formatPrice = (price) => `¥${price.toLocaleString('zh-CN')}`;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white dark:bg-slate-900 z-[110] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
          <div className="flex-1 flex items-center space-x-2 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{card.character}</h2>
            {card.is_public === false && (
              <span className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center">
                <EyeOff className="h-3 w-3 mr-1" />
                仅自己可见
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Image Section with Zoom */}
          <div className="relative bg-gray-100 dark:bg-slate-800 group overflow-hidden">
            <div 
              className={`relative cursor-zoom-in transition-transform duration-300 ${isZoomed ? 'scale-150 z-10' : 'scale-100'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img 
                src={card.image_url} 
                alt={card.character}
                className="w-full h-auto object-contain max-h-[400px]"
              />
            </div>
            {!isZoomed && (
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center space-x-2 text-xs">
                <Maximize2 className="h-4 w-4" />
                <span>点击缩放细节</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            {/* Holder */}
            <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">持有者</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{holderName}</p>
              </div>
            </div>

            {/* Attributes Grid */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-5 bg-blue-600 rounded-full" />
                <h3 className="font-bold text-gray-900 dark:text-white">产品参数</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <AttributeBox icon={Tag} label="所属种类" value={card.category || '未分类'} />
                <AttributeBox icon={Calendar} label="发行年份" value={card.year ? `${card.year}年` : '未知'} />
                <AttributeBox icon={DollarSign} label="当前单价" value={formatPrice(card.price || 0)} highlight />
                <AttributeBox icon={Info} label="产品编号" value={`#${card.id.toString().slice(-6).toUpperCase()}`} />
              </div>
            </section>

            {/* Description */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-5 bg-blue-600 rounded-full" />
                <h3 className="font-bold text-gray-900 dark:text-white">产品描述</h3>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800 leading-relaxed text-gray-600 dark:text-gray-400 text-sm">
                {card.notes || '该上传者暂未提供详细的产品备注信息。'}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex items-center space-x-4">
          <button 
            onClick={() => toggleFavorite(card.id)}
            className={`p-3 rounded-xl border transition-all ${
              favorites.has(card.id) 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/30' 
                : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-200 dark:border-slate-700 hover:text-red-400'
            }`}
          >
            <Heart className={`h-6 w-6 ${favorites.has(card.id) ? 'fill-current' : ''}`} />
          </button>

          <div className="flex-1 flex items-center space-x-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            {cart[card.id] ? (
              <>
                <div className="flex items-center space-x-4 px-2">
                  <button onClick={() => updateCartQuantity(card.id, -1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-gray-900 dark:text-white w-4 text-center">{cart[card.id]}</span>
                  <button onClick={() => updateCartQuantity(card.id, 1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={() => toggleCart(card.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                >
                  移出购物车
                </button>
              </>
            ) : (
              <button 
                onClick={() => toggleCart(card.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>加入购物车</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const AttributeBox = ({ icon: Icon, label, value, highlight }) => (
  <div className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
    <div className="flex items-center space-x-2 mb-2 text-gray-400">
      <Icon className="h-4 w-4" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className={`font-bold truncate ${highlight ? 'text-green-600 text-lg' : 'text-gray-900 dark:text-gray-200 text-sm'}`}>
      {value}
    </p>
  </div>
);

export default CardDetailDrawer;
