"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../badge";
import { formatDateTime, formatMoney, shortId } from "../format";
import type { Payment } from "../types";
import { useDashboard } from "../context";
import { dashboardFetch } from "../api";
import { RefundControl } from "./refund-control";

export function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
  onDone,
}: {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const { apiUrl, scope } = useDashboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Payment | null>(payment);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDetail(payment);
    if (!payment || !open) return;

    let unmounted = false;
    setLoading(true);

    dashboardFetch<Payment>(apiUrl, `/v1/payments/${payment.id}`, scope)
      .then((data) => {
        if (!unmounted && data) {
          setDetail(data);
        }
      })
      .catch(() => {
        // Fall back to initial payment object
      })
      .finally(() => {
        if (!unmounted) setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [payment, open, apiUrl, scope]);

  if (!payment) return null;

  const current = detail ?? payment;
  const netAmount = current.net ?? (current.amount - current.provider_fee - current.platform_fee);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-line bg-white p-7 sm:p-8 shadow-2xl">
        <DialogHeader className="gap-2 border-b border-line pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Badge status={current.status} />
              <span className="font-mono text-xs text-mute">
                {current.id}
              </span>
              <button
                type="button"
                onClick={() => copyText(current.id, "payment_id")}
                className="text-mute hover:text-ink transition-colors cursor-pointer"
                title="Copy payment ID"
              >
                {copiedId === "payment_id" ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <RefundControl payment={current} onDone={() => { onDone(); onOpenChange(false); }} />
            </div>
          </div>

          <div className="mt-3">
            <DialogTitle className="text-3xl font-semibold tracking-tight text-ink">
              {formatMoney(current.amount, current.currency)}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-mute flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Captured on {formatDateTime(current.created)}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Fee & Net Payout Breakdown */}
          <div className="rounded-2xl border border-line bg-wash/50 p-5 space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-mute">
              Fee & Payout Breakdown
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-ink">
                <span>Gross charge</span>
                <span className="font-mono">+{formatMoney(current.amount, current.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-mute text-xs">
                <span>Stripe processing fee</span>
                <span className="font-mono">-{formatMoney(current.provider_fee, current.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-mute text-xs">
                <span>VRS Pay platform fee</span>
                <span className="font-mono">-{formatMoney(current.platform_fee, current.currency)}</span>
              </div>
              {current.amount_refunded > 0 && (
                <div className="flex justify-between items-center text-rose-600 text-xs border-t border-line/60 pt-2">
                  <span>Refunded to customer</span>
                  <span className="font-mono">-{formatMoney(current.amount_refunded, current.currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-ink font-semibold border-t border-line pt-2.5">
                <span>Net expected payout</span>
                <span className="font-mono text-emerald-600">
                  {formatMoney(netAmount, current.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Processor Details */}
          <div className="rounded-2xl border border-line p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-mute">
              Payment Method & Processor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-mute">Processor</span>
                <div className="flex items-center gap-1.5 font-medium text-ink capitalize">
                  <CreditCard className="size-3.5 text-brand-600" />
                  <span>{current.provider}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-mute">Processor Reference</span>
                <div className="flex items-center gap-1.5 font-mono text-ink">
                  <span className="truncate max-w-[180px]">{current.provider_reference ?? "—"}</span>
                  {current.provider_reference && (
                    <button
                      type="button"
                      onClick={() => copyText(current.provider_reference!, "ref")}
                      className="text-mute hover:text-ink cursor-pointer"
                      title="Copy reference"
                    >
                      {copiedId === "ref" ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {current.checkout_session && (
                <div className="space-y-1">
                  <span className="text-mute">Checkout Session</span>
                  <p className="font-mono text-ink">{current.checkout_session}</p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-mute">Currency</span>
                <p className="font-mono uppercase text-ink">{current.currency}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="rounded-2xl border border-line p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-mute">
              Customer Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-mute">Email address</span>
                <div className="flex items-center gap-1.5 font-medium text-ink">
                  <User className="size-3.5 text-mute" />
                  <span>{current.customer_email ?? "Not provided"}</span>
                </div>
              </div>
              {current.customer && (
                <div className="space-y-1">
                  <span className="text-mute">Customer ID</span>
                  <p className="font-mono text-ink">{current.customer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Refund History (if any) */}
          {current.refunds && current.refunds.length > 0 && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-700">
                <RotateCcw className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Refund History ({current.refunds.length})
                </p>
              </div>
              <div className="divide-y divide-rose-100 text-xs">
                {current.refunds.map((rf) => (
                  <div key={rf.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-ink">{rf.id}</p>
                      <p className="text-mute text-[11px]">{formatDateTime(rf.created)}</p>
                      {rf.reason && (
                        <p className="text-mute text-[11px] italic">Reason: {rf.reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-rose-700">
                        -{formatMoney(rf.amount, rf.currency)}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 uppercase font-medium">
                        {rf.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit / Timeline Event List */}
          <div className="rounded-2xl border border-line p-5 space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-mute">
              Event Timeline
            </p>
            <div className="relative pl-6 space-y-4 border-l border-line text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <p className="font-medium text-ink">Payment Captured</p>
                <p className="text-mute">{formatDateTime(current.created)}</p>
              </div>
              {current.amount_refunded > 0 && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 size-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
                  <p className="font-medium text-ink">Refund Processed</p>
                  <p className="text-mute">
                    {formatMoney(current.amount_refunded, current.currency)} returned
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
