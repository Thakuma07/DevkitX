# 🌐 DevKitX — Essential Tools for Designers & Developers

DevKitX is a modern, high-performance landing page built for showcasing browser extensions designed for UI/UX designers, developers, and creators.

This project has been migrated from a legacy vanilla stack to a professional **Vue.js 3 + Vite + TypeScript + Tailwind CSS + SCSS** architecture, featuring advanced GSAP animations and buttery-smooth scrolling.

---

## 🚀 Live Demo  
*(Add your deployment link here)*

---

## ✨ Features

### 🎨 Modern UI & Bold Typography (Vue 3)
- **Component-Based Architecture**: Built with Vue 3's Composition API.
- **Glassmorphism & High-Contrast Design**: A premium aesthetic using custom HSL colors and deep blacks.
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop using **Tailwind CSS**.
- **SCSS Preprocessing**: Leveraging Sass for nested selectors, variables, and better style organization.
- **Custom Fonts**: Optimized loading for *Lactos* and *Host Grotesk* typography.

### 🌀 Interactive "Teleport" Animation
A sophisticated GSAP-powered icon system in the hero section:
- **Infinite Loop**: Icons shrink, shuffle their positions randomly, and regrow.
- **Scroll Sync**: The continuous loop automatically pauses when the user scrolls down to focus on content.
- **State Restoration**: Animations rewind and resume perfectly when scrolling back to the top.

### ⚡ GSAP-Powered Scroll Effects
- **ScrollTrigger**: Complex parallax and reveal effects as you navigate the page.
- **Dynamic Text Highlighting**: Paragraphs that "light up" words as they enter the viewport.
- **Teleport-to-Text**: Icons that fly from their hero positions into placeholders within the text.

### 🚀 Smooth Scrolling
Integrated with **Lenis** to provide a consistent, premium scrolling experience across all browsers and devices.

---

## 🛠️ Tech Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Static Typing)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Sass/SCSS](https://sass-lang.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)
- **Plugins**: GSAP ScrollTrigger, Vite `@vitejs/plugin-vue`

---

## 📂 Project Structure

```text
nvg8.io/
├── public/                 # Static assets
│   ├── assets/             # Images and icons
│   └── fonts/              # Custom typeface files
├── src/                    # Source code
│   ├── App.vue             # Main Vue component (Composition API)
│   ├── main.ts             # Main entry point (Vue initialization)
│   ├── style.scss          # Tailwind directives & global styles
│   └── env.d.ts            # TypeScript declarations for Vue
├── index.html              # Main HTML template
├── vite.config.ts          # Vite configuration for Vue
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Thakuma07/DevkitX.git
cd nvg8.io
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the **ISC License** - see the `package.json` file for details.

---

Built with ❤️ by [Thakuma07](https://github.com/Thakuma07)
