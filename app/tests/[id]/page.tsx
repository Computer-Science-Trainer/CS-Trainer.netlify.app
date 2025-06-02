"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Textarea,
  addToast,
  Pagination,
} from "@heroui/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckListIcon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { DragHandleIcon } from "@/components/icons";
import { TestDetailsModal } from "@/components/TestDetailsModal";
import { makeApiRequest } from "@/config/api";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  question_type:
    | "single-choice"
    | "multiple-choice"
    | "open-ended"
    | "ordering";
}

function shuffle(array: string[]) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export default function TestRunnerPage() {
  const t = useTranslations();
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ref to store timer interval ID
  const timerRef = useRef<number | null>(null);
  // DnD sensors for ordering questions
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await makeApiRequest(`api/tests/${id}`, "GET");

        setTestData(data);
        const qArray = Array.isArray(data) ? data : (data.questions ?? []);

        // shuffle options for multi-choice and single-choice questions
        const shuffledQuestions = qArray.map((q: any) => ({
          ...q,
          options:
            q.question_type === "multiple-choice" ||
            q.question_type === "single-choice"
              ? shuffle(q.options)
              : q.options,
        }));

        setQuestions(shuffledQuestions);
        setEndTime(data.end_time ? new Date(data.end_time).getTime() : null);
        setStartTime(
          data.start_time ? new Date(data.start_time).getTime() : null,
        );
        setAnswers(
          shuffledQuestions.map((q: any) =>
            q.question_type === "ordering"
              ? shuffle(q.options)
              : q.question_type === "multiple-choice"
                ? []
                : [""],
          ),
        );
      } catch {
        addToast({
          title: t("tests.errors.ErrorTitle"),
          description: t("tests.errors.loadErrorDescription"),
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTest();
  }, [id, t]);

  useEffect(() => {
    if (!endTime) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const id = window.setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((endTime - now) / 1000));

      setTimeLeft(left);
      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        router.push("/404");
      }
    }, 1000);

    timerRef.current = id;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endTime, router]);
  // Handle drag end for ordering questions
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      const current = [...(answers[currentIndex] as string[])];
      const next = arrayMove(current, oldIndex, newIndex);

      updateAnswer(next);
    }
  };

  // Sortable item component for ordering
  function SortableItem({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    return (
      <div
        ref={setNodeRef}
        className="flex items-center gap-2 w-full"
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.7 : 1,
        }}
      >
        <div {...attributes} {...listeners} className="cursor-grab p-1">
          <DragHandleIcon />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  const updateAnswer = (value: any) => {
    setAnswers((prev) => {
      const copy = [...prev];

      copy[currentIndex] = value;

      return copy;
    });
  };

  const handleSubmit = async () => {
    // Stop the timer when submitting
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsSubmitting(true);
    try {
      const formattedAnswers = questions.map((q, idx) => {
        const raw = answers[idx];
        const answerArray = Array.isArray(raw) ? raw : [String(raw ?? "")];

        return {
          question_id: q.id,
          answer: answerArray,
        };
      });
      const res = await makeApiRequest(`api/tests/${id}/submit`, "POST", {
        answers: formattedAnswers,
      });

      setTestResult({
        ...testData,
        passed: res.passed,
        total: res.total,
        average: res.average,
        earned_score: res.earned_score,
      });
      setResultModalOpen(true);
    } catch {
      addToast({
        title: t("tests.errors.ErrorTitle"),
        description: t("tests.errors.loadErrorDescription"),
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label={t("loading")} size="lg" />
      </div>
    );
  }

  const question = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  // глобальная проверка: есть ли хоть один open-ended ответ длиннее 256
  const isTooLong = questions
    .map((q, i) =>
      q.question_type === "open-ended"
        ? ((answers[i] as string[])[0] || "").length
        : 0,
    )
    .some((len) => len > 256);

  let timeProgress = 0;

  if (startTime && endTime) {
    const totalSeconds = Math.max(1, Math.floor((endTime - startTime) / 1000));
    const elapsed = Math.max(0, totalSeconds - timeLeft);

    timeProgress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 100;
  }

  return (
    <section className="p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full">
            {/* Таймер-иконка */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>
                {t("tests.runner.timeLeft", {
                  time: `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`,
                })}
              </span>
            </div>
            <div className="relative w-full mt-1">
              <div className="h-4 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden shadow-inner relative">
                {/* Статичный градиентный фон */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #34d399 0%, #fbbf24 50%, #ef4444 100%)",
                    opacity: 0.35,
                  }}
                />
                {/* Прогресс-бар поверх градиента, цвет зависит от прогресса */}
                <div
                  className="h-4 rounded-full transition-all duration-1000 shadow-lg absolute z-10 top-0 left-0"
                  style={{
                    width: `${timeProgress}%`,
                    background:
                      timeProgress < 50
                        ? "#34d399" // зеленый
                        : timeProgress < 80
                          ? "#fbbf24" // желтый
                          : "#ef4444", // красный
                    boxShadow: "0 0 10px 2px rgba(96,165,250,0.3)",
                    opacity: 0.95,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Card className="w-full max-w-3xl mb-6 shadow-2xl rounded-3xl overflow-hidden border-3 p-4 border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-none">
        <CardHeader className="flex flex-col items-start p-6 pb-2">
          <h2 className="mb-2 text-xl font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 animate-fade-in">
            <span>
              {t("tests.runner.questionOf", {
                current: currentIndex + 1,
                total,
              })}
            </span>
          </h2>
        </CardHeader>
        <CardBody className="p-6 pt-0">
          <p
            className="mb-6 text-lg font-medium text-gray-900 dark:text-gray-100 animate-fade-in"
            style={{ whiteSpace: "pre-line" }}
          >
            {question.question_text}
          </p>
          {question.question_type === "single-choice" && (
            <RadioGroup
              className="space-y-3"
              value={(answers[currentIndex] as string[])[0] || ""}
              onValueChange={(val) => updateAnswer([val])}
            >
              {question.options.map((opt) => (
                <Radio
                  key={opt}
                  className="mb-2 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer shadow-sm data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/30"
                  value={opt}
                >
                  {opt}
                </Radio>
              ))}
            </RadioGroup>
          )}
          {question.question_type === "multiple-choice" && (
            <CheckboxGroup
              className="space-y-3"
              value={answers[currentIndex] as string[]}
              onValueChange={(val) => updateAnswer(val)}
            >
              {question.options.map((opt) => (
                <Checkbox
                  key={opt}
                  className="mb-2 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-purple-400 dark:hover:border-purple-400 transition-all cursor-pointer shadow-sm data-[selected=true]:border-purple-500 data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-900/30"
                  value={opt}
                >
                  {opt}
                </Checkbox>
              ))}
            </CheckboxGroup>
          )}
          {question.question_type === "open-ended" && (
            <>
              <Textarea
                className="mt-2 p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-400 dark:focus:border-blue-400 transition-all shadow-sm min-h-[120px] text-base"
                maxLength={256}
                placeholder={t("tests.runner.openPlaceholder")}
                value={(answers[currentIndex] as string[])[0] || ""}
                onChange={(e) => updateAnswer([e.target.value])}
              />
            </>
          )}
          {question.question_type === "ordering" && (
            <DndContext
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(answers[currentIndex] as string[]).map((_, idx) =>
                  idx.toString(),
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {(answers[currentIndex] as string[]).map((option, idx) => (
                    <SortableItem key={option} id={idx.toString()}>
                      <div className="p-3 border-2 rounded-lg bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 flex items-center gap-2 shadow-sm transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-400 animate-fade-in">
                        <span className="text-gray-500 dark:text-gray-400 select-none">
                          {idx + 1}.
                        </span>
                        <span className="flex-1">{option}</span>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {isTooLong && (
            <div className="mt-2 flex justify-center gap-2 text-sm text-red-700">
              <HugeiconsIcon className="h-5 w-5" icon={Alert01Icon} />
              <span>Есть слишком длинный ответ в одном из вопросов.</span>
            </div>
          )}
        </CardBody>
        <CardFooter className="bg-gray-50 dark:bg-zinc-800 p-6 pt-4 border-t border-gray-200 dark:border-zinc-700 animate-fade-in">
          {/* Mobile layout */}
          <div className="block md:hidden w-full">
            <Pagination
              className="w-full flex justify-center mb-2"
              page={currentIndex + 1}
              size="sm"
              total={total}
              onChange={(page) => setCurrentIndex(page - 1)}
            />
            <div className="flex items-center justify-between w-full gap-2">
              <Button
                className="px-6 py-2 rounded-lg text-base font-semibold flex items-center gap-2 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all shadow-sm"
                isDisabled={currentIndex === 0}
                onPress={() => setCurrentIndex((idx) => Math.max(idx - 1, 0))}
              >
                <HugeiconsIcon
                  className="text-default-300"
                  icon={ArrowLeft01Icon}
                />
                {t("tests.runner.prev")}
              </Button>
              <Button
                className={`px-6 py-2 rounded-lg text-base font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all ${
                  isLast && isTooLong
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-blue-600 hover:to-purple-600"
                }`}
                color="primary"
                disabled={isLast && isTooLong}
                id="submit-btn"
                isDisabled={isLast && isTooLong}
                isLoading={isLast && isSubmitting}
                onPress={() => {
                  if (isLast && isTooLong) return;
                  isLast ? handleSubmit() : setCurrentIndex((idx) => idx + 1);
                }}
              >
                {isLast ? t("tests.runner.submit") : t("tests.runner.next")}
                {isLast ? (
                  <HugeiconsIcon
                    className="text-default-300"
                    icon={CheckListIcon}
                  />
                ) : (
                  <HugeiconsIcon
                    className="text-default-300"
                    icon={ArrowRight01Icon}
                  />
                )}
              </Button>
            </div>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            <Button
              className="px-6 py-2 rounded-lg text-base font-semibold flex items-center gap-2 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all shadow-sm"
              isDisabled={currentIndex === 0}
              onPress={() => setCurrentIndex((idx) => Math.max(idx - 1, 0))}
            >
              <HugeiconsIcon
                className="text-default-300"
                icon={ArrowLeft01Icon}
              />
              {t("tests.runner.prev")}
            </Button>
            <Pagination
              className="w-1/2 flex justify-center"
              page={currentIndex + 1}
              size="sm"
              total={total}
              onChange={(page) => setCurrentIndex(page - 1)}
            />
            <Button
              className={`px-6 py-2 rounded-lg text-base font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all ${
                isLast && isTooLong
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-blue-600 hover:to-purple-600"
              }`}
              color="primary"
              disabled={isLast && isTooLong}
              id="submit-btn"
              isDisabled={isLast && isTooLong}
              isLoading={isLast && isSubmitting}
              onPress={() => {
                if (isLast && isTooLong) return;
                isLast ? handleSubmit() : setCurrentIndex((idx) => idx + 1);
              }}
            >
              {isLast ? t("tests.runner.submit") : t("tests.runner.next")}
              {isLast ? (
                <HugeiconsIcon
                  className="text-default-300"
                  icon={CheckListIcon}
                />
              ) : (
                <HugeiconsIcon
                  className="text-default-300"
                  icon={ArrowRight01Icon}
                />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 opacity-50">
        {t("tests.runner.submitWarning")}
      </p>
      <TestDetailsModal
        open={resultModalOpen}
        test={testResult}
        onClose={() => router.push("/tests")}
      />
    </section>
  );
}
