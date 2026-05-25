import React from 'react';
import { X, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';

const ImagePool = ({ pool, selectedIds, onToggleSelect, onCreateProduct, onRemoveFromPool }) => {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
            图片暂存区
          </h3>
          <p className="text-xs text-gray-500 mt-1">点击选择 1-4 张图片，然后点击右侧按钮组合成一个产品</p>
        </div>
        
        <button
          onClick={onCreateProduct}
          disabled={selectedIds.length === 0 || selectedIds.length > 4}
          className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 dark:shadow-none"
        >
          <Plus className="h-5 w-5" />
          <span>创建产品 ({selectedIds.length}/4)</span>
        </button>
      </div>

      {pool.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
          <p className="text-gray-400 text-sm">暂无待分配图片，请先从上方选择文件</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {pool.map((img) => (
            <div 
              key={img.id}
              onClick={() => onToggleSelect(img.id)}
              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                selectedIds.includes(img.id) 
                  ? 'border-blue-600 ring-4 ring-blue-50' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={img.url} className="w-full h-full object-cover" alt="pool" />
              
              {/* Selection Overlay */}
              {selectedIds.includes(img.id) && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <CheckCircle2 className="text-white h-8 w-8 drop-shadow-md" />
                </div>
              )}

              {/* Remove from Pool */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromPool(img.id);
                }}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagePool;
