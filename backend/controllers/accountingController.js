import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// Helper — sum ledger entries by account and type
const sumAccount = async (account, side, dateFrom, dateTo) => {
  let query = supabase
    .from('ledger_entries')
    .select('amount')
    .eq(`${side}_account`, account);

  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo)   query = query.lte('created_at', dateTo);

  const { data } = await query;
  return data?.reduce((acc, r) => acc + Number(r.amount), 0) || 0;
};

// @GET /api/accounting/summary  [admin]
export const getSummary = asyncHandler(async (req, res) => {
  const { from: dateFrom, to: dateTo } = req.query;

  const [
    revenue,
    refunds,
    shippingIncome,
    cogs,
    expenses,
    cashDebits,
    cashCredits,
  ] = await Promise.all([
    sumAccount('revenue',         'credit', dateFrom, dateTo),
    sumAccount('revenue',         'debit',  dateFrom, dateTo), // refunds hit revenue debit
    sumAccount('shipping_income', 'credit', dateFrom, dateTo),
    sumAccount('cogs',            'debit',  dateFrom, dateTo),
    sumAccount('cash',            'credit', dateFrom, dateTo), // cash going out
    sumAccount('cash',            'debit',  dateFrom, dateTo), // cash coming in
    sumAccount('cash',            'credit', dateFrom, dateTo),
  ]);

  const grossRevenue   = revenue + shippingIncome;
  const netRevenue     = grossRevenue - refunds;
  const grossProfit    = netRevenue - cogs;
  const operatingCost  = expenses;
  const netProfit      = grossProfit - operatingCost;
  const cashOnHand     = cashDebits - cashCredits;
  const grossMarginPct = netRevenue > 0 ? ((grossProfit / netRevenue) * 100).toFixed(1) : 0;

  res.json({
    revenue: {
      gross:    grossRevenue,
      refunds,
      shipping: shippingIncome,
      net:      netRevenue,
    },
    costs: {
      cogs,
      expenses: operatingCost,
    },
    profit: {
      gross:          grossProfit,
      net:            netProfit,
      gross_margin:   Number(grossMarginPct),
    },
    cash: {
      in:    cashDebits,
      out:   cashCredits,
      on_hand: cashOnHand,
    },
  });
});

// @GET /api/accounting/pnl  [admin] — full P&L statement
export const getPnL = asyncHandler(async (req, res) => {
  const { from: dateFrom, to: dateTo, group_by = 'month' } = req.query;

  // Get all ledger entries in range
  let query = supabase
    .from('ledger_entries')
    .select('*')
    .order('created_at', { ascending: true });

  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo)   query = query.lte('created_at', dateTo);

  const { data: entries } = await query;
  if (!entries) return res.json([]);

  // Group by month or week
  const grouped = {};
  for (const entry of entries) {
    const date = new Date(entry.created_at);
    const key  = group_by === 'week'
      ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped[key]) grouped[key] = { period: key, revenue: 0, cogs: 0, shipping: 0, expenses: 0, refunds: 0 };

    if (entry.credit_account === 'revenue')         grouped[key].revenue   += Number(entry.amount);
    if (entry.credit_account === 'shipping_income') grouped[key].shipping  += Number(entry.amount);
    if (entry.debit_account  === 'revenue')         grouped[key].refunds   += Number(entry.amount);
    if (entry.debit_account  === 'cogs')            grouped[key].cogs      += Number(entry.amount);
    if (entry.type           === 'expense')         grouped[key].expenses  += Number(entry.amount);
  }

  const result = Object.values(grouped).map((row) => ({
    ...row,
    gross_profit: (row.revenue + row.shipping - row.refunds) - row.cogs,
    net_profit:   (row.revenue + row.shipping - row.refunds) - row.cogs - row.expenses,
  }));

  res.json(result);
});

// @GET /api/accounting/ledger  [admin] — raw ledger entries
export const getLedger = asyncHandler(async (req, res) => {
  const { type, account, page = 1, limit = 50 } = req.query;

  let query = supabase
    .from('ledger_entries')
    .select('*, orders(id, total_amount, status), purchase_orders(id, total_cost)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (type)    query = query.eq('type', type);
  if (account) query = query.or(`debit_account.eq.${account},credit_account.eq.${account}`);

  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ entries: data, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
});

// @GET /api/accounting/balance-sheet  [admin]
export const getBalanceSheet = asyncHandler(async (req, res) => {
  const accounts = ['cash','accounts_receivable','inventory_asset','accounts_payable','revenue','cogs','shipping_income','refunds'];

  const results = await Promise.all(
    accounts.map(async (account) => {
      const [debits, credits] = await Promise.all([
        sumAccount(account, 'debit',  null, null),
        sumAccount(account, 'credit', null, null),
      ]);
      return { account, debits, credits, balance: debits - credits };
    })
  );

  // Assets
  const assets = results.filter((r) => ['cash','accounts_receivable','inventory_asset'].includes(r.account));
  // Liabilities
  const liabilities = results.filter((r) => ['accounts_payable'].includes(r.account));
  // Income
  const income = results.filter((r) => ['revenue','shipping_income'].includes(r.account));
  // Expenses
  const expenseAccounts = results.filter((r) => ['cogs','refunds'].includes(r.account));

  res.json({ assets, liabilities, income, expenses: expenseAccounts });
});

// @POST /api/accounting/expense  [admin] — record a manual expense
export const recordExpense = asyncHandler(async (req, res) => {
  const { amount, description, category = 'expense' } = req.body;
  if (!amount || !description)
    return res.status(400).json({ message: 'amount and description required' });

  const { data, error } = await supabase
    .from('ledger_entries')
    .insert({
      type:           'expense',
      debit_account:  category,
      credit_account: 'cash',
      amount:         Number(amount),
      currency:       'PKR',
      description,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});
