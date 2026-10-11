"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { dashboardDownload } from "../api";
import { useDashboard } from "../context";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  currentSearch: string;
  totalFilteredCount: number;
}

export function ExportDialog({
  open,
  onOpenChange,
  currentStatus,
  currentSearch,
  totalFilteredCount,
}: ExportDialogProps) {
  const { apiUrl, scope } = useDashboard();
  const [exportScope, setExportScope] = useState<"filtered" | "all">("filtered");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setDownloading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "5000" });
      if (exportScope === "filtered") {
        if (currentStatus !== "all") {
          params.set("status", currentStatus === "refunded" ? "refunded" : "succeeded");
        }
        if (currentSearch.trim()) {
          params.set("search", currentSearch.trim());
        }
      }
      const exportPath = `/v1/payments/export?${params.toString()}`;
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `payments_${scope.mode}_${timestamp}.csv`;

      await dashboardDownload(apiUrl, exportPath, scope, filename);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
        onOpenChange(false);
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate CSV export.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Export payments</DialogTitle>
              <DialogDescription className="text-xs">
                Download payment records and fee breakdowns as CSV
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Export Range Selector */}
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="text-xs font-medium text-ink">Export range</legend>
            <div className="grid grid-cols-2 gap-2">
              <Button
                id="export-scope-filtered"
                type="button"
                variant="outline"
                onClick={() => setExportScope("filtered")}
                aria-pressed={exportScope === "filtered"}
                className={`h-auto flex flex-col items-start rounded-lg border p-3 text-left transition-colors cursor-pointer justify-start ${
                  exportScope === "filtered"
                    ? "border-accent bg-accent/5 text-ink shadow-2xs"
                    : "border-line bg-wash/30 text-mute hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className="text-xs font-semibold">Filtered view</span>
                <span className="text-[11px] text-mute mt-0.5">
                  {totalFilteredCount} payment{totalFilteredCount === 1 ? "" : "s"} matching filters
                </span>
              </Button>

              <Button
                id="export-scope-all"
                type="button"
                variant="outline"
                onClick={() => setExportScope("all")}
                aria-pressed={exportScope === "all"}
                className={`h-auto flex flex-col items-start rounded-lg border p-3 text-left transition-colors cursor-pointer justify-start ${
                  exportScope === "all"
                    ? "border-accent bg-accent/5 text-ink shadow-2xs"
                    : "border-line bg-wash/30 text-mute hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className="text-xs font-semibold">All payments</span>
                <span className="text-[11px] text-mute mt-0.5">Complete account history</span>
              </Button>
            </div>
          </fieldset>

          {/* Columns & Details Info */}
          <div className="rounded-lg border border-line bg-wash/40 p-3 space-y-2">
            <div className="text-xs font-medium text-ink flex items-center justify-between">
              <span>Included columns</span>
              <span className="text-[11px] text-mute">RFC 4180 CSV</span>
            </div>
            <p className="text-[11px] text-mute leading-relaxed">
              Payment ID, Timestamp (UTC), Status, Gross Amount, Currency, Expected Net Payout, Stripe
              Fee, VRS Fee, Amount Refunded, Customer Email, Provider Reference, and Checkout Session ID.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 border-t border-line pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={downloading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleExport}
            disabled={downloading || downloaded}
            className="gap-1.5"
          >
            {downloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Exporting...
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Exported
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
