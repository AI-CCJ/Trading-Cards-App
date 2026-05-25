import React, { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Save, Loader, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import ImagePool from './upload/ImagePool'
import ProductFormBlock from './upload/ProductFormBlock'

const UploadSection = () => {
  // 1. 暂存区图片池
  const [pool, setPool] = useState([])
  // 2. 已组合的产品列表
  const [products, setProducts] = useState([])
  // 3. 当前选中的图片 ID (用于组合产品)
  const [selectedIds, setSelectedIds] = useState([])
  
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()

  // 校验规则
  const MAX_PRODUCTS = 10
  const MAX_IMAGES_PER_PRODUCT = 4
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  // 图片压缩逻辑
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 2500;
          const MAX_HEIGHT = 2500;
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            } else {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.8;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length * 0.75 > MAX_FILE_SIZE && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          const arr = dataUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          resolve(new File([u8arr], file.name, { type: mime }));
        };
      };
    });
  };

  // 文件进入池子
  const handleFiles = async (files) => {
    setIsProcessing(true)
    const newPoolItems = []
    
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`文件【${file.name}】格式不支持`);
        continue
      }
      
      let finalFile = file
      if (file.size > MAX_FILE_SIZE) {
        finalFile = await compressImage(file)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPool(prev => [...prev, {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: e.target.result,
          file: finalFile
        }])
      }
      reader.readAsDataURL(finalFile)
    }
    setIsProcessing(false)
  }

  // 交互：组合产品
  const createProductFromSelection = () => {
    if (products.length >= MAX_PRODUCTS) {
      alert(`单次批量上传最多支持 ${MAX_PRODUCTS} 个产品，已达上限`);
      return
    }
    if (selectedIds.length === 0 || selectedIds.length > 4) {
      alert('每个产品必须包含 1-4 张图片');
      return
    }

    const selectedImages = pool.filter(img => selectedIds.includes(img.id))
    const newProduct = {
      id: `prod_${Date.now()}`,
      images: selectedImages,
      character: '',
      category: '',
      year: '',
      price: '',
      notes: '',
      is_public: true // 默认公开
    }

    setProducts(prev => [...prev, newProduct])
    setPool(prev => prev.filter(img => !selectedIds.includes(img.id)))
    setSelectedIds([])
  }

  const removeProduct = (prodId) => {
    const prod = products.find(p => p.id === prodId)
    if (prod) {
      setPool(prev => [...prev, ...prod.images]) // 图片退回池子
      setProducts(prev => prev.filter(p => p.id !== prodId))
    }
  }

  const updateProductInfo = (prodId, field, value) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, [field]: value } : p))
  }

  // 提交逻辑
  const submitAllProducts = async () => {
    if (!user) return alert('请先登录')
    if (products.length === 0) return alert('请先组合至少一个产品')
    
    // 校验必填
    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      if (!p.character || !p.category || !p.year || !p.price) {
        alert(`请先完善第 ${i + 1} 个产品的详细信息`);
        return
      }
    }

    setIsSaving(true)
    try {
      const uploadPromises = products.map(async (product) => {
        // 1. 上传该产品的所有图片
        const imageUrls = await Promise.all(product.images.map(async (img) => {
          const fileExt = img.file.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2)}.${fileExt}`
          const { data, error } = await supabase.storage.from('card-images').upload(fileName, img.file)
          if (error) throw error
          const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(data.path)
          return publicUrl
        }))

        // 2. 返回该产品的数据库对象
        return {
          user_id: user.id,
          image_url: imageUrls[0], // 主图
          additional_images: imageUrls.slice(1), // 细节图数组
          character: product.character,
          category: product.category,
          year: parseInt(product.year) || 0,
          price: parseFloat(product.price.replace(/[^\d.]/g, '')) || 0,
          notes: product.notes,
          is_public: product.is_public !== false // 明确布尔值
        }
      })

      const cardsToInsert = await Promise.all(uploadPromises)
      const { error } = await supabase.from('cards').insert(cardsToInsert)
      
      if (error) throw error
      
      alert('批量发布成功！')
      setProducts([])
      setPool([])
    } catch (err) {
      alert(`提交失败: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-10 px-4">
      {/* 顶部标题与规则 */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">发布我的藏品</h2>
        <div className="inline-flex items-center space-x-4 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-900/20">
          <Info className="h-4 w-4 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">
            单次最多上传 <span className="font-bold underline">10</span> 个产品 | 每个产品支持 <span className="font-bold underline">1-4</span> 张展示图
          </p>
        </div>
      </div>

      {/* 第一阶段：文件选择与池子 */}
      <section className="space-y-6">
        <div
          className={`border-3 border-dashed rounded-3xl p-10 transition-all duration-300 group ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.99]' 
              : 'border-gray-200 dark:border-slate-800 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-900/50'
          }`}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">拖拽多张图片到此处</h4>
            <p className="text-gray-400 text-sm mb-6">支持 JPG, PNG, WEBP (自动压缩 5MB 以上大图)</p>
            
            <input
              type="file" multiple accept="image/*" className="hidden" id="multi-file-upload"
              onChange={(e) => handleFiles(Array.from(e.target.files))}
            />
            <label
              htmlFor="multi-file-upload"
              className={`px-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-2xl text-gray-700 dark:text-gray-300 font-bold hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer inline-flex items-center space-x-2 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isProcessing ? <Loader className="animate-spin h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
              <span>{isProcessing ? '图片优化中...' : '从本地选择'}</span>
            </label>
          </div>
        </div>

        {/* 图片池 */}
        <ImagePool 
          pool={pool} 
          selectedIds={selectedIds} 
          onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          onCreateProduct={createProductFromSelection}
          onRemoveFromPool={(id) => setPool(prev => prev.filter(img => img.id !== id))}
        />
      </section>

      {/* 第二阶段：产品表单 */}
      {products.length > 0 && (
        <section className="space-y-6 pt-10 border-t dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">产品详情填写 ({products.length}/{MAX_PRODUCTS})</h3>
            <button
              onClick={submitAllProducts}
              disabled={isSaving || !user}
              className="px-10 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-green-100 dark:shadow-none flex items-center space-x-3"
            >
              {isSaving ? <Loader className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />}
              <span>{isSaving ? '正在发布...' : '确认并批量发布'}</span>
            </button>
          </div>

          <div className="space-y-6">
            {products.map((prod, idx) => (
              <ProductFormBlock 
                key={prod.id} 
                index={idx} 
                product={prod} 
                onUpdate={updateProductInfo} 
                onRemove={removeProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default UploadSection
