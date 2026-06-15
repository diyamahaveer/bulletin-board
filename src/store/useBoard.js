import { create } from 'zustand'

// global ui state: tracks which single note's three dot menu is open
// only one menu can be open at a time across the whole board

export const useBoard = create((set) => ({
    openMenuId: null,

    openMenu: (id) => set({ openMenuId: id }),
    closeMenu: () => set({ openMenuId: null}),

    //toggle clicking the same note's ...
    toggleMenu: (id) =>
        set((state) => ({
            openMenuId: state.openMenuId == id ? null : id,
        })),
}))