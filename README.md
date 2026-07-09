# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.





# App.jsx

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

export default function App() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-yellow-100">
      <h1 className="text-4xl font-bold text-yellow-800">It works!</h1>
    </div>
  )
}




# formula 
The culprit is handleDrag's correction math. The formula info.delta.x * (1 - 1/scale) was written to subtract a correction, but Framer Motion's drag already applies the delta correctly relative to the element's own coordinate space

The simplest fix: delete handleDrag entirely and remove onDrag={handleDrag}. Framer Motion handles the 1:1 tracking natively when you're not fighting it:




my ui fixes 
- stop having the heart count show up -- DONE -> need an alternative? ask lauren
- change the heart icon
- change shadows to better them
- change drag highlighting everything around it
- add the character limit and format that into the design
- add the ui three dot menu and icons for it 
- makes changes to the secondary color and notes -- DONE
- if i press the three dot menu and it's behind a bunch of notes you can't see the menu 
- doesn't allow for hitting enter or making spaces, i want it to, but count it to character limit