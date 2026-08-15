import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WardrobeItem {
  id: string           // The product ID
  variantId?: string   // For sizes/colors later
  name: string
  price: number
  image: string
  quantity: number
}

interface WardrobeState {
  items: WardrobeItem[]
  addItem: (item: Omit<WardrobeItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearWardrobe: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existing = get().items.find((item) => item.id === newItem.id)
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          })
        } else {
          set({ items: [...get().items, { ...newItem, quantity: 1 }] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
          })
        }
      },
      clearWardrobe: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'somnienne-wardrobe', // This is the key in localStorage
    }
  )
)