import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WardrobeItem {
  id: string            // product id
  variantId?: string    // the exact size/color row
  name: string
  price: number
  image: string
  attributes?: string   // "S · Ivory" or "Custom size"
  customNotes?: string
  quantity: number
}

export const wardrobeLineKey = (item: Pick<WardrobeItem, 'id' | 'variantId'>) =>
  item.variantId ?? item.id

interface WardrobeState {
  items: WardrobeItem[]
  addItem: (item: Omit<WardrobeItem, 'quantity'>) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearWardrobe: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const key = wardrobeLineKey(newItem)
        const existing = get().items.find((i) => wardrobeLineKey(i) === key)
        if (existing) {
          set({
            items: get().items.map((i) =>
              wardrobeLineKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...get().items, { ...newItem, quantity: 1 }] })
        }
      },
      removeItem: (key) => set({ items: get().items.filter((i) => wardrobeLineKey(i) !== key) }),
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key)
        } else {
          set({
            items: get().items.map((i) =>
              wardrobeLineKey(i) === key ? { ...i, quantity } : i
            ),
          })
        }
      },
      clearWardrobe: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    { name: 'somnienne-wardrobe' }
  )
)