"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProgression } from "@/hooks/use-progression";

interface CoinBadgeProps {
  variant?: "compact" | "detailed";
  className?: string;
}

export function CoinBadge({ variant = "compact", className }: CoinBadgeProps) {
  const { data: progression, isLoading } = useProgression();
  const [displayBalance, setDisplayBalance] = useState(0);

  const coinBalance = progression?.coin_balance ?? 0;

  useEffect(() => {
    if (coinBalance === displayBalance) return;

    const diff = Math.abs(coinBalance - displayBalance);

    if (diff > 100) {
      setDisplayBalance(coinBalance);
      return;
    }

    const duration = 800;
    const steps = 20;
    const increment = (coinBalance - displayBalance) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayBalance(coinBalance);
        clearInterval(timer);
      } else {
        setDisplayBalance((prev) => Math.round(prev + increment));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [coinBalance, displayBalance]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5",
          className,
        )}
      >
        <Coins className="size-4 animate-pulse text-amber-600" />
        <span className="text-sm font-medium text-amber-900">...</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
            <Coins className="size-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
            <motion.p
              key={displayBalance}
              initial={{ scale: 1.2, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#78350f" }}
              className="text-2xl font-bold tabular-nums"
            >
              {displayBalance.toLocaleString()}
            </motion.p>
          </div>
        </div>
        {progression && (
          <div className="grid grid-cols-2 gap-2 border-t border-amber-200 pt-2 text-xs">
            <div>
              <p className="text-muted-foreground">Tổng kiếm được</p>
              <p className="font-semibold text-green-700">
                +{progression.lifetime_earned.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tổng chi tiêu</p>
              <p className="font-semibold text-red-700">
                -{progression.lifetime_spent.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 shadow-sm transition-shadow hover:shadow-md",
              className,
            )}
          >
            <Coins className="size-4 text-amber-600" />
            <motion.span
              key={displayBalance}
              initial={{ scale: 1.2, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#78350f" }}
              className="font-semibold tabular-nums text-amber-900"
            >
              {displayBalance.toLocaleString()}
            </motion.span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-semibold">Số dư Coin</p>
            {progression && (
              <>
                <p className="text-muted-foreground">
                  Kiếm được: +{progression.lifetime_earned.toLocaleString()}
                </p>
                <p className="text-muted-foreground">
                  Chi tiêu: -{progression.lifetime_spent.toLocaleString()}
                </p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
