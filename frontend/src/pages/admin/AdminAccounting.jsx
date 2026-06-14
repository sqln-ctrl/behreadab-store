import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaDollarSign, FaChartLine, FaBook, FaBalanceScale } from "react-icons/fa";
import { accountingAPI } from "../../services/api";

const tabs = [
  { id: "summary",  label: "Summary",       icon: <FaDollarSign /> },
  { id: "pnl",      label: "P&L",           icon: <FaChartLine /> },
  { id: "ledger",   label: "Ledger",        icon: <FaBook /> },
  { id: "balance",  label: "Balance Sheet", icon: <FaBalanceScale /> },
];

const LEDGER_TYPE_COLORS = {
  sale:       { bg: "#dcfce7", text: "#166534" },
  refund:     { bg: "#fee2e2", text: "#991b1b" },
  cogs:       { bg: "#fef3c7", text: "#92400e" },
  shipping:   { bg: "#dbeafe", text: "#1e40af" },
  expense:    { bg: "#fee2e2", text: "#991b1b" },
  restock:    { bg: "#ede9fe", text: "#5b21b6" },
  adjustment: { bg: "#f3f4f6", text: "#374151" },
};

const StatBox = ({ label, value, sub, color = "#d4af37", negative }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
    <p className="text-2xl font-black" style={{ color: negative ? "#ef4444" : color }}>
      PKR {Number(value || 0).toLocaleString()}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminAccounting = () => {
  const [tab, setTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [pnl, setPnl] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expenseModal, setExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: "", description: "", category: "expense" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = {};
    if (dateFrom) params.from = dateFrom;
    if (dateTo)   params.to   = dateTo;

    try {
      const [sumRes, pnlRes, ledRes, balRes] = await Promise.all([
        accountingAPI.getSummary(params),
        accountingAPI.getPnL(params),
        accountingAPI.getLedger({ limit: 50 }),
        accountingAPI.getBalanceSheet(),
      ]);
      setSummary(sumRes.data);
      setPnl(pnlRes.data);
      setLedger(ledRes.data.entries);
      setBalance(balRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const handleExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) return;
    setSaving(true);
    try {
      await accountingAPI.recordExpense(expenseForm);
      setExpenseModal(false);
      setExpenseForm({ amount: "", description: "", category: "expense" });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Accounting</h1>
          <p className="text-gray-400 text-sm mt-1">Double-entry bookkeeping · PKR</p>
        </div>
        <motion.button onClick={() => setExpenseModal(true)} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-black text-sm"
          style={{ background: "#d4af37" }}>
          <FaPlus /> Record Expense
        </motion.button>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Filter by date</span>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm outline-none focus:border-yellow-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm outline-none focus:border-yellow-400" />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="text-xs text-gray-400 hover:text-gray-700 underline">Clear</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <motion.button key={t.id} onClick={() => setTab(t.id)} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ background: tab === t.id ? "#d4af37" : "white", color: tab === t.id ? "#000" : "#6b7280", border: "1px solid", borderColor: tab === t.id ? "#d4af37" : "#e5e7eb" }}>
            {t.icon} {t.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin" /></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            {/* ── Summary ── */}
            {tab === "summary" && summary && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Gross Revenue"  value={summary.revenue.gross} />
                  <StatBox label="Net Revenue"    value={summary.revenue.net} />
                  <StatBox label="Gross Profit"   value={summary.profit.gross} color="#22c55e" />
                  <StatBox label="Net Profit"     value={summary.profit.net} color={summary.profit.net >= 0 ? "#22c55e" : "#ef4444"} negative={summary.profit.net < 0} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="COGS"           value={summary.costs.cogs}       color="#f59e0b" />
                  <StatBox label="Refunds"        value={summary.revenue.refunds}  color="#ef4444" />
                  <StatBox label="Shipping Income" value={summary.revenue.shipping} />
                  <StatBox label="Cash on Hand"   value={summary.cash.on_hand} color={summary.cash.on_hand >= 0 ? "#22c55e" : "#ef4444"} />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-black text-lg mb-4">Gross Margin</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${Math.min(summary.profit.gross_margin, 100)}%` }} />
                    </div>
                    <span className="text-2xl font-black" style={{ color: "#22c55e" }}>{summary.profit.gross_margin}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Industry average for luxury goods: 55–65%</p>
                </div>
              </div>
            )}

            {/* ── P&L ── */}
            {tab === "pnl" && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="font-black text-lg">Profit & Loss Statement</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Period", "Revenue", "COGS", "Gross Profit", "Expenses", "Net Profit"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pnl.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No data for this period</td></tr>}
                      {pnl.map((row) => (
                        <tr key={row.period} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-4 font-bold text-gray-800">{row.period}</td>
                          <td className="px-5 py-4 text-gray-700">PKR {Number(row.revenue + row.shipping).toLocaleString()}</td>
                          <td className="px-5 py-4 text-gray-700">PKR {Number(row.cogs).toLocaleString()}</td>
                          <td className="px-5 py-4 font-semibold" style={{ color: row.gross_profit >= 0 ? "#22c55e" : "#ef4444" }}>
                            PKR {Number(row.gross_profit).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-gray-700">PKR {Number(row.expenses).toLocaleString()}</td>
                          <td className="px-5 py-4 font-black text-lg" style={{ color: row.net_profit >= 0 ? "#22c55e" : "#ef4444" }}>
                            PKR {Number(row.net_profit).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Ledger ── */}
            {tab === "ledger" && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="font-black text-lg">General Ledger</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Date", "Type", "Description", "Debit", "Credit", "Amount"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ledger.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No entries</td></tr>}
                      {ledger?.map((entry) => {
                        const style = LEDGER_TYPE_COLORS[entry.type] || { bg: "#f3f4f6", text: "#374151" };
                        return (
                          <tr key={entry.id} className="hover:bg-gray-50 transition">
                            <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-bold capitalize"
                                style={{ background: style.bg, color: style.text }}>{entry.type}</span>
                            </td>
                            <td className="px-5 py-3 text-gray-700 text-xs max-w-xs truncate">{entry.description}</td>
                            <td className="px-5 py-3 text-xs font-mono text-gray-600">{entry.debit_account}</td>
                            <td className="px-5 py-3 text-xs font-mono text-gray-600">{entry.credit_account}</td>
                            <td className="px-5 py-3 font-bold" style={{ color: "#d4af37" }}>
                              PKR {Number(entry.amount).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Balance Sheet ── */}
            {tab === "balance" && balance && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Assets */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-black text-lg mb-4 text-green-700">Assets</h3>
                  <div className="space-y-3">
                    {balance.assets.map((a) => (
                      <div key={a.account} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm font-medium capitalize text-gray-700">{a.account.replace(/_/g, " ")}</span>
                        <span className="font-black" style={{ color: "#22c55e" }}>PKR {Number(Math.abs(a.balance)).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-black">
                      <span>Total Assets</span>
                      <span style={{ color: "#22c55e" }}>PKR {balance.assets.reduce((s, a) => s + Math.abs(a.balance), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities + Income */}
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-black text-lg mb-4 text-red-600">Liabilities</h3>
                    <div className="space-y-3">
                      {balance.liabilities.map((a) => (
                        <div key={a.account} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm font-medium capitalize text-gray-700">{a.account.replace(/_/g, " ")}</span>
                          <span className="font-black text-red-500">PKR {Number(Math.abs(a.balance)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-black text-lg mb-4 text-blue-700">Income & Expenses</h3>
                    <div className="space-y-3">
                      {[...balance.income, ...balance.expenses].map((a) => (
                        <div key={a.account} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm font-medium capitalize text-gray-700">{a.account.replace(/_/g, " ")}</span>
                          <span className="font-black" style={{ color: a.credits > a.debits ? "#22c55e" : "#ef4444" }}>
                            PKR {Number(Math.abs(a.balance)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}

      {/* Expense Modal */}
      <AnimatePresence>
        {expenseModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setExpenseModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-xl">Record Expense</h2>
                <button onClick={() => setExpenseModal(false)}><FaTimes className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Amount (PKR)</label>
                  <input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="5000" className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Description</label>
                  <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Office rent, courier charges, etc." className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Category</label>
                  <select value={expenseForm.category} onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 bg-white">
                    {["expense", "marketing", "logistics", "utilities", "salaries", "other"].map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <motion.button onClick={handleExpense} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-60"
                  style={{ background: "#d4af37" }}>
                  {saving ? "Saving..." : "Record Expense"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAccounting;
