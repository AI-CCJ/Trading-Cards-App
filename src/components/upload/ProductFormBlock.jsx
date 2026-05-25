import React from 'react';
import { X, Tag, Calendar, DollarSign, User, Info, ImageIcon, Eye, EyeOff } from 'lucide-react';

const ProductFormBlock = ({ index, product, onUpdate, onRemove }) => {
  const updateField = (field, value) => {
    onUpdate(product.id, field, value);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group">
      {/* Remove Product Button */}
      <button
        onClick={() => onRemove(product.id)}
        className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
        title="移除此产品"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images Preview (1-4 images) */}
        <div className="w-full lg:w-48 space-y-3">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border dark:border-slate-700">
            <img 
              src={product.images[0].url} 
              className="w-full h-full object-cover" 
              alt="主图" 
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              主图
            </div>
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(1).map((img, idx) => (
                <div key={img.id} className="aspect-square rounded-lg overflow-hidden border dark:border-slate-700">
                  <img src={img.url} className="w-full h-full object-cover" alt={`细节图 ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-center text-gray-400 font-medium">已绑定 {product.images.length} 张图片</p>
        </div>

        {/* Form Fields */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-xs font-bold text-gray-400 uppercase">第 {index + 1} 个产品：人物/名称 *</label>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">{product.is_public !== false ? '公开展示' : '仅自己可见'}</span>
                <button
                  onClick={() => updateField('is_public', product.is_public === false)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.is_public !== false ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.is_public !== false ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={product.character}
                onChange={(e) => updateField('character', e.target.value)}
                placeholder="例如：皮卡丘 25周年限定"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">所属种类 *</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={product.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="宝可梦 / 游戏王"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">发行年份 *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={product.year}
                onChange={(e) => updateField('year', e.target.value)}
                placeholder="2024"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">当前单价 *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={product.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="999.00"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">产品备注信息</label>
            <textarea
              value={product.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="请描述产品的品相、版本或特殊说明..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all text-sm outline-none min-h-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormBlock;
