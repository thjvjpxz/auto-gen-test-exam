"use client";

import { Lightbulb, Coins, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Hint {
  level: number;
  cost: number;
  preview: string;
  content: string;
}

interface HintCatalog {
  [key: string]: Hint[];
}

interface HintCatalogPreviewProps {
  hintsCatalog: HintCatalog;
}

const levelColors = {
  1: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "text-blue-600",
  },
  2: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: "text-purple-600",
  },
  3: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-600",
  },
};

const questionLabels: Record<string, string> = {
  "sql.question_1": "Câu hỏi SQL 1",
  "sql.question_2": "Câu hỏi SQL 2",
  "sql.question_3": "Câu hỏi SQL 3",
  "testing.question_1": "Câu hỏi Testing",
};

export function HintCatalogPreview({ hintsCatalog }: HintCatalogPreviewProps) {
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  const toggleHint = (hintKey: string) => {
    setExpandedHints((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hintKey)) {
        newSet.delete(hintKey);
      } else {
        newSet.add(hintKey);
      }
      return newSet;
    });
  };

  const questionKeys = Object.keys(hintsCatalog).sort();

  if (questionKeys.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Lightbulb className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Chưa có gợi ý
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Đề thi này chưa có hints catalog
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questionKeys.map((questionKey, qIndex) => {
        const hints = hintsCatalog[questionKey];
        const questionLabel =
          questionLabels[questionKey] || questionKey.replace(/\./g, " ");

        return (
          <Card
            key={questionKey}
            className="overflow-hidden border-0 shadow-sm"
          >
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Lightbulb className="size-4 text-primary" />
                {questionLabel}
                <Badge variant="secondary" className="ml-auto">
                  {hints.length} hints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {hints.map((hint, hIndex) => {
                  const hintKey = `${questionKey}-${hint.level}`;
                  const isExpanded = expandedHints.has(hintKey);
                  const colors = levelColors[hint.level as 1 | 2 | 3];

                  return (
                    <motion.div
                      key={hintKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: qIndex * 0.1 + hIndex * 0.05,
                        duration: 0.2,
                      }}
                      className="p-4 transition-colors duration-150 hover:bg-muted/30"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${colors.bg}`}
                        >
                          <Lightbulb className={`size-5 ${colors.icon}`} />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${colors.border} ${colors.text} border`}
                                >
                                  Level {hint.level}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <Coins className="size-3" />
                                  {hint.cost} coins
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm font-medium text-foreground">
                                {hint.preview}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleHint(hintKey)}
                              className="cursor-pointer shrink-0"
                              aria-label={
                                isExpanded ? "Thu gọn" : "Xem chi tiết"
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="size-4" />
                              ) : (
                                <ChevronDown className="size-4" />
                              )}
                            </Button>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className={`mt-3 rounded-lg border ${colors.border} ${colors.bg} p-4`}
                                >
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                    {hint.content}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
