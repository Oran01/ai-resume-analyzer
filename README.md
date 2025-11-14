<div align="center">

# 📄 Resumind — AI-Powered Resume Analyzer

Smart, automated resume analysis with ATS scoring, personalized feedback, and job-specific insights — powered by Puter.js and modern React.

</div>

---

<div align="center">

### 🛠 Built With

[![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=for-the-badge&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-000000?style=for-the-badge&logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com/)
[![Puter.js](https://img.shields.io/badge/Puter.js-000000?style=for-the-badge&logo=cloudsmith&logoColor=white)](https://jsm.dev/resumind-puterjs)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 🧠 Overview

**Resumind** is a fully-featured AI web application that analyzes resumes, provides ATS compatibility scoring, and generates detailed improvement tips.

Users can upload a PDF, convert it to an image, run an AI model (Claude on Puter AI), and store feedback securely using Puter’s KV storage and filesystem.

This project is ideal for:

- job seekers who want automated resume feedback
- students learning modern React + TypeScript
- developers exploring **Puter.js**, KV storage, and AI chat integration
- anyone building an AI-first productivity tool

---

## 📸 Demo

![Demo Screenshot](/public/images/Demo.png)

---

## 🌐 Live Demo

[![Live Demo](https://img.shields.io/badge/Visit_Live_Demo-0A66C2?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-resume-analyzer-gold-eight.vercel.app)

---

### 🔍 Highlights

- ✅ ATS score generation
- ✅ AI-powered feedback using Claude on Puter AI
- ✅ PDF → Image automatic conversion
- ✅ Beautiful UI with Tailwind CSS
- ✅ Fully responsive design
- ✅ Resume history stored in Puter KV
- ✅ View detailed categories: Content, Tone, Skills, Structure
- ✅ Custom components like ScoreGauge, ResumeCard, Accordion

---

## ✨ Features

- 🎯 **Smart Resume Analysis**  
  Upload a PDF and get detailed AI analysis using job-specific context.

- 🧩 **ATS Score + Suggestions**  
  Shows how well your resume passes automated tracking systems.

- 📝 **Category-Based Tips**  
  Improvements for Content, Skills, Structure, Tone & Style.

- 📱 **Responsive UI**  
  Works across desktop and mobile.

- 🎨 **Visual Score Components**  
  ScoreGauge, ScoreCircle, ScoreBadge for beautiful UX.

- 🧠 **Puter.js Integration**  
  Authentication, file storage, key-value storage, and AI messaging.

---

## 📦 Project Structure

```bash
📁 src/
├── components/          # UI Components (gauges, cards, details, etc.)
├── lib/                 # Puter store, utils, PDF-to-image converter
├── routes/              # Pages (home, auth, upload, resume, wipe)
├── constants/           # AI instructions for resume analysis
├── app.css              # Global styles
└── root.tsx             # Application layout & router integration

📄 routes.ts             # Route definitions
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Oran01/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open in your browser

```bash
http://localhost:5173
```

---

## ▶️ Tutorial Followed

This project was originally inspired by and built following a YouTube tutorial by [JavaScript Mastery](https://www.youtube.com/@javascriptmastery):

- 📺 [Build an Enterprise Ready AI Powered Applicant Tracking System](https://www.youtube.com/watch?v=iYOz165wGkQ&t=45s)

---

## 🧹 Maintenance Route: `/wipe`

The project includes a development-only route located at:

```
/wipe
```

This page allows developers to:

- View all files stored through Puter’s filesystem
- Delete all stored resumes, images, and KV entries
- Reset the entire application state during development

⚠️ **Important:**  
This route is intended **only for local development and debugging**.  
It should **not** be accessible in production, as it removes all saved data.

---

## 🤝 Contributing

Feel free to fork this repository and submit pull requests to improve the project!

⭐ If you enjoyed this project, please consider giving it a star!
