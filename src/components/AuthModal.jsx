import React, { useState } from 'react'
import { X, Loader } from 'lucide-react' // 修复：确保导入了 Loader
import { useAuth } from '../contexts/AuthContext'

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [identifier, setIdentifier] = useState('') // 邮箱或用户名
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('') // 仅注册时使用
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'login') {
        // 支持邮箱或用户名登录
        const { error } = await signIn(identifier, password)
        if (error) throw error
        onClose()
      } else {
        const { error } = await signUp(email, password, { username })
        if (error) throw error
        setMessage('注册成功！请检查您的邮箱确认账户。')
        setTimeout(() => onClose(), 2000)
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? '欢迎回来' : '创建账户'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'login' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                邮箱或用户名
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="请输入邮箱或用户名"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="展示名称"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  电子邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium animate-pulse ${
              message.includes('成功') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-lg font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                请求中...
              </span>
            ) : (mode === 'login' ? '立即登录' : '注册新账户')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-gray-500">
              还没有账户？{' '}
              <button
                onClick={() => window.location.href = '#注册'}
                className="text-blue-600 font-bold hover:underline"
              >
                免费注册
              </button>
            </p>
          ) : (
            <p className="text-gray-500">
              已经有账户了？{' '}
              <button
                onClick={() => window.location.href = '#登录'}
                className="text-blue-600 font-bold hover:underline"
              >
                点此登录
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal