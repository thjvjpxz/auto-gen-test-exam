"use client";

import { useState, useMemo } from "react";
import {
  Lightbulb,
  Lock,
  Coins,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useProgression } from "@/hooks/use-progression";
import type { HintCatalogItem } from "@/types";

interface HintButtonProps {
  questionKey: string;
  hints: HintCatalogItem[];
  onPurchase: (hintLevel: number) => void;
  isPurchasing?: boolean;
  className?: string;
}

/**
 * Hint purchase button with stepper-based progressive disclosure.
 * Shows one hint level at a time with clear visual progression.
 */
export function HintButton({
  hints,
  onPurchase,
  isPurchasing = false,
  className,
}: HintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: progression } = useProgression();

  const coinBalance = progression?.coin_balance ?? 0;
  const purchasedCount = hints.filter((h) => h.is_purchased).length;
  const totalHints = hints.length;

  const nextAvailableLevel = useMemo(() => {
    const firstUnpurchased = hints.find((h) => !h.is_purchased);
    return firstUnpurchased?.level ?? hints.length;
  }, [hints]);

  const currentHint = hints.find((h) => h.level === nextAvailableLevel);

  if (!hints || hints.length === 0) return null;

  const handlePurchase = () => {
    if (currentHint && !currentHint.is_purchased) {
      onPurchase(currentHint.level);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "group relative cursor-pointer gap-2 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50",
            purchasedCount > 0 && "border-amber-300 bg-amber-50/50",
            className,
          )}
        >
          <Lightbulb
            className={cn(
              "size-4 transition-colors",
              purchasedCount > 0
                ? "text-amber-600"
                : "text-muted-foreground group-hover:text-amber-600",
            )}
          />
          <span className="text-sm">
            Gợi ý {purchasedCount > 0 && `(${purchasedCount}/${totalHints})`}
          </span>
          {purchasedCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 size-5 rounded-full bg-amber-600 p-0 text-xs"
            >
              {purchasedCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="space-y-0">
          <div className="border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Gợi ý có sẵn</h4>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Coins className="size-3 text-amber-600" />
                <span className="font-medium">
                  {coinBalance.toLocaleString()}
                </span>
              </div>
            </div>
            <HintStepper hints={hints} currentLevel={nextAvailableLevel} />
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait">
              {currentHint && (
                <HintLevelCard
                  key={currentHint.level}
                  hint={currentHint}
                  coinBalance={coinBalance}
                  onPurchase={handlePurchase}
                  isPurchasing={isPurchasing}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="border-t bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="size-3 shrink-0" />
              <p>Mua gợi ý sẽ trừ coin từ số dư của bạn</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface HintStepperProps {
  hints: HintCatalogItem[];
  currentLevel: number;
}

/**
 * Visual stepper showing hint progression (1 → 2 → 3).
 * Display-only, shows current available level.
 */
function HintStepper({ hints, currentLevel }: HintStepperProps) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {hints.map((hint, index) => {
        const isActive = hint.level === currentLevel;
        const isPurchased = hint.is_purchased;
        const isLocked = hint.is_locked;
        return (
          <div key={hint.level} className="flex items-center gap-2">
            <div
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                isPurchased && "border-green-500 bg-green-50 text-green-700",
                isActive &&
                  !isPurchased &&
                  "border-amber-500 bg-amber-50 text-amber-700",
                !isActive &&
                  !isPurchased &&
                  !isLocked &&
                  "border-gray-300 bg-white text-gray-500",
                isLocked && "border-gray-200 bg-gray-50 text-gray-400",
              )}
            >
              {isPurchased ? (
                <CheckCircle2 className="size-4" />
              ) : isLocked ? (
                <Lock className="size-3" />
              ) : (
                <span className="text-xs font-semibold">{hint.level}</span>
              )}
              {isActive && !isPurchased && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            {index < hints.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 transition-colors duration-200",
                  isPurchased ? "bg-green-500" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface HintLevelCardProps {
  hint: HintCatalogItem;
  coinBalance: number;
  onPurchase: () => void;
  isPurchasing: boolean;
}

/**
 * Card displaying single hint level with purchase action.
 */
function HintLevelCard({
  hint,
  coinBalance,
  onPurchase,
  isPurchasing,
}: HintLevelCardProps) {
  const canAfford = coinBalance >= hint.cost;
  const isDisabled = hint.is_locked || !canAfford || isPurchasing;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-lg border-2 p-4 transition-all duration-200",
        hint.is_purchased && "border-green-300 bg-green-50",
        !hint.is_purchased &&
          !hint.is_locked &&
          "border-amber-200 bg-amber-50/30",
        hint.is_locked && "border-gray-200 bg-gray-50",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge
          variant={hint.is_purchased ? "default" : "outline"}
          className={cn(
            "text-xs",
            hint.is_purchased && "bg-green-600",
            hint.is_locked && "bg-muted",
          )}
        >
          Level {hint.level}
        </Badge>
        {hint.is_purchased && (
          <Badge variant="default" className="bg-green-600 text-xs">
            Đã mua
          </Badge>
        )}
      </div>

      {hint.is_purchased && hint.content && (
        <div className="rounded-md bg-white p-3">
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {hint.content}
          </p>
        </div>
      )}
      {hint.is_locked ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3 shrink-0" />
          <p>Mua gợi ý trước để mở khóa</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={onPurchase}
            disabled={isDisabled}
            className={cn(
              "w-full cursor-pointer gap-2",
              canAfford && "bg-amber-600 hover:bg-amber-700",
            )}
          >
            <Coins className="size-4" />
            Mua ({hint.cost} coins)
          </Button>
          {!canAfford && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="size-3 shrink-0" />
              <p>Không đủ coin</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
