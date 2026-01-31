"use client";

import { useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            2
          </span>
          Phần Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario */}
        {testingPart.scenario && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Tình huống
            </h3>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">
              {testingPart.scenario}
            </p>
          </div>
        )}

        {/* Requirements */}
        {testingPart.requirements && testingPart.requirements.length > 0 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Yêu cầu</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
              {testingPart.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Question */}
        {testingPart.question && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Câu hỏi</h3>
            <p className="text-sm text-amber-700">{testingPart.question}</p>
            <p className="text-xs text-amber-600 mt-2">
              Điểm tối đa: {testingPart.max_points ?? 50}
            </p>
          </div>
        )}

        {/* Technique Selection */}
        <div className="space-y-2">
          <Label htmlFor="technique">Chọn kỹ thuật kiểm thử</Label>
          <Select
            value={testingAnswers.technique ?? ""}
            onValueChange={handleTechniqueChange}
          >
            <SelectTrigger id="technique" className="w-full cursor-pointer">
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
        <div className="space-y-2">
          <Label htmlFor="explanation">Giải thích lý do chọn kỹ thuật</Label>
          <Textarea
            id="explanation"
            value={testingAnswers.explanation ?? ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleExplanationChange(e.target.value)
            }
            placeholder="Giải thích tại sao bạn chọn kỹ thuật này..."
            className="min-h-[100px] resize-y"
          />
        </div>

        {/* Test Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>
              Test Cases ({testCases.length}/{MAX_TEST_CASES})
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTestCase}
              disabled={testCases.length >= MAX_TEST_CASES}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm test case
            </Button>
          </div>

          {testCases.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">
                Chưa có test case nào. Click &quot;Thêm test case&quot; để bắt
                đầu.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Test Case #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTestCase(index)}
                      className="text-destructive hover:bg-destructive/10 cursor-pointer h-8 w-8 p-0 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
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
                      />
                    </div>
                    <div className="space-y-1">
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
