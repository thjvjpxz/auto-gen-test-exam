"use client";

import { useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  FlaskConical,
  FileText,
  ListChecks,
  Lightbulb,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { ExamData, TestCaseItem } from "@/types";

const TESTING_TECHNIQUES = [
  { value: "equivalence_partitioning", label: "Equivalence Partitioning (EP)" },
  { value: "boundary_value_analysis", label: "Boundary Value Analysis (BVA)" },
  { value: "decision_table", label: "Decision Table Testing" },
  { value: "state_transition", label: "State Transition Testing" },
  { value: "use_case", label: "Use Case Testing" },
];

const MAX_TEST_CASES = 20;

interface TestingPartFormProps {
  testingPart: ExamData["testing_part"];
}

/**
 * Testing Part form with technique selection and dynamic test cases.
 */
export function TestingPartForm({ testingPart }: TestingPartFormProps) {
  const updateTestingAnswer = useExamAttemptStore((s) => s.updateTestingAnswer);
  const answers = useExamAttemptStore((s) => s.answers);

  const testingAnswers = useMemo(
    () => answers.testing_part ?? { test_cases: [] },
    [answers.testing_part],
  );

  const testCases = useMemo<TestCaseItem[]>(
    () => testingAnswers.test_cases ?? [],
    [testingAnswers.test_cases],
  );

  const handleTechniqueChange = useCallback(
    (value: string) => {
      updateTestingAnswer("technique", value);
    },
    [updateTestingAnswer],
  );

  const handleExplanationChange = useCallback(
    (value: string) => {
      updateTestingAnswer("explanation", value);
    },
    [updateTestingAnswer],
  );

  const handleAddTestCase = useCallback(() => {
    if (testCases.length >= MAX_TEST_CASES) return;
    const newTestCases = [...testCases, { input: "", expected_output: "" }];
    updateTestingAnswer("test_cases", newTestCases);
  }, [testCases, updateTestingAnswer]);

  const handleRemoveTestCase = useCallback(
    (index: number) => {
      const newTestCases = testCases.filter((_, i) => i !== index);
      updateTestingAnswer("test_cases", newTestCases);
    },
    [testCases, updateTestingAnswer],
  );

  const handleTestCaseChange = useCallback(
    (index: number, field: keyof TestCaseItem, value: string) => {
      const newTestCases = testCases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc,
      );
      updateTestingAnswer("test_cases", newTestCases);
    },
    [testCases, updateTestingAnswer],
  );

  if (!testingPart) return null;

  return (
    <Card className="overflow-hidden border-2 transition-shadow duration-300 hover:shadow-md">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />

      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-sm">
            2
          </div>
          <span>Phần Testing</span>
          <FlaskConical className="size-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Scenario */}
        {testingPart.scenario && (
          <div className="overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-800">
              <FileText className="size-4" />
              Tình huống
            </h3>
            <p className="whitespace-pre-wrap text-sm text-blue-700">
              {testingPart.scenario}
            </p>
          </div>
        )}

        {/* Requirements */}
        {testingPart.requirements && testingPart.requirements.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <ListChecks className="size-4" />
              Yêu cầu
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {testingPart.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question */}
        {testingPart.question && (
          <div className="overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
              <Lightbulb className="size-4" />
              Câu hỏi
            </h3>
            <p className="text-sm text-amber-700">{testingPart.question}</p>
            <div className="mt-3">
              <span className="rounded-full bg-amber-200/50 px-2.5 py-1 text-xs font-medium text-amber-800">
                Điểm tối đa: {testingPart.max_points ?? 50}
              </span>
            </div>
          </div>
        )}

        {/* Technique Selection */}
        <div className="space-y-3">
          <Label
            htmlFor="technique"
            className="flex items-center gap-2 text-base font-medium"
          >
            Chọn kỹ thuật kiểm thử
          </Label>
          <Select
            value={testingAnswers.technique ?? ""}
            onValueChange={handleTechniqueChange}
          >
            <SelectTrigger
              id="technique"
              className="w-full cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            >
              <SelectValue placeholder="Chọn kỹ thuật..." />
            </SelectTrigger>
            <SelectContent>
              {TESTING_TECHNIQUES.map((tech) => (
                <SelectItem
                  key={tech.value}
                  value={tech.value}
                  className="cursor-pointer"
                >
                  {tech.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Explanation */}
        <div className="space-y-3">
          <Label htmlFor="explanation" className="text-base font-medium">
            Giải thích lý do chọn kỹ thuật
          </Label>
          <Textarea
            id="explanation"
            value={testingAnswers.explanation ?? ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleExplanationChange(e.target.value)
            }
            placeholder="Giải thích tại sao bạn chọn kỹ thuật này..."
            className="min-h-[100px] resize-y transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Test Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-medium">
              Test Cases
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {testCases.length}/{MAX_TEST_CASES}
              </span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTestCase}
              disabled={testCases.length >= MAX_TEST_CASES}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary/50"
            >
              <Plus className="mr-1 size-4" />
              Thêm test case
            </Button>
          </div>

          {testCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-8 text-center transition-colors duration-200 hover:border-primary/30 hover:bg-muted/30">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Plus className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Chưa có test case nào. Click &quot;Thêm test case&quot; để bắt
                đầu.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="group overflow-hidden rounded-lg border bg-muted/30 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">
                        {index + 1}
                      </span>
                      Test Case
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTestCase(index)}
                      className="size-8 cursor-pointer p-0 text-destructive opacity-0 transition-all duration-200 hover:bg-destructive/10 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`input-${index}`}
                        className="text-xs text-muted-foreground"
                      >
                        Input
                      </Label>
                      <Input
                        id={`input-${index}`}
                        value={testCase.input}
                        onChange={(e) =>
                          handleTestCaseChange(index, "input", e.target.value)
                        }
                        placeholder="Giá trị đầu vào..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`output-${index}`}
                        className="text-xs text-muted-foreground"
                      >
                        Expected Output
                      </Label>
                      <Input
                        id={`output-${index}`}
                        value={testCase.expected_output}
                        onChange={(e) =>
                          handleTestCaseChange(
                            index,
                            "expected_output",
                            e.target.value,
                          )
                        }
                        placeholder="Kết quả mong đợi..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
