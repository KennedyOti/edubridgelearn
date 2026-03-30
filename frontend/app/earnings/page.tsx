"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import api from "@/lib/api";
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Clock,
  DollarSign, RefreshCw, AlertCircle, CheckCircle2,
  XCircle, Loader2, ChevronLeft, ChevronRight, Info,
} from "lucide-react";

interface WalletData {
  balance: number;
  pending_balance: number;
  currency: string;
}

interface WalletTransaction {
  id: string;
  type: "credit" | "debit" | "commission" | "refund" | "withdrawal";
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

interface EarningsSummary {
  this_month: number;
  last_month: number;
  total_earned: number;
  total_sessions: number;
  currency: string;
}

const TX_CONFIG = {
  credit: { label: "Earned", icon: ArrowDownLeft, color: "text-green-600", bg: "bg-green-50", sign: "+" },
  debit: { label: "Debit", icon: ArrowUpRight, color: "text-red-600", bg: "bg-red-50", sign: "-" },
  commission: { label: "Commission", icon: ArrowUpRight, color: "text-orange-600", bg: "bg-orange-50", sign: "-" },
  refund: { label: "Refund", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50", sign: "-" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-purple-600", bg: "bg-purple-50", sign: "-" },
};

function formatAmount(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function EarningsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank_transfer");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadTransactions(page);
  }, [page]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get("/tutors/wallet"),
        api.get("/tutors/wallet/transactions", { params: { per_page: 10, page: 1 } }),
      ]);
      setWallet(walletRes.data.data);
      setSummary(walletRes.data.data.summary ?? null);
      setTransactions(txRes.data.data ?? []);
      setTotalPages(txRes.data.meta?.last_page ?? 1);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async (pg: number) => {
    try {
      const { data } = await api.get("/tutors/wallet/transactions", { params: { per_page: 10, page: pg } });
      setTransactions(data.data ?? []);
      setTotalPages(data.meta?.last_page ?? 1);
    } catch {
      // silently fail
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(Number(withdrawAmount) * 100);
    if (!amountCents || amountCents <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }
    if (wallet && amountCents > wallet.balance) {
      setWithdrawError("Amount exceeds your available balance.");
      return;
    }
    setWithdrawError("");
    setIsWithdrawing(true);
    try {
      await api.post("/tutors/wallet/withdraw", {
        amount: amountCents,
        payment_method: withdrawMethod,
        payment_details: withdrawDetails.trim() || undefined,
      });
      setWithdrawSuccess(true);
      await loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { message: string }[] } } })
          ?.response?.data?.errors?.[0]?.message ?? "Withdrawal request failed.";
      setWithdrawError(msg);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Earnings">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const currency = wallet?.currency ?? "USD";
  const changePercent = summary && summary.last_month > 0
    ? (((summary.this_month - summary.last_month) / summary.last_month) * 100).toFixed(0)
    : null;

  return (
    <DashboardLayout title="Earnings & Wallet">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Earnings & Wallet</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track your income and manage withdrawals</p>
          </div>
          <Button
            onClick={() => { setWithdrawSuccess(false); setWithdrawAmount(""); setWithdrawDetails(""); setWithdrawModal(true); }}
            disabled={!wallet || wallet.balance <= 0}
          >
            <ArrowUpRight className="w-4 h-4" />
            Request Withdrawal
          </Button>
        </div>

        {/* Wallet balance */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-white/70" />
                <span className="text-white/70 text-sm">Available Balance</span>
              </div>
              <div className="text-4xl font-bold">
                {formatAmount(wallet?.balance ?? 0, currency)}
              </div>
              {wallet && wallet.pending_balance > 0 && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm mt-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatAmount(wallet.pending_balance, currency)} pending
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 mt-4 text-sm">
            <Info className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <span className="text-white/80">15% platform commission is automatically deducted from each session</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "This Month",
              value: formatAmount(summary?.this_month ?? 0, currency),
              icon: TrendingUp,
              sub: changePercent
                ? `${Number(changePercent) >= 0 ? "+" : ""}${changePercent}% vs last month`
                : undefined,
              positive: Number(changePercent) >= 0,
            },
            {
              label: "Last Month",
              value: formatAmount(summary?.last_month ?? 0, currency),
              icon: DollarSign,
            },
            {
              label: "Total Earned",
              value: formatAmount(summary?.total_earned ?? 0, currency),
              icon: Wallet,
            },
            {
              label: "Sessions Done",
              value: summary?.total_sessions?.toLocaleString() ?? "0",
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon: Icon, sub, positive }) => (
            <div key={label} className="bg-white rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              {sub && (
                <p className={`text-xs mt-0.5 ${positive ? "text-green-600" : "text-red-500"}`}>{sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Transaction History</h2>
            <button onClick={loadAll} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <DollarSign className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const cfg = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{cfg.label}</p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{tx.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Balance after: {formatAmount(tx.balance_after, currency)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${tx.type === "credit" ? "text-green-600" : "text-foreground"}`}>
                        {cfg.sign}{formatAmount(tx.amount, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      <Modal
        open={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        title="Request Withdrawal"
        size="sm"
      >
        {withdrawSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Withdrawal Requested!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your withdrawal request has been submitted and will be processed within 3-5 business days.
              </p>
            </div>
            <Button className="w-full" onClick={() => setWithdrawModal(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="p-6 space-y-4">
            <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-bold text-foreground">{formatAmount(wallet?.balance ?? 0, currency)}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  max={((wallet?.balance ?? 0) / 100).toFixed(2)}
                  className="w-full rounded-xl border border-border pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmount(((wallet?.balance ?? 0) / 100).toFixed(2))}
                className="text-xs text-primary hover:underline text-left"
              >
                Withdraw all ({formatAmount(wallet?.balance ?? 0, currency)})
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "paypal", label: "PayPal" },
                  { value: "mpesa", label: "M-Pesa" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setWithdrawMethod(m.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      withdrawMethod === m.value
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Account Details <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={withdrawDetails}
                onChange={(e) => setWithdrawDetails(e.target.value)}
                placeholder={
                  withdrawMethod === "bank_transfer"
                    ? "Account number, routing number…"
                    : withdrawMethod === "paypal"
                    ? "PayPal email…"
                    : "M-Pesa number…"
                }
                className="rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {withdrawError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {withdrawError}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isWithdrawing}>
              Submit Withdrawal Request
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Processing takes 3-5 business days
            </p>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
