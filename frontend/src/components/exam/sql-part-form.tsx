"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { ExamData } from "@/types";

const MermaidRenderer = dynamic(
  () => import("./mermaid-renderer").then((m) => m.MermaidRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-slate-100 animate-pulse rounded-md" />
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

  const sqlAnswers = useMemo(() => answers.sql_part ?? {}, [answers.sql_part]);

  if (!sqlPart) return null;

  const handleChange = (key: string, value: string) => {
    updateSqlAnswer(key, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            1
          </span>
          Phần SQL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ERD Diagram */}
        {sqlPart.erd_diagram && (
          <div className="border rounded-lg p-4 bg-slate-50">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Sơ đồ ERD
            </h3>
            <MermaidRenderer chart={sqlPart.erd_diagram} />
          </div>
        )}

        {/* Context */}
        {sqlPart.context && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Bối cảnh</h3>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">
              {sqlPart.context}
            </p>
          </div>
        )}

        {/* Question 1 */}
        {sqlPart.question_1 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="shrink-0 h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-medium">
                1
              </span>
              <div>
                <Label htmlFor="sql_q1" className="text-base font-medium">
                  {sqlPart.question_1}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Điểm tối đa: {sqlPart.question_1_points ?? 25}
                </p>
              </div>
            </div>
            <Textarea
              id="sql_q1"
              value={sqlAnswers.question_1_answer ?? ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("question_1_answer", e.target.value)
              }
              placeholder="Nhập câu lệnh SQL của bạn..."
              className="font-mono text-sm min-h-[120px] resize-y"
            />
          </div>
        )}

        {/* Question 2 */}
        {sqlPart.question_2 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="shrink-0 h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-medium">
                2
              </span>
              <div>
                <Label htmlFor="sql_q2" className="text-base font-medium">
                  {sqlPart.question_2}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Điểm tối đa: {sqlPart.question_2_points ?? 25}
                </p>
              </div>
            </div>
            <Textarea
              id="sql_q2"
              value={sqlAnswers.question_2_answer ?? ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("question_2_answer", e.target.value)
              }
              placeholder="Nhập câu lệnh SQL của bạn..."
              className="font-mono text-sm min-h-[120px] resize-y"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
