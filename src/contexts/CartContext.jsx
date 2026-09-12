import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const CartContext = createContext(undefined)
const STORAGE_KEY = 'axkn07_cart'

// A cart line is keyed by product id + chosen color, so the same product picked in two
// different colors shows up as two separate lines instead of merging into one.
function lineKey(productId, color) {
  return `${productId}::${color || ''}`
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can fail (private browsing, quota) — the cart still works for this
      // session, it just won't survive a refresh. Not worth surfacing to the customer.
    }
  }, [items])

  const addToCart = useCallback((product, qty = 1, color = null) => {
    setItems((prev) => {
      const key = lineKey(product.id, color)
      const existing = prev.find((it) => it.key === key)
      if (existing) {
        return prev.map((it) => (it.key === key ? { ...it, qty: it.qty + qty } : it))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image_path: product.image_path || null,
          color: color || null,
          qty,
        },
      ]
    })
  }, [])

  const updateQty = useCallback((key, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((it) => it.key !== key) : prev.map((it) => (it.key === key ? { ...it, qty } : it))
    )
  }, [])

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((it) => it.key !== key))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.qty * it.price, 0), [items])

  const value = { items, addToCart, updateQty, removeItem, clearCart, itemCount, subtotal }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
