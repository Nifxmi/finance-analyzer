# 💰 FinanceIQ — Personal Finance Analyzer

An AI-powered personal finance dashboard that analyzes your bank transactions and gives you smart, personalized money-saving advice.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge)
![Claude AI](https://img.shields.io/badge/Claude_AI-f97316?style=for-the-badge)

---

## 🚀 Live Demo

> [Click here to try it live](https://finance-analyzerfinanceiq-app.vercel.app) ← *(replace with your Vercel link)*

---

## 📸 Features

- 📂 **Upload your bank CSV** — drag and drop or paste your transaction data
- 📊 **Visual breakdowns** — pie charts and bar charts by spending category
- 🗓️ **Month selector** — filter and compare spending across different months
- 🏷️ **Auto-categorization** — transactions are automatically sorted into Food, Transport, Bills, Entertainment, and more
- 🤖 **AI-powered tips** — uses the Claude AI API to generate personalized, data-driven money advice
- 💡 **Spending insights** — income, expenses, savings summary at a glance

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Recharts | Data visualizations |
| Claude API (Anthropic) | AI-generated financial tips |
| CSS-in-JS | Styling |

---

## 🏃 Getting Started

### Prerequisites
- Node.js installed on your machine
- An Anthropic API key (for AI tips)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/finance-analyzer.git

# Go into the project folder
cd finance-analyzer

# Install dependencies
npm install recharts

# Start the app
npm start
```

---

## 📋 How to Use

1. **Export a CSV** from your bank (most banks support this under "Download Transactions")
2. **Upload the file** or paste the CSV text directly into the app
3. **Browse your dashboard** — view charts, filter by month, and explore your spending
4. **Click "AI Tips"** to get personalized advice generated from your actual data

### CSV Format
Your file should have these three columns:
```
Date,Description,Amount
2024-01-15,Salary,2500.00
2024-01-16,Starbucks,-5.75
2024-01-18,Netflix,-15.99
```
*(Negative amounts = spending, Positive amounts = income)*

---

## 🗺️ Roadmap

- [ ] Connect real bank accounts via Plaid API
- [ ] Monthly spending trend charts
- [ ] Budget goal setting
- [ ] Export reports as PDF
- [ ] User accounts and data persistence

---

## 👨‍💻 About

Built as a portfolio project to demonstrate skills in:
- React component architecture
- Data parsing and visualization
- AI API integration
- UX/UI design

---

## 📄 License

MIT License — feel free to use and build on this project.
