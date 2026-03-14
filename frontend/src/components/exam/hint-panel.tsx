"use client";

import { Lightbulb, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PurchasedHint } from "@/types";

interface HintPanelProps {
  questionKey: string;
  purchasedHints: PurchasedHint[];
  className?: string;
}

export function HintPanel({
  questionKey,
  purchasedHints,
  className,
}: HintPanelProps) {
  const hintsForQuestion = purchasedHints.filter(
    (h) => h.question_key === questionKey,
  );

  if (hintsForQuestion.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
        className,
      )}
    >
      <div className="border-b border-amber-200 bg-amber-100/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-600" />
          <h4 className="font-semibold text-sm text-amber-900">Gợi ý đã mua</h4>
          <Badge variant="default" className="bg-amber-600 text-xs">
            {hintsForQuestion.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <AnimatePresence mode="popLayout">
          {hintsForQuestion
            .sort((a, b) => a.hint_level - b.hint_level)
            .map((hint) => (
              <motion.div
                key={hint.hint_level}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-amber-200 bg-white p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="size-4 text-amber-600" />
                  <Badge variant="outline" className="text-xs">
                    Level {hint.hint_level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    (-{hint.coin_cost} coins)
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-amber-900">
                  {hint.hint_content}
                </p>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
