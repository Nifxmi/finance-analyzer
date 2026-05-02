import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#ef4444"];

const SAMPLE_CSV = `Date,Description,Amount
2024-01-03,Starbucks,-5.75
2024-01-05,Netflix,-15.99
2024-01-07,Whole Foods,-82.40
2024-01-09,Uber,-12.30
2024-01-10,Spotify,-9.99
2024-01-12,Amazon,-45.00
2024-01-14,Shell Gas,-60.00
2024-01-15,Salary,2500.00
2024-01-16,Chipotle,-13.50
2024-01-18,Gym Membership,-40.00
2024-01-19,Starbucks,-6.25
2024-01-20,Target,-95.00
2024-01-22,Uber Eats,-28.00
2024-01-24,Electric Bill,-110.00
2024-01-25,Rent,-1200.00
2024-01-26,Trader Joes,-67.00
2024-01-28,Hulu,-17.99
2024-01-29,Lyft,-9.50
2024-01-30,Dinner Out,-55.00
2024-02-02,Starbucks,-6.00
2024-02-04,Amazon,-120.00
2024-02-06,Whole Foods,-74.20
2024-02-10,Netflix,-15.99
2024-02-14,Valentines Dinner,-89.00
2024-02-15,Salary,2500.00
2024-02-18,Shell Gas,-55.00
2024-02-20,Target,-43.00
2024-02-22,Spotify,-9.99
2024-02-24,Electric Bill,-98.00
2024-02-25,Rent,-1200.00
2024-02-27,Gym Membership,-40.00
2024-03-01,Uber,-18.00
2024-03-03,Starbucks,-7.50
2024-03-07,Amazon,-60.00
2024-03-10,Whole Foods,-91.00
2024-03-15,Salary,2500.00
2024-03-16,Netflix,-15.99
2024-03-18,Shell Gas,-70.00
2024-03-20,Chipotle,-14.00
2024-03-22,Gym Membership,-40.00
2024-03-24,Electric Bill,-105.00
2024-03-25,Rent,-1200.00
2024-03-28,Hulu,-17.99
2024-03-29,Spotify,-9.99`;

