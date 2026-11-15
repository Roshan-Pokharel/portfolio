# Roshan Pokhrel — Portfolio Website

A portfolio website engineered for **Roshan Pokhrel** (Full Stack Developer | Mobile App Developer | UI Designer), styled in the exact minimalist Apple aesthetic of [sujalshrestha2003.com.np](https://sujalshrestha2003.com.np/).

---

## ✨ Features & Architecture

- **Clean Apple Aesthetic**: Precision typography with Inter and JetBrains Mono, clean solid surfaces, and film-grain overlay texture (`.grain`).
- **Seamless Dark/Light Mode**:
  - Automatically matches system preference.
  - Interactive theme toggle with persistent `localStorage` support.
  - Zero FOUC (flash of unstyled content) via inline `<script>` in `<head>`.
- **Interactive Collapsible Accordions**: Smooth chevron rotation and expanding details for Work Experience, Education, and Languages.
- **52-Week GitHub Activity Matrix**:
  - Interactive contribution heatmap grid showing 365 days of activity.
  - Displays exact total of 1,895 contributions in the last year with direct link to GitHub profile.
- **Floating Bottom Dock**:
  - Translucent glassmorphism pill dock with hover lift (`translateY(-2px) scale(1.1)`).
  - Quick shortcuts: Home, Skills, Experience, Projects, Contact, GitHub, and Dark/Light Mode Toggle.
- **Interactive Roshan Chat Bot**:
  - Clickable message box in the Contact section and floating dock button that triggers a sleek popup messaging modal UI.
  - Answers visitor questions about your work at Sawari Saathi, full-stack & mobile tech stack, projects, B.Sc. CSIT education, and direct contact options.
  - **1-Day Local Storage Persistence**: Saves the conversation in `localStorage` for up to 24 hours so returning visitors retain their chat history across page refreshes.
  - Simulated typing indicator, smooth auto-scrolling message stream, and keyboard Escape / backdrop dismissal.
- **Responsive & Mobile-First**: Flawless display on mobile phones (320px+), tablets, laptops, and ultra-wide screens.

---

## 🚀 How to Run Locally

### Option 1: Direct in Browser
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox).

### Option 2: Using Node / npm (Built-in Script)
From the project folder `C:\Projects\portfolio\MyPortfolio`:

```bash
npm start
```
or
```bash
npx serve -l 3000
```
Then visit `http://localhost:3000` in your browser.

---

## 📁 File Structure

```
MyPortfolio/
├── index.html            # Main markup with semantic sections & SEO metadata
├── styles.css            # Custom CSS with exact color tokens, dark mode & layout
├── script.js             # Theme switcher, accordions, GitHub heatmap & chatbot engine
├── chatbot-data.json     # Chatbot Q&A knowledge base (easily edit questions & answers)
├── package.json          # Project configuration & npm scripts
├── README.md             # Documentation
└── assets/
    ├── roshan.jpg        # Developer portrait avatar photo & favicon
    ├── sawari.webp       # Sawari Saathi Pvt. Ltd. company logo
    ├── hubit.png         # Hubit Pvt. Ltd. company logo
    ├── bmc.jpg           # Butwal Multiple Campus academic logo
    ├── kumudini.jpg      # Kumudini College logo
    ├── holycare.png      # Holy Care School logo
    ├── pte.jpg           # PTE Academic English proficiency logo
    ├── nepal.jpg         # Nepali language logo
    ├── car-rental.png    # Car Rental Mobile App preview mockup
    ├── sawari-saathi.png # Sawari Saathi Platform preview mockup
    ├── oztintandwrap.png # Oz Tint & Wrap Website preview showcase
    └── bherirmc.png      # Bheri RMC Web Platform hero preview showcase
```

---

## 🎨 Customizing Your Photos

To replace the SVG mockups or avatar with your actual personal photos or project screenshots:
1. Save your portrait as `assets/roshan.jpg` or `assets/roshan.webp`.
2. In `index.html`, update line 48:
   ```html
   <img src="assets/roshan.jpg" alt="Roshan Pokhrel" class="avatar-img" />
   ```
3. To replace project previews, simply drop your screenshot images into `assets/` and update the `src` attribute in the respective `<article class="project-card">` section.

---

## 💬 Editing Chatbot Questions & Answers

All chatbot questions, keywords, and answers are stored in [`chatbot-data.json`](file:///C:/Projects/portfolio/MyPortfolio/chatbot-data.json).

To add or modify any response:
1. Open [`chatbot-data.json`](file:///C:/Projects/portfolio/MyPortfolio/chatbot-data.json) in your code editor.
2. Edit existing entries or add a new entry under `"qa"`:
   ```json
   {
     "category": "My New Topic",
     "keywords": ["keyword1", "keyword2", "phrase"],
     "answer": "<p>Your custom response HTML here.</p>"
   }
   ```
3. Save the file. When serving the site (`npm start` or deployed on Vercel/GitHub Pages), your changes will load automatically!

---

## 🌐 Deploying Online (Free)

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in this folder and follow the prompts.

### Deploy to GitHub Pages
1. Push this repository to GitHub: `https://github.com/Roshan-Pokharel/portfolio`
2. In GitHub repository settings -> **Pages** -> Select `main` branch -> **Save**.
3. Your site will be live at `https://Roshan-Pokharel.github.io/portfolio`!
