import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 购物车和收藏状态
  const [cart, setCart] = useState({}) // { cardId: quantity }
  const [favorites, setFavorites] = useState(new Set())

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!error && data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('获取 Profile 失败:', err)
    }
  }

  // 加载购物车数据
  const fetchCart = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('card_id, quantity')
        .eq('user_id', userId)
      
      if (!error && data) {
        const cartObj = {}
        data.forEach(item => {
          cartObj[item.card_id] = item.quantity
        })
        setCart(cartObj)
      }
    } catch (err) {
      console.error('加载购物车失败:', err)
    }
  }

  // 加载收藏夹数据
  const fetchFavorites = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('favorite_items')
        .select('card_id')
        .eq('user_id', userId)
      
      if (!error && data) {
        setFavorites(new Set(data.map(item => item.card_id)))
      }
    } catch (err) {
      console.error('加载收藏夹失败:', err)
    }
  }

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (mounted) {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          if (currentUser) {
            fetchProfile(currentUser.id)
            fetchCart(currentUser.id)
            fetchFavorites(currentUser.id)
          }
        }
      } catch (err) {
        console.error('获取初始会话失败:', err)
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          if (currentUser) {
            await fetchProfile(currentUser.id)
            await fetchCart(currentUser.id)
            await fetchFavorites(currentUser.id)
          } else {
            setProfile(null)
            setCart({})
            setFavorites(new Set())
          }
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 购物车操作
  const toggleCart = async (cardId) => {
    if (!user) return alert('请先登录')
    
    try {
      if (cart[cardId]) {
        // 移除
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('card_id', cardId)
        setCart(prev => {
          const newCart = { ...prev }
          delete newCart[cardId]
          return newCart
        })
      } else {
        // 添加
        await supabase.from('cart_items').insert({ user_id: user.id, card_id: cardId, quantity: 1 })
        setCart(prev => ({ ...prev, [cardId]: 1 }))
      }
    } catch (err) {
      console.error('购物车操作失败:', err)
    }
  }

  const updateCartQuantity = async (cardId, delta) => {
    if (!user) return
    const newQty = (cart[cardId] || 1) + delta
    if (newQty < 1) return

    try {
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('user_id', user.id)
        .eq('card_id', cardId)
      
      setCart(prev => ({ ...prev, [cardId]: newQty }))
    } catch (err) {
      console.error('更新购物车数量失败:', err)
    }
  }

  // 收藏操作
  const toggleFavorite = async (cardId) => {
    if (!user) return alert('请先登录')
    
    try {
      if (favorites.has(cardId)) {
        await supabase.from('favorite_items').delete().eq('user_id', user.id).eq('card_id', cardId)
        setFavorites(prev => {
          const newFavs = new Set(prev)
          newFavs.delete(cardId)
          return newFavs
        })
      } else {
        await supabase.from('favorite_items').insert({ user_id: user.id, card_id: cardId })
        setFavorites(prev => {
          const newFavs = new Set(prev)
          newFavs.add(cardId)
          return newFavs
        })
      }
    } catch (err) {
      console.error('收藏操作失败:', err)
    }
  }

  const signIn = async (identifier, password) => {
    try {
      let email = identifier
      if (!identifier.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single()

        if (profileError || !profileData) {
          throw new Error('找不到该用户名对应的账户')
        }
        email = profileData.email
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      return { error: err }
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (!error && data?.user && userData.username) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: userData.username,
          email: email
        })
      }
      return { data, error }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    profile,
    cart,
    favorites,
    toggleCart,
    updateCartQuantity,
    toggleFavorite,
    signIn,
    signUp,
    signOut,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