const CATEGORIES = {
  Food: ["starbucks", "chipotle", "whole foods", "trader joe", "mcdonald", "subway", "pizza", "burger", "sushi", "dinner", "lunch", "breakfast", "cafe", "restaurant", "panera", "uber eats"],
  Transport: ["uber", "lyft", "shell", "gas", "parking", "transit", "bart", "metro"],
  Entertainment: ["netflix", "spotify", "hulu", "disney", "movie", "concert", "gaming", "steam"],
  Shopping: ["amazon", "target", "walmart", "costco", "ebay", "etsy"],
  Bills: ["rent", "electric", "water", "internet", "phone", "insurance", "bill"],
  Health: ["gym", "pharmacy", "doctor", "hospital", "cvs", "walgreens", "fitness"],
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function categorize(description) {
  const lower = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return "Other";
}

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const transactions = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 3) continue;
    const date = parts[0].trim();
    const description = parts[1].trim();
    const amount = parseFloat(parts[2]);
    if (isNaN(amount)) continue;
    transactions.push({ date, description, amount, category: amount > 0 ? "Income" : categorize(description) });
  }
  return transactions;
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthKey(key) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function InsightCard({ emoji, title, value, sub, color }) {
  return (
    <div style={{
      background: "#111827", border: `1px solid ${color}33`, borderRadius: 16,
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: 6,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "16px 16px 0 0" }} />
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      <div style={{ color: "#f9fafb", fontSize: 24, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{value}</div>
      {sub && <div style={{ color: "#6b7280", fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export default function FinanceAnalyzer() {
  const [csv, setCsv] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [aiTips, setAiTips] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const analyze = (data) => {
    const parsed = parseCSV(data);
    setAllTransactions(parsed);
    setAnalyzed(parsed.length > 0);
    setAiTips([]);
    setSelectedMonth("all");
  };

  const loadSample = () => { setCsv(SAMPLE_CSV); analyze(SAMPLE_CSV); };

  // Get unique months from all transactions
  const availableMonths = useMemo(() => {
    const keys = [...new Set(allTransactions.map(t => getMonthKey(t.date)).filter(Boolean))].sort();
    return keys;
  }, [allTransactions]);

  // Filter transactions by selected month
  const transactions = useMemo(() => {
    if (selectedMonth === "all") return allTransactions;
    return allTransactions.filter(t => getMonthKey(t.date) === selectedMonth);
  }, [allTransactions, selectedMonth]);

  const { income, expenses, savings, byCategory, topSpend, categoryData } = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const savings = income - expenses;
    const byCategory = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
    });
    const categoryData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
    const topSpend = categoryData[0];
    return { income, expenses, savings, byCategory, topSpend, categoryData };
  }, [transactions]);

  // Handle real CSV file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsv(text);
      analyze(text);
    };
    reader.readAsText(file);
  };

  // Call Anthropic API for AI tips
  const getAiTips = async () => {
    setAiLoading(true);
    setAiError("");
    setAiTips([]);

    const summary = {
      period: selectedMonth === "all" ? "All time" : formatMonthKey(selectedMonth),
      income: income.toFixed(2),
      expenses: expenses.toFixed(2),
      savings: savings.toFixed(2),
      categories: categoryData.map(c => `${c.name}: $${c.value}`).join(", "),
      topTransactions: transactions
        .filter(t => t.amount < 0)
        .sort((a, b) => a.amount - b.amount)
        .slice(0, 5)
        .map(t => `${t.description}: $${Math.abs(t.amount)}`)
        .join(", ")
    };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a friendly personal finance advisor. Analyze spending data and return ONLY a JSON array of 4-5 actionable tips. No preamble, no markdown, just raw JSON like: ["tip1", "tip2", "tip3"]. Each tip should be 1-2 sentences, specific to the actual numbers, and start with a relevant emoji.`,
          messages: [{
            role: "user",
            content: `Here is my spending summary:
Period: ${summary.period}
Income: $${summary.income}
Total Expenses: $${summary.expenses}
Savings: $${summary.savings}
Spending by category: ${summary.categories}
Top transactions: ${summary.topTransactions}

Give me 4-5 specific, actionable money-saving tips based on this data.`
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const tips = JSON.parse(clean);
      setAiTips(Array.isArray(tips) ? tips : []);
    } catch (err) {
      setAiError("Couldn't load AI tips. Check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const btnStyle = (active) => ({
    padding: "10px 20px",
    color: active ? "#f97316" : "#6b7280",
    borderBottom: active ? "2px solid #f97316" : "2px solid transparent",
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    textTransform: "capitalize",
    marginBottom: -1,
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #f97316" : "2px solid transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "color 0.2s"
  });

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "#f9fafb", fontFamily: "'DM Sans', sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111827; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        textarea { resize: vertical; }
        select { appearance: none; }
        input[type="file"] { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1f2937", padding: "20px 40px", display: "flex", alignItems: "center", gap: 14, background: "#030712", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 26 }}>💰</div>
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 17, fontWeight: 700, color: "#f97316" }}>FinanceIQ</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Personal Spending Analyzer</div>
        </div>
        {analyzed && (
          <button onClick={() => { setAnalyzed(false); setCsv(""); setAllTransactions([]); setAiTips([]); }}
            style={{ marginLeft: "auto", background: "none", border: "1px solid #374151", color: "#6b7280", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            ← New Data
          </button>
        )}
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px" }}>

        {!analyzed ? (
          /* ── Upload Screen ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 34, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                Understand your <span style={{ color: "#f97316" }}>money</span>.
              </h1>
              <p style={{ color: "#9ca3af", marginTop: 10, fontSize: 15 }}>Upload your bank CSV or paste data below to get instant insights.</p>
            </div>

            {/* Upload Box */}
            <label htmlFor="csv-upload" style={{
              width: "100%", maxWidth: 600, border: "2px dashed #374151", borderRadius: 14,
              padding: "28px 24px", textAlign: "center", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transition: "border-color 0.2s", background: "#0f172a"
            }}>
              <input id="csv-upload" type="file" accept=".csv,.txt" onChange={handleFileUpload} />
              <div style={{ fontSize: 32 }}>📂</div>
              <div style={{ color: "#f9fafb", fontWeight: 500 }}>Upload your bank CSV</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Export from your bank → Download as CSV → Upload here</div>
              <div style={{ marginTop: 4, background: "#1f2937", color: "#9ca3af", borderRadius: 8, padding: "6px 16px", fontSize: 13 }}>Choose File</div>
            </label>

            <div style={{ color: "#4b5563", fontSize: 13 }}>— or paste CSV text below —</div>

            <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Space Mono', monospace" }}>FORMAT: Date, Description, Amount</div>
              <textarea
                value={csv}
                onChange={e => setCsv(e.target.value)}
                placeholder={"Date,Description,Amount\n2024-01-15,Salary,2500.00\n2024-01-16,Starbucks,-5.75"}
                rows={8}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12, color: "#e5e7eb", padding: 14, fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", lineHeight: 1.6 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => analyze(csv)} style={{ flex: 1, background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "13px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Analyze My Spending →
                </button>
                <button onClick={loadSample} style={{ background: "#1f2937", color: "#9ca3af", border: "1px solid #374151", borderRadius: 10, padding: "13px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Load Sample
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ── Dashboard ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Month Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ color: "#9ca3af", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>PERIOD:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedMonth("all")}
                  style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: selectedMonth === "all" ? 600 : 400, background: selectedMonth === "all" ? "#f97316" : "#1f2937", color: selectedMonth === "all" ? "#fff" : "#9ca3af", border: "none", transition: "all 0.15s" }}>
                  All Months
                </button>
                {availableMonths.map(m => (
                  <button key={m} onClick={() => setSelectedMonth(m)}
                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: selectedMonth === m ? 600 : 400, background: selectedMonth === m ? "#f97316" : "#1f2937", color: selectedMonth === m ? "#fff" : "#9ca3af", border: "none", transition: "all 0.15s" }}>
                    {formatMonthKey(m)}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
              <InsightCard emoji="💵" title="Income" value={`$${income.toFixed(2)}`} color="#10b981" />
              <InsightCard emoji="💸" title="Spent" value={`$${expenses.toFixed(2)}`} color="#ef4444" />
              <InsightCard emoji="🏦" title="Saved" value={`$${savings.toFixed(2)}`} sub={savings >= 0 ? "Nicely done!" : "Overspent"} color={savings >= 0 ? "#3b82f6" : "#f59e0b"} />
              <InsightCard emoji="🔥" title="Top Category" value={topSpend?.name || "—"} sub={topSpend ? `$${topSpend.value.toFixed(2)}` : ""} color="#8b5cf6" />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #1f2937" }}>
              {["overview", "breakdown", "transactions", "ai tips"].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "ai tips" && aiTips.length === 0 && !aiLoading) getAiTips(); }} style={btnStyle(activeTab === tab)}>
                  {tab === "ai tips" ? "🤖 AI Tips" : tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#0f172a", borderRadius: 16, padding: 22, border: "1px solid #1f2937" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>SPENDING BY CATEGORY</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={85} dataKey="value" strokeWidth={0}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#f9fafb" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "#0f172a", borderRadius: 16, padding: 22, border: "1px solid #1f2937" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>AMOUNTS BY CATEGORY</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={categoryData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={85} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#f9fafb" }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Breakdown */}
            {activeTab === "breakdown" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {categoryData.map((cat, i) => (
                  <div key={cat.name} style={{ background: "#0f172a", borderRadius: 12, padding: "14px 20px", border: "1px solid #1f2937", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 11, height: 11, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontWeight: 500 }}>{cat.name}</div>
                    <div style={{ width: "38%", background: "#1f2937", borderRadius: 6, height: 7, overflow: "hidden" }}>
                      <div style={{ width: `${(cat.value / expenses) * 100}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 6 }} />
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#f9fafb", minWidth: 76, textAlign: "right" }}>${cat.value.toFixed(2)}</div>
                    <div style={{ color: "#6b7280", fontSize: 12, minWidth: 36, textAlign: "right" }}>{((cat.value / expenses) * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            )}

            {/* Transactions */}
            {activeTab === "transactions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>{transactions.length} transactions {selectedMonth !== "all" ? `in ${formatMonthKey(selectedMonth)}` : "total"}</div>
                {transactions.map((t, i) => (
                  <div key={i} style={{ background: "#0f172a", borderRadius: 10, padding: "11px 18px", border: "1px solid #1f2937", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ color: "#6b7280", fontSize: 11, fontFamily: "'Space Mono', monospace", minWidth: 86 }}>{t.date}</div>
                    <div style={{ flex: 1, fontSize: 13 }}>{t.description}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", background: "#1f2937", borderRadius: 5, padding: "2px 7px" }}>{t.category}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 600, fontSize: 13, color: t.amount > 0 ? "#10b981" : "#f9fafb", minWidth: 76, textAlign: "right" }}>
                      {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Tips */}
            {activeTab === "ai tips" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ color: "#9ca3af", fontSize: 13 }}>
                    AI-generated advice for {selectedMonth === "all" ? "all your data" : formatMonthKey(selectedMonth)}
                  </div>
                  <button onClick={getAiTips} disabled={aiLoading}
                    style={{ background: "#1f2937", color: aiLoading ? "#4b5563" : "#f97316", border: "1px solid #374151", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: aiLoading ? "default" : "pointer", fontFamily: "inherit" }}>
                    {aiLoading ? "Thinking..." : "↻ Refresh"}
                  </button>
                </div>

                {aiLoading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ background: "#0f172a", borderRadius: 14, padding: "20px 24px", border: "1px solid #1f2937", height: 72, opacity: 0.5 + i * 0.1 }}>
                        <div style={{ width: `${60 + i * 10}%`, height: 12, background: "#1f2937", borderRadius: 6, marginBottom: 10 }} />
                        <div style={{ width: "80%", height: 10, background: "#1f2937", borderRadius: 6 }} />
                      </div>
                    ))}
                  </div>
                )}

                {aiError && (
                  <div style={{ background: "#1f0a0a", border: "1px solid #ef444433", borderRadius: 12, padding: "16px 20px", color: "#ef4444", fontSize: 14 }}>
                    {aiError}
                  </div>
                )}

                {!aiLoading && aiTips.map((tip, i) => (
                  <div key={i} style={{ background: "#0f172a", border: "1px solid #1f2937", borderLeft: `3px solid ${COLORS[i % COLORS.length]}`, borderRadius: 14, padding: "18px 22px", fontSize: 14, lineHeight: 1.7 }}>
                    {tip}
                  </div>
                ))}

                {!aiLoading && aiTips.length === 0 && !aiError && (
                  <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                    <div>Click Refresh to get AI-powered tips</div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
