import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Info,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "../badge";
import { useApi, useDashboard } from "../context";
import { formatDate, formatDateTime, formatMoney, shortId } from "../format";
import type { AccountSetup, Balance, List, Payment } from "../types";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Empty,
  ErrorNote,
  Input,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";

export function BalanceView() {
  const { session, navigate } = useDashboard();
  const { data: balance, error: balanceError } = useApi<Balance>("/balance");
  const { data: setup } = useApi<AccountSetup>("/setup");
  const { data: paymentsData } = useApi<List<Payment>>("/v1/payments?limit=50");

  const [activityTab, setActivityTab] = useState<"payouts" | "topups" | "all">("payouts");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const payout = setup?.details?.payout;
  const payments = paymentsData?.data ?? [];

  // Filter payments for "All activity" tab based on search query
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase().trim();
    return payments.filter((p) => {
      const email = p.customer_email?.toLowerCase() ?? "";
      const id = p.id.toLowerCase();
      const amountStr = (p.amount / 100).toString();
      const currency = p.currency.toLowerCase();
      return email.includes(q) || id.includes(q) || amountStr.includes(q) || currency.includes(q);
    });
  }, [payments, searchQuery]);

  return (
    <div className="grid gap-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.9rem] leading-tight font-light tracking-[-0.035em] text-ink">
            <span className="font-display text-[1.1em]">Your </span>balances
          </h1>
          <p className="mt-1 text-sm text-mute">
            Overview of available funds, incoming settlements, and automatic payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <SlidersHorizontal className="size-3.5 text-mute" />
            Payout schedule
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPayoutModal(true)}
            className="text-xs"
          >
            Pay out
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("setup")}
            className="text-xs"
          >
            Manage payouts
          </Button>
        </div>
      </div>

      {balanceError && <ErrorNote message={balanceError} />}
      {!balance && !balanceError && <Loading />}

      {balance && balance.data.length === 0 && (
        <Empty title="No balance activity yet">
          Your balance grows with every payment and settles to your bank on a rolling schedule.
        </Empty>
      )}

      {balance && balance.data.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Left Column (2 cols) */}
          <div className="grid gap-6 lg:col-span-2">
            {balance.data.map((b) => {
              const total = b.available + b.pending;
              const availablePct = total > 0 ? (b.available / total) * 100 : 0;
              const pendingPct = total > 0 ? (b.pending / total) * 100 : 0;
              const incomingSchedule = b.incoming_schedule ?? [];

              return (
                <Card key={b.currency} className="grid gap-6 border-line/80 bg-white shadow-sm">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-ink">Balance summary</h2>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80 transition-colors"
                      title="Click to view hold tier & settlement details"
                    >
                      <span className="size-1.5 rounded-full bg-brand-500" />
                      {balance.speed_label ?? `${balance.hold_days} days`} schedule
                      <Info className="size-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Dual-tone Progress Bar (Stripe style) */}
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
                    {/* Incoming / Pending segment (soft slate/blue) */}
                    <div
                      className="bg-[#94a3b8] transition-all duration-500 rounded-l-full"
                      style={{ width: `${pendingPct}%` }}
                      title={`Incoming: ${formatMoney(b.pending, b.currency)}`}
                    />
                    {/* Available segment (Stripe purple / indigo) */}
                    <div
                      className="bg-[#635bff] transition-all duration-500 rounded-r-full"
                      style={{ width: `${availablePct}%` }}
                      title={`Available: ${formatMoney(b.available, b.currency)}`}
                    />
                  </div>

                  {/* Stripe-style Breakdown Table */}
                  <div className="border-t border-line/60 pt-3">
                    <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-mute">
                      <span>Payments type</span>
                      <span>Amount</span>
                    </div>

                    {/* Incoming Row */}
                    <div className="border-t border-line/40 py-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full bg-[#94a3b8]" />
                          <span className="font-medium text-ink">Incoming</span>
                        </div>
                        <span className="font-mono font-medium text-ink">
                          {formatMoney(b.pending, b.currency)}
                        </span>
                      </div>

                      {/* Indented clearance schedule dates */}
                      {incomingSchedule.length > 0 ? (
                        <div className="ml-5 mt-2 space-y-1.5 border-l-2 border-slate-200/60 pl-3">
                          {incomingSchedule.map((item) => (
                            <div
                              key={item.date}
                              className="flex items-center justify-between text-xs text-mute"
                            >
                              <span className="flex items-center gap-1.5">
                                <Calendar className="size-3 text-slate-400" />
                                {item.display_date}
                              </span>
                              <span className="font-mono text-ink-soft">
                                {formatMoney(item.amount, b.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : b.pending > 0 ? (
                        <div className="ml-5 mt-1.5 text-xs text-mute">
                          Clearing over the next {balance.hold_days} days
                        </div>
                      ) : null}
                    </div>

                    {/* Available Row */}
                    <div className="border-t border-line/40 py-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full bg-[#635bff]" />
                          <span className="font-medium text-ink">Available</span>
                        </div>
                        <span className="font-mono font-medium text-ink">
                          {formatMoney(b.available, b.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Recent Activity Section */}
            <div className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">Recent activity</h2>
                  <p className="text-xs text-mute">
                    Transactions, payout events, and balance settlement entries.
                  </p>
                </div>

                {/* Search Bar for activity */}
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-mute" />
                  <Input
                    type="search"
                    placeholder="Search activity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Segmented Tabs (Payouts / Top-ups / All activity) */}
              <div className="flex border-b border-line">
                <button
                  type="button"
                  onClick={() => setActivityTab("payouts")}
                  className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
                    activityTab === "payouts"
                      ? "border-[#635bff] text-[#635bff]"
                      : "border-transparent text-mute hover:text-ink"
                  }`}
                >
                  Payouts
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab("topups")}
                  className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
                    activityTab === "topups"
                      ? "border-[#635bff] text-[#635bff]"
                      : "border-transparent text-mute hover:text-ink"
                  }`}
                >
                  Top-ups
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab("all")}
                  className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
                    activityTab === "all"
                      ? "border-[#635bff] text-[#635bff]"
                      : "border-transparent text-mute hover:text-ink"
                  }`}
                >
                  All activity ({filteredPayments.length})
                </button>
              </div>

              {/* Tab Content: Payouts */}
              {activityTab === "payouts" && (
                <Card className="flex flex-col items-center justify-center py-14 text-center border-line/70 bg-white">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3">
                    <Search className="size-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">No payouts to display</h3>
                  <p className="mt-1 max-w-sm text-xs text-mute">
                    Payouts will appear here once they've been created. Once incoming funds clear, they will be paid out automatically.
                  </p>
                  {payout && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-line text-xs text-ink-soft">
                      <Building2 className="size-3.5 text-slate-400" />
                      <span>Next destination: {payout.bank_name} (•••• {payout.last4})</span>
                    </div>
                  )}
                </Card>
              )}

              {/* Tab Content: Top-ups */}
              {activityTab === "topups" && (
                <Card className="flex flex-col items-center justify-center py-14 text-center border-line/70 bg-white">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3">
                    <Plus className="size-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">No top-ups to display</h3>
                  <p className="mt-1 max-w-sm text-xs text-mute">
                    Top-ups will appear here once you've added funds directly to your balance to cover chargebacks or custom payouts.
                  </p>
                </Card>
              )}

              {/* Tab Content: All activity */}
              {activityTab === "all" && (
                <div>
                  {filteredPayments.length === 0 ? (
                    <Card className="py-10 text-center border-line/70 bg-white">
                      <p className="text-sm font-medium text-ink">No transactions found</p>
                      <p className="mt-1 text-xs text-mute">
                        {searchQuery ? `No activity matching "${searchQuery}"` : "Payments will appear here once captured."}
                      </p>
                    </Card>
                  ) : (
                    <Table head={["Transaction", "Gross", "Fee", "Net added", "Settlement", "Date"]}>
                      {filteredPayments.map((p) => {
                        const fee = p.platform_fee + p.provider_fee;
                        const net = p.amount - fee;
                        const holdDays = balance.hold_days;
                        const clearanceTimestamp = p.created + holdDays * 86400;
                        const isCleared = clearanceTimestamp <= Math.floor(Date.now() / 1000);

                        return (
                          <TableRow key={p.id}>
                            <TableCell className="px-4 py-3">
                              <p className="font-medium text-xs text-ink">
                                {p.customer_email ?? "Payment capture"}
                              </p>
                              <p className="font-mono text-[11px] text-mute">{shortId(p.id)}</p>
                            </TableCell>
                            <TableCell className="px-4 font-mono text-xs text-ink-soft">
                              {formatMoney(p.amount, p.currency)}
                            </TableCell>
                            <TableCell className="px-4 font-mono text-xs text-rose-600">
                              -{formatMoney(fee, p.currency)}
                            </TableCell>
                            <TableCell className="px-4 font-mono text-xs font-semibold text-emerald-700">
                              +{formatMoney(net, p.currency)}
                            </TableCell>
                            <TableCell className="px-4 text-xs">
                              {isCleared ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <span className="size-1.5 rounded-full bg-emerald-500" /> Available
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                  <span className="size-1.5 rounded-full bg-slate-400" />
                                  Incoming
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 text-xs text-mute">
                              {formatDate(p.created)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </Table>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Column (1 col) - Matching Stripe */}
          <div className="grid gap-6 content-start">
            {/* Automatic Payouts Card */}
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold text-ink">Automatic payouts</h3>
              {payout ? (
                <Card className="grid gap-3.5 border-line/80 bg-white shadow-sm p-4">
                  <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
                    <span className="text-xs font-medium text-mute">Status</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs">
                    <div>
                      <p className="text-mute">Destination bank</p>
                      <p className="font-medium text-ink mt-0.5">{payout.bank_name}</p>
                      <p className="font-mono text-mute">•••• •••• •••• {payout.last4}</p>
                    </div>

                    <div className="pt-1">
                      <p className="text-mute">Schedule frequency</p>
                      <p className="font-medium text-ink mt-0.5">Daily — Every business day</p>
                      <p className="text-[11px] text-mute">
                        Clearing on a {balance.speed_label ?? `${balance.hold_days}-day`} timeline
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("setup")}
                    className="w-full text-xs mt-1"
                  >
                    Manage automatic payouts
                  </Button>
                </Card>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("setup")}
                  className="h-auto w-full flex-col rounded-2xl border-2 border-dashed border-line p-6 text-center whitespace-normal font-normal hover:border-brand-400 hover:bg-slate-50/50"
                >
                  <span className="block text-xs font-medium text-brand-600">+ Set up automatic payouts</span>
                  <span className="mt-1 block text-[11px] text-mute">
                    Connect your bank account to automatically receive cleared balances.
                  </span>
                </Button>
              )}
            </div>

            {/* Reports Card */}
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold text-ink">Reports</h3>
              <Card
                role="button"
                tabIndex={0}
                onClick={() => setShowReportsModal(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowReportsModal(true);
                  }
                }}
                className="cursor-pointer group flex items-center justify-between p-4 border-line/80 bg-white hover:border-line-hover transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink group-hover:text-brand-600 transition-colors">
                      Statements and reports
                    </p>
                    <p className="text-[11px] text-mute">Monthly balance & activity summary</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-mute group-hover:text-brand-600 transition-colors" />
              </Card>
            </div>

            {/* Stripe Payout Hold Tiers Explanation Card */}
            <Card className="grid gap-3.5 border-line/80 bg-slate-50/50 p-4 text-xs">
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <p className="font-semibold text-ink text-xs">Payout speed schedules</p>
                <span className="font-mono text-[10px] uppercase text-mute">Stripe model</span>
              </div>

              <div className="space-y-2.5">
                <div
                  className={`rounded-lg p-2.5 transition-colors ${
                    balance.speed_label === "2-3 business days"
                      ? "bg-brand-50 border border-brand-200"
                      : "bg-white border border-line/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">2–3 business days</span>
                    {balance.speed_label === "2-3 business days" && (
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-mute">
                    Standard domestic payouts for established US, UK & EU accounts.
                  </p>
                </div>

                <div
                  className={`rounded-lg p-2.5 transition-colors ${
                    balance.speed_label === "7 days"
                      ? "bg-brand-50 border border-brand-200"
                      : "bg-white border border-line/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">7 days (standard)</span>
                    {balance.speed_label === "7 days" && (
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-mute">
                    Standard rolling reserve for newly activated accounts and first payouts.
                  </p>
                </div>

                <div
                  className={`rounded-lg p-2.5 transition-colors ${
                    balance.speed_label === "7-14 business days"
                      ? "bg-brand-50 border border-brand-200"
                      : "bg-white border border-line/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">7–14 business days</span>
                    {balance.speed_label === "7-14 business days" && (
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-mute">
                    Cross-border currency conversions and international settlement corridors.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Pay Out Dialog */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Initiate balance payout</DialogTitle>
            <DialogDescription>
              Transfer available cleared balance directly to your connected bank account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            {balance && (
              <div className="rounded-xl bg-slate-50 p-4 border border-line">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-mute">Available to pay out now</span>
                  <span className="font-mono font-semibold text-ink text-base">
                    {formatMoney(balance.data[0]?.available ?? 0, balance.data[0]?.currency ?? "usd")}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-2 text-xs">
                  <span className="text-mute">Pending clearance</span>
                  <span className="font-mono text-ink-soft">
                    {formatMoney(balance.data[0]?.pending ?? 0, balance.data[0]?.currency ?? "usd")}
                  </span>
                </div>
              </div>
            )}

            {payout ? (
              <div className="rounded-xl bg-white p-3.5 border border-line text-xs space-y-1">
                <p className="text-mute font-medium">Destination</p>
                <p className="font-semibold text-ink">{payout.bank_name}</p>
                <p className="font-mono text-mute">•••• •••• •••• {payout.last4} ({payout.account_name})</p>
              </div>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Please connect a payout bank account in Account Setup before initiating payouts.
              </p>
            )}

            {(balance?.data[0]?.available ?? 0) === 0 && (
              <p className="text-xs text-mute">
                You currently have no available balance ready for payout. Pending funds will automatically clear into available balance after your reserve schedule.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowPayoutModal(false)}>
              Close
            </Button>
            <Button
              size="sm"
              disabled={(balance?.data[0]?.available ?? 0) === 0 || !payout}
              onClick={() => {
                setShowPayoutModal(false);
              }}
            >
              Pay out available funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statements and Reports Dialog */}
      <Dialog open={showReportsModal} onOpenChange={setShowReportsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Statements and reports</DialogTitle>
            <DialogDescription>
              Export monthly balance summaries, settlement logs, and fee deductions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-xl border border-line bg-slate-50 p-3.5 space-y-2">
              <div className="flex justify-between">
                <span className="text-mute">Period</span>
                <span className="font-medium text-ink">Current month to date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Gross transactions</span>
                <span className="font-mono font-medium text-ink">
                  {payments.length} captured
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Payout schedule</span>
                <span className="font-medium text-ink">
                  {balance?.speed_label ?? "7 days"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                const csvHeader = "Transaction ID,Customer Email,Gross Amount,Currency,Date\n";
                const csvRows = payments
                  .map((p) => `${p.id},${p.customer_email ?? ""},${p.amount / 100},${p.currency},${new Date(p.created * 1000).toISOString()}`)
                  .join("\n");
                const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `balance-statement-${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="size-3.5" />
              Download balance statement (CSV)
            </Button>
          </div>

          <DialogFooter>
            <Button size="sm" onClick={() => setShowReportsModal(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Schedule Guide Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>How payout schedules work</DialogTitle>
            <DialogDescription>
              Understanding rolling reserve windows and settlement timelines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-ink-soft py-2">
            <p>
              Like Stripe, VRS Pay holds sales in a rolling reserve window before they clear into your <strong>Available</strong> balance. This protects both you and customers against chargebacks and refunds.
            </p>

            <div className="space-y-2 mt-2">
              <div className="border border-line rounded-xl p-3 bg-slate-50">
                <p className="font-semibold text-ink">⚡ 2–3 Business Days (Domestic Accelerated)</p>
                <p className="mt-1 text-mute text-[11px]">
                  Available for fully verified accounts in primary domestic corridors (US, UK, EU) selling in local domestic currency.
                </p>
              </div>

              <div className="border border-line rounded-xl p-3 bg-slate-50">
                <p className="font-semibold text-ink">🛡️ 7 Days (Standard Rolling Reserve)</p>
                <p className="mt-1 text-mute text-[11px]">
                  Applied to newly verified accounts during their initial probation period. Every transaction clears exactly 7 days after capture.
                </p>
              </div>

              <div className="border border-line rounded-xl p-3 bg-slate-50">
                <p className="font-semibold text-ink">🌐 7–14 Business Days (Cross-Border International)</p>
                <p className="mt-1 text-mute text-[11px]">
                  Applied when converting foreign sales into international destination bank accounts (e.g. USD/GBP sales settling to African, Asian, or South American local bank rails).
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button size="sm" onClick={() => setShowScheduleModal(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
