import React, { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Save, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const UploadSection = () => {
  const [uploadedImages, setUploadedImages] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const updateImageInfo = (id, field, value) => {
    setUploadedImages(prev => 
      prev.map(img => img.id === id ? { ...img, [field]: value } : img)
    )
  }

  // 上传图片到 Supabase Storage
  const uploadImageToStorage = async (file, id) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('card-images')
      .upload(fileName, file)
    
    if (error) throw error
    return data
  }

  // 获取图片公开 URL
  const getImagePublicUrl = (path) => {
    const { data } = supabase.storage
      .from('card-images')
      .getPublicUrl(path)
    return data.publicUrl
  }

  // 保存卡片数据到数据库
  const saveCardsToDatabase = async () => {
    if (!user) {
      alert('请先登录再上传卡牌')
      return
    }

    if (uploadedImages.length === 0) {
      alert('请先上传图片')
      return
    }

    // 验证所有必填字段
    const invalidImages = uploadedImages.filter(img => !img.type || !img.year || !img.character || !img.price || !img.file)
    if (invalidImages.length > 0) {
      alert('请填写所有必填字段（种类、年份、人物、价钱）')
      return
    }

    // 检查用户是否登录
    if (!user) {
      alert('请先登录再上传卡牌')
      return
    }

    setIsSaving(true)

    try {
      console.log('开始批量上传流程...', { count: uploadedImages.length, userId: user.id });
      
      // 1. 并行上传所有图片到 Storage 并获取 Public URL
      const uploadPromises = uploadedImages.map(async (image) => {
        console.log(`正在上传图片 [${image.id}] 到 Storage...`);
        const uploadData = await uploadImageToStorage(image.file, image.id);
        console.log(`图片 [${image.id}] 上传成功:`, uploadData);
        
        const imageUrl = getImagePublicUrl(uploadData.path);
        console.log(`图片 [${image.id}] 公开 URL:`, imageUrl);
        
        return { ...image, imageUrl };
      })

      const imagesWithUrls = await Promise.all(uploadPromises);
      console.log('所有图片 Storage 上传完成，准备写入数据库...');

      // 2. 批量插入数据到 PostgreSQL
      const cardsToInsert = imagesWithUrls.map(image => ({
        user_id: user.id, // 核心：确保键名是 user_id
        image_url: image.imageUrl,
        year: parseInt(image.year) || 0,
        price: parseFloat(image.price.replace(/[^\d.]/g, '')) || 0,
        category: image.type,
        notes: image.notes || '',
        character: image.character // 新增的 character 字段
      }))

      console.log('准备插入的数据内容 (已移除 title 字段):', cardsToInsert);

      const { data, error } = await supabase
        .from('cards')
        .insert(cardsToInsert)
        .select()

      if (error) {
        console.error('数据库插入阶段出错:', error);
        throw error;
      }

      console.log('数据库写入成功:', data);
      alert('卡牌批量上传成功！');
      setUploadedImages([]) // 清空上传列表
    } catch (error) {
      console.error('上传完整流程捕获到错误:', error);
      alert(`上传失败: ${error.message}`);
    } finally {
      setIsSaving(false)
    }
  }

  // 修改 handleDrop 和 handleFileSelect 函数，保留文件对象
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          type: '',
          year: '',
          character: '',
          price: '',
          notes: ''
        }])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          type: '',
          year: '',
          character: '',
          price: '',
          notes: ''
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">上传卡牌</h2>
          
          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-gray-600 mb-2">
                <span className="font-medium">点击上传</span> 或拖拽图片到此处
              </div>
              <p className="text-sm text-gray-500 mb-4">
                支持 PNG, JPG, GIF 格式，单张图片最大 10MB
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                选择文件
              </label>
            </div>
          </div>

          {/* Preview Section */}
          {uploadedImages.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">上传预览</h3>
                <button
                  onClick={saveCardsToDatabase}
                  disabled={isSaving || !user}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存所有卡牌 ({uploadedImages.length})
                    </>
                  )}
                </button>
              </div>
              
              {!user && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                  请先登录才能保存卡牌
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="bg-gray-50 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={image.url}
                          alt="预览"
                          className="h-20 w-20 object-cover rounded border"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="种类 *"
                          value={image.type}
                          onChange={(e) => updateImageInfo(image.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="年份 *"
                          value={image.year}
                          onChange={(e) => updateImageInfo(image.id, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="人物 *"
                          value={image.character}
                          onChange={(e) => updateImageInfo(image.id, 'character', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="价钱 *"
                          value={image.price}
                          onChange={(e) => updateImageInfo(image.id, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="备注"
                          value={image.notes}
                          onChange={(e) => updateImageInfo(image.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadSection