"use client";

import { useMemo, useState } from "react";
import { Search, X, CreditCard, ChevronRight, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { Badge } from "../badge";
import { useApi } from "../context";
import { formatDateTime, formatMoney, shortId } from "../format";
import type { List, Payment } from "../types";
import { ErrorNote, Loading, PageHeader } from "../ui";
import { RefundControl } from "./refund-control";
import { Disputes } from "./disputes";
import { PaymentDetailDialog } from "./payment-detail-dialog";
import { ExportDialog } from "./export-dialog";
import { PaymentsAnalyticsView } from "./payments-analytics";

type StatusTab = "all" | "succeeded" | "refunded";

export function PaymentsView() {
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
  const [selectedStatus, setSelectedStatus] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  // Fetch payments list with query filter
  const apiPath = useMemo(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (selectedStatus !== "all") {
      params.set("status", selectedStatus === "refunded" ? "refunded" : "succeeded");
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    return `/v1/payments?${params.toString()}`;
  }, [selectedStatus, searchQuery]);

  const { data, error, reload } = useApi<List<Payment>>(apiPath);

  // Filter client-side as well for instant keystroke feedback
  const filteredPayments = useMemo(() => {
    if (!data?.data) return [];
    let list = data.data;

    if (selectedStatus === "succeeded") {
      list = list.filter((p) => p.status === "succeeded");
    } else if (selectedStatus === "refunded") {
      list = list.filter((p) => p.status === "refunded" || p.status === "partially_refunded");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.customer_email?.toLowerCase().includes(q) ||
          p.provider_reference?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [data, selectedStatus, searchQuery]);

  const hasFilters = selectedStatus !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="payments"
        description="Every successful charge: checkouts, renewals and upgrades. Click any payment to view full fee breakdowns and audit logs."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "list" ? "analytics" : "list")}
              className="gap-1.5 cursor-pointer rounded-xl h-9 px-3 text-xs"
            >
              <BarChart3 className="size-3.5 text-[#635BFF]" />
              {viewMode === "list" ? "Analytics" : "Transactions"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(true)}
              className="gap-1.5 cursor-pointer rounded-xl h-9 px-3 text-xs"
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        }
      />

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1.5 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            viewMode === "list"
              ? "bg-white text-ink shadow-2xs font-semibold border border-line"
              : "text-mute hover:text-ink hover:bg-wash"
          }`}
        >
          All payments
        </button>
        <button
          type="button"
          onClick={() => setViewMode("analytics")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            viewMode === "analytics"
              ? "bg-white text-ink shadow-2xs font-semibold border border-line"
              : "text-mute hover:text-ink hover:bg-wash"
          }`}
        >
          <BarChart3 className="size-3.5 text-[#635BFF]" />
          Payments analytics
        </button>
      </div>

      {viewMode === "analytics" ? (
        <PaymentsAnalyticsView />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-line bg-wash/60 p-1">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === "all"
                ? "bg-white text-ink shadow-xs"
                : "text-mute hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("succeeded")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === "succeeded"
                ? "bg-white text-ink shadow-xs"
                : "text-mute hover:text-ink"
            }`}
          >
            Succeeded
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("refunded")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === "refunded"
                ? "bg-white text-ink shadow-xs"
                : "text-mute hover:text-ink"
            }`}
          >
            Refunded
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-mute" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, payment ID…"
            className="pl-8.5 pr-8 h-9 text-xs rounded-xl bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <Disputes />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}

      {/* Empty State when no payments exist at all */}
      {data && data.data.length === 0 && !hasFilters && (
        <Empty title="No payments yet">
          Payments appear here automatically as soon as customers complete a checkout.
        </Empty>
      )}

      {/* Empty State when filters yield no matches */}
      {data && filteredPayments.length === 0 && hasFilters && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="text-sm font-medium text-ink">No matching payments found</p>
          <p className="mt-1 text-xs text-mute">
            Try adjusting your search query or status filter.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus("all");
              setSearchQuery("");
            }}
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Payments Table */}
      {data && filteredPayments.length > 0 && (
        <Table
          head={[
            "Amount",
            "Status",
            "Customer",
            "Processor / Rail",
            "Fees (Stripe / VRS)",
            "Date",
            "",
          ]}
        >
          {filteredPayments.map((p) => (
            <TableRow
              key={p.id}
              onClick={() => setActivePayment(p)}
              className="cursor-pointer hover:bg-wash/70 transition-colors group"
            >
              <TableCell className="px-4">
                <p className="font-mono font-medium text-ink">
                  {formatMoney(p.amount, p.currency)}
                </p>
                <p className="font-mono text-[11px] text-mute group-hover:text-brand-600 transition-colors">
                  {shortId(p.id)}
                </p>
              </TableCell>

              <TableCell className="px-4">
                <Badge status={p.status} />
                {p.amount_refunded > 0 && (
                  <p className="mt-1 text-xs text-rose-600">
                    -{formatMoney(p.amount_refunded, p.currency)}
                  </p>
                )}
              </TableCell>

              <TableCell className="px-4 text-ink-soft">
                <span className="truncate max-w-[200px] block">
                  {p.customer_email ?? "—"}
                </span>
              </TableCell>

              <TableCell className="px-4">
                <div className="flex items-center gap-1.5 text-xs text-ink-soft capitalize">
                  <CreditCard className="size-3.5 text-mute" />
                  <span>{p.provider}</span>
                </div>
              </TableCell>

              <TableCell className="px-4 font-mono text-xs text-mute">
                {formatMoney(p.provider_fee, p.currency)} /{" "}
                {formatMoney(p.platform_fee, p.currency)}
              </TableCell>

              <TableCell className="px-4 whitespace-nowrap text-xs text-mute">
                {formatDateTime(p.created)}
              </TableCell>

              <TableCell
                className="px-4 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-2">
                  <RefundControl payment={p} onDone={reload} />
                  <button
                    type="button"
                    onClick={() => setActivePayment(p)}
                    className="p-1 text-mute group-hover:text-ink transition-colors cursor-pointer"
                    title="View details"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </>
  )}

      {/* Payment Detail Slide-out / Modal */}
      <PaymentDetailDialog
        payment={activePayment}
        open={Boolean(activePayment)}
        onOpenChange={(open) => !open && setActivePayment(null)}
        onDone={reload}
      />

      {/* CSV Export Dialog */}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        currentStatus={selectedStatus}
        currentSearch={searchQuery}
        totalFilteredCount={filteredPayments.length}
      />
    </div>
  );
}
