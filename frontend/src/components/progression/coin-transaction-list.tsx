"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/date";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoinTransactions } from "@/hooks/use-progression";
import type { CoinTransaction } from "@/types";

interface CoinTransactionListProps {
  className?: string;
  pageSize?: number;
}

export function CoinTransactionList({
  className,
  pageSize = 20,
}: CoinTransactionListProps) {
  const [page, setPage] = useState(0);
  const offset = page * pageSize;

  const { data: response, isLoading } = useCoinTransactions(pageSize, offset);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const transactions = response?.transactions ?? [];

  if (!transactions || transactions.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-muted-foreground">Chưa có giao dịch nào</p>
      </div>
    );
  }

  const hasNextPage = transactions.length === pageSize;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {(page > 0 || hasNextPage) && (
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="mr-1 size-4" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
          >
            Sau
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: CoinTransaction }) {
  const isEarned = transaction.type === "exam_reward";
  const Icon = isEarned ? ArrowUpCircle : ArrowDownCircle;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            isEarned ? "bg-green-100" : "bg-red-100",
          )}
        >
          <Icon
            className={cn(
              "size-5",
              isEarned ? "text-green-600" : "text-red-600",
            )}
          />
        </div>
        <div>
          <p className="font-medium">
            {isEarned ? "Phần thưởng từ bài thi" : "Mua gợi ý"}
          </p>
          <p className="text-sm text-muted-foreground">
            {transaction.meta?.exam_title && (
              <span>{transaction.meta.exam_title}</span>
            )}
            {transaction.meta?.question_key && (
              <span>
                {" "}
                • {transaction.meta.question_key} (Level{" "}
                {transaction.meta.hint_level})
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(transaction.created_at)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <Badge
          variant={isEarned ? "default" : "destructive"}
          className={cn(
            "font-mono text-sm",
            isEarned && "bg-green-600 hover:bg-green-700",
          )}
        >
          {isEarned ? "+" : "-"}
          {Math.abs(transaction.amount).toLocaleString()}
        </Badge>
        <p className="mt-1 text-xs text-muted-foreground">
          Số dư: {transaction.balance_after.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
