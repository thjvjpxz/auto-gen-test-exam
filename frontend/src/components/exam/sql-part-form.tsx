"use client";

import { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Database, Code2, HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import { useHintCatalog, usePurchasedHints } from "@/hooks/use-hint-catalog";
import { usePurchaseHint } from "@/hooks/use-purchase-hint";
import { HintButton } from "./hint-button";
import { HintPanel } from "./hint-panel";
import type { ExamData } from "@/types";

const MermaidRenderer = dynamic(
  () => import("./mermaid-renderer").then((m) => m.MermaidRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg bg-muted/50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Đang tải sơ đồ...</p>
        </div>
      </div>
    ),
  },
);

interface SqlPartFormProps {
  sqlPart: ExamData["sql_part"];
}

/**
 * SQL Part form with ERD diagram and answer textareas.
 */
export function SqlPartForm({ sqlPart }: SqlPartFormProps) {
  const updateSqlAnswer = useExamAttemptStore((s) => s.updateSqlAnswer);
  const answers = useExamAttemptStore((s) => s.answers);
  const attemptId = useExamAttemptStore((s) => s.attemptId);
  const examId = useExamAttemptStore((s) => s.examId);

  const sqlAnswers = useMemo(() => answers.sql_part ?? {}, [answers.sql_part]);

  const { data: hintCatalog } = useHintCatalog(examId);
  const { data: purchasedHints = [] } = usePurchasedHints(attemptId);
  const { mutate: purchaseHint, isPending: isPurchasing } = usePurchaseHint();

  const erdDiagram = sqlPart?.mermaid_code ?? sqlPart?.erd_diagram;
  const question1 = sqlPart?.questions?.[0] ?? sqlPart?.question_1;
  const question2 = sqlPart?.questions?.[1] ?? sqlPart?.question_2;

  const handlePurchaseHint = useCallback(
    (questionKey: string, hintLevel: number) => {
      if (!attemptId) return;
      purchaseHint({
        attemptId,
        request: { question_key: questionKey, hint_level: hintLevel },
      });
    },
    [attemptId, purchaseHint],
  );

  if (!sqlPart) return null;

  const handleChange = (key: string, value: string) => {
    updateSqlAnswer(key, value);
  };

  return (
    <Card className="overflow-hidden border-2 transition-shadow duration-300 hover:shadow-md">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            1
          </div>
          <span>Phần SQL</span>
          <Database className="size-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* ERD Diagram */}
        {erdDiagram && (
          <div className="overflow-hidden rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Database className="size-4" />
              Sơ đồ ERD
            </h3>
            <MermaidRenderer chart={erdDiagram} />
          </div>
        )}

        {/* Context */}
        {sqlPart.context && (
          <div className="overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-800">
              <HelpCircle className="size-4" />
              Bối cảnh
            </h3>
            <p className="whitespace-pre-wrap text-sm text-blue-700">
              {sqlPart.context}
            </p>
          </div>
        )}

        {/* Question 1 */}
        {question1 && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                1
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Label htmlFor="sql_q1" className="text-base font-medium">
                    {question1}
                  </Label>
                  {hintCatalog?.["sql.question_1"] && (
                    <HintButton
                      questionKey="sql.question_1"
                      hints={hintCatalog["sql.question_1"]}
                      onPurchase={(level) =>
                        handlePurchaseHint("sql.question_1", level)
                      }
                      isPurchasing={isPurchasing}
                    />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Điểm tối đa: {sqlPart.question_1_points ?? 25}
                  </span>
                </div>
              </div>
            </div>
            <HintPanel
              questionKey="sql.question_1"
              purchasedHints={purchasedHints}
            />
            <div className="group relative">
              <Code2 className="absolute left-3 top-3 size-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
              <Textarea
                id="sql_q1"
                value={sqlAnswers.question_1_answer ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange("question_1_answer", e.target.value)
                }
                placeholder="Nhập câu lệnh SQL của bạn..."
                className="min-h-[120px] resize-y pl-10 font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Question 2 */}
        {question2 && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                2
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Label htmlFor="sql_q2" className="text-base font-medium">
                    {question2}
                  </Label>
                  {hintCatalog?.["sql.question_2"] && (
                    <HintButton
                      questionKey="sql.question_2"
                      hints={hintCatalog["sql.question_2"]}
                      onPurchase={(level) =>
                        handlePurchaseHint("sql.question_2", level)
                      }
                      isPurchasing={isPurchasing}
                    />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Điểm tối đa: {sqlPart.question_2_points ?? 25}
                  </span>
                </div>
              </div>
            </div>
            <HintPanel
              questionKey="sql.question_2"
              purchasedHints={purchasedHints}
            />
            <div className="group relative">
              <Code2 className="absolute left-3 top-3 size-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
              <Textarea
                id="sql_q2"
                value={sqlAnswers.question_2_answer ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange("question_2_answer", e.target.value)
                }
                placeholder="Nhập câu lệnh SQL của bạn..."
                className="min-h-[120px] resize-y pl-10 font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
