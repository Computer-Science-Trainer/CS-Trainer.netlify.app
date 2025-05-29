import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  Divider,
  Pagination,
  Textarea,
} from "@heroui/react";
import { useTranslations } from "next-intl";

import { makeApiRequest } from "../config/api";

// define question detail type
interface QuestionDetail {
  id: string;
  question_text: string;
  question_type:
    | "single-choice"
    | "multiple-choice"
    | "open-ended"
    | "ordering"
    | "short-answer";
  options?: string[];
}

interface TestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  test: {
    id: number;
    type: string;
    section: string;
    passed: number;
    total: number;
    average: number;
    topics: string[];
    created_at: string;
    earned_score: number;
  } | null;
  showReviewButton?: boolean;
}

export const TestDetailsModal: React.FC<TestDetailsModalProps> = ({
  open,
  onClose,
  test,
  showReviewButton = true,
}) => {
  const t = useTranslations();

  // fetch answer details when modal opens
  interface AnswerDetail {
    question_id: number;
    question_type: string;
    difficulty: string;
    user_answer: string[];
    correct_answer: string[];
    is_correct: boolean;
    points_awarded: number;
  }
  const [answersData, setAnswersData] = useState<{
    answers: AnswerDetail[];
  } | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [questionsList, setQuestionsList] = useState<QuestionDetail[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!showReviewButton) return;
    if (open && test) {
      setReviewMode(false);
      setLoadingAnswers(true);
      setLoadingQuestions(true);
      // fetch answers and questions in parallel
      Promise.all([
        makeApiRequest(`api/tests/${test.id}/answers`, "GET"),
        makeApiRequest(`api/tests/${test.id}`, "GET"),
      ])
        .then(([ansData, testDetail]: any) => {
          setAnswersData(ansData);
          setQuestionsList(testDetail.questions || []);
          setCurrentAnswerIndex(0);
        })
        .catch(() => {
          // TODO: handle error appropriately
        })
        .finally(() => {
          setLoadingAnswers(false);
          setLoadingQuestions(false);
        });
    }
  }, [open, test?.id, showReviewButton]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth < 640);

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!test) return null;
  const percent = test.total ? Math.round((test.passed / test.total) * 100) : 0;

  return (
    <Modal
      isOpen={open}
      placement="center"
      scrollBehavior="inside"
      size={isMobile ? "full" : "lg"}
      onOpenChange={onClose}
    >
      <ModalContent className="rounded-xl shadow-xl p-6">
        <ModalHeader className="relative flex flex-col gap-2 text-2xl font-bold pb-4">
          {!reviewMode ? (
            <>
              {t(`tests.testTypes.${test.type}`)}
              <div className="flex gap-2 w-full">
                <span className="text-base font-normal text-default-500">
                  {test.section == "fundamentals"
                    ? t("leaderboard.topics.fundamentals")
                    : t("leaderboard.topics.algorithms")}
                </span>
                <span className="text-base font-normal text-default-500 text-right ml-auto">
                  {t("tests.testIdLabel")} : {test.id}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              {/* Mobile: question and chips below */}
              <div className="sm:hidden">
                <h3 className="text-lg font-semibold">
                  Вопрос {currentAnswerIndex + 1}.
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Chip
                    className="font-semibold"
                    color={
                      answersData?.answers[currentAnswerIndex]?.is_correct
                        ? "success"
                        : "danger"
                    }
                    size="md"
                    variant="flat"
                  >
                    {answersData?.answers[currentAnswerIndex]?.is_correct
                      ? "Верно"
                      : "Неверно"}
                  </Chip>
                  <Chip color="default" variant="flat">
                    <span className="font-semibold">Получено:</span>{" "}
                    {answersData?.answers[currentAnswerIndex]?.points_awarded}
                  </Chip>
                  <Chip
                    color={
                      answersData?.answers[currentAnswerIndex]?.difficulty === "easy"
                        ? "success"
                        : answersData?.answers[currentAnswerIndex]?.difficulty === "medium"
                        ? "secondary"
                        : "danger"
                    }
                    variant="bordered"
                  >
                    {answersData?.answers[currentAnswerIndex]?.difficulty}
                  </Chip>
                </div>
              </div>
              {/* Desktop: inline header */}
              <div className="hidden sm:flex items-center gap-3">
                <h3 className="text-lg font-semibold">
                  Вопрос {currentAnswerIndex + 1}.
                </h3>
                <Chip
                  className="font-semibold"
                  color={
                    answersData?.answers[currentAnswerIndex]?.is_correct
                      ? "success"
                      : "danger"
                  }
                  size="md"
                  variant="flat"
                >
                  {answersData?.answers[currentAnswerIndex]?.is_correct
                    ? "Верно"
                    : "Неверно"}
                </Chip>
                <div className="ml-auto">
                  <Chip color="default" variant="flat">
                    <span className="font-semibold">Получено:</span>{" "}
                    {answersData?.answers[currentAnswerIndex]?.points_awarded}
                  </Chip>
                </div>
                <div>
                  <Chip
                    color={
                      answersData?.answers[currentAnswerIndex]?.difficulty === "easy"
                        ? "success"
                        : answersData?.answers[currentAnswerIndex]?.difficulty === "medium"
                        ? "secondary"
                        : "danger"
                    }
                    variant="bordered"
                  >
                    {answersData?.answers[currentAnswerIndex]?.difficulty}
                  </Chip>
                </div>
              </div>
              <p className="mt-3 mb-1 text-base text-default-700">
                {questionsList[currentAnswerIndex].question_text}
              </p>
            </div>
          )}
        </ModalHeader>
        <Divider style={{ backgroundColor: "#c1c1c1" }} />
        <ModalBody className="pt-2 px-6 pb-6 space-y-6">
          {loadingAnswers || loadingQuestions ? (
            <div className="flex justify-center items-center h-64">
              <Progress isIndeterminate color="primary" size="lg" />
            </div>
          ) : !reviewMode ? (
            <div className="flex flex-col items-center md:items-start">
              <div className="flex flex-col items-center w-full gap-4 rounded-2xl p-6">
                <div className="flex flex-col items-center justify-center w-full gap-2">
                  <span className="text-3xl font-extrabold text-primary mb-4">
                    {percent}%
                  </span>
                  <Progress
                    color={
                      percent >= 80
                        ? "success"
                        : percent >= 50
                          ? "warning"
                          : "danger"
                    }
                    isIndeterminate={false}
                    label={undefined}
                    size="lg"
                    value={percent}
                  />
                </div>
                <div className="w-full mt-2 flex flex-wrap gap-2 justify-center">
                  <Chip
                    className="text-base px-3 py-1 font-bold"
                    color="success"
                    variant="flat"
                  >
                    {t("tests.correctAnswersLabel")} : {test.passed}
                  </Chip>
                  <Chip
                    className="text-base px-3 py-1 font-bold"
                    color="danger"
                    variant="flat"
                  >
                    {t("tests.incorrectAnswersLabel")} :{" "}
                    {test.total - test.passed}
                  </Chip>
                  <Chip
                    className="text-base px-3 py-1 font-bold"
                    color="primary"
                    variant="flat"
                  >
                    {t("tests.earnedScoreLabel")} : {test.earned_score}
                  </Chip>
                  <Chip
                    className="text-sm font-bold"
                    color="default"
                    variant="bordered"
                  >
                    {t("tests.totalLabel")} : {test.total}
                  </Chip>
                </div>
              </div>
              <div className="flex-1 space-y-4 text-base rounded-2xl p-6 w-full bg-default-100 border border-default-200 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-default-700 flex items-center gap-2">
                    {t("tests.dateLabel")}:
                  </span>
                  <span className="text-default-600 ml-7">
                    {new Date(test.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-default-700 flex items-center gap-2">
                    {t("tests.topicsLabel")}:
                  </span>
                  <div className="flex flex-wrap gap-1 ml-7">
                    {test.topics.map((topic, idx) => (
                      <Chip
                        key={idx}
                        className="text-default-600 bg-default-200"
                        size="sm"
                        variant="flat"
                      >
                        {t(`tests.topics.${topic}`)}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="w-full flex justify-center mt-2">
                  {showReviewButton && (
                    <Button
                      className="font-semibold text-base px-6 py-2 shadow-md"
                      color="primary"
                      variant="flat"
                      onPress={() => setReviewMode(true)}
                    >
                      Разбор
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {/* current question slide */}
              {(() => {
                const detail = answersData!.answers.find(
                  (a) => a.question_id === Number(questionsList[currentAnswerIndex].id),
                )!;
                const qDetail = questionsList[currentAnswerIndex];

                return (
                  <>
                    {/* render by type */}
                    {qDetail.question_type === "ordering" ? (
                      <div className="mb-4">
                        {(() => {
                          const correctSeq = detail.correct_answer.map((s) => s.trim());
                          const userSeq = detail.user_answer.map((s) => s.trim());

                          return (
                            <>
                              <div className="mb-2">
                                <span className="font-semibold">
                                  Правильная последовательность:
                                </span>
                                <div className="mt-1 space-y-1">
                                  {correctSeq.map((opt, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="font-semibold">
                                        {i + 1}.
                                      </span>
                                      <span className="text-default-600">
                                        {opt}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mb-2">
                                <span className="font-semibold">
                                  Ваша последовательность:
                                </span>
                                <div className="mt-1 space-y-1">
                                  {userSeq.map((ua, idx) => {
                                    const num =
                                      correctSeq.findIndex(
                                        (item) => item === ua,
                                      ) + 1;
                                    const isRight = ua === correctSeq[idx];

                                    return (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2"
                                      >
                                        <span className="font-semibold">
                                          {num}.
                                        </span>
                                        <span
                                          className={
                                            isRight
                                              ? "text-success"
                                              : "text-danger"
                                          }
                                        >
                                          {ua || "-"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : qDetail.question_type === "multiple-choice" ||
                      qDetail.question_type === "single-choice" ? (
                      <div className="mb-4 mt-4">
                        {(() => {
                          const normalize = (s: string) =>
                            s.trim().toLowerCase().replace(/^"|"$/g, "");
                          const correctAnswers = detail.correct_answer.map(normalize);
                          const userAnswers = detail.user_answer.map(normalize);

                          return (
                            <div>
                              <span className="font-semibold">
                                Варианты ответа:
                              </span>
                              <ul className="list-disc pl-6 mt-2">
                                {qDetail.options?.map((opt) => {
                                  const normOpt = normalize(opt);
                                  const isCorrect =
                                    correctAnswers.includes(normOpt);
                                  const isChosen =
                                    userAnswers.includes(normOpt);
                                  let cls = "";

                                  if (isCorrect)
                                    cls = "text-success font-semibold";
                                  else if (isChosen) cls = "text-danger";

                                  return (
                                    <li key={opt} className={cls}>
                                      {opt}
                                      {isCorrect && isChosen && (
                                        <span className="ml-2 text-sm text-success">
                                          (Ваш выбор)
                                        </span>
                                      )}
                                      {qDetail.question_type ===
                                        "multiple-choice" &&
                                        isCorrect &&
                                        !isChosen && (
                                          <span className="ml-2 text-sm text-warning">
                                            (Не выбран)
                                          </span>
                                        )}
                                      {!isCorrect && isChosen && (
                                        <span className="ml-2 text-sm text-danger">
                                          (Ваш выбор)
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="mb-4 mt-4">
                        <div className="mt-4">
                          <span className="font-semibold">
                            Правильный ответ:
                          </span>
                          <Textarea
                            disabled
                            className="text-default-600 mt-2"
                            value={detail.correct_answer[0] || ""}
                          />
                        </div>
                        {qDetail.question_type === "open-ended" ? (
                          <div className="mt-4">
                            <span className="font-semibold">Ваш ответ:</span>
                            <Textarea
                              disabled
                              className="mt-2"
                              placeholder="Ответ пуст"
                              value={detail.user_answer[0] || ""}
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold">Ваш ответ:</span>{" "}
                            <span
                              className={
                                detail?.is_correct
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {detail.user_answer[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </ModalBody>
        {reviewMode && (
          <div className="flex justify-center items-center p-4">
            <Pagination
              showControls
              isCompact={isMobile}
              className=""
              page={currentAnswerIndex + 1}
              size={isMobile ? "sm" : "lg"}
              total={questionsList.length}
              onChange={(page) => setCurrentAnswerIndex(page - 1)}
            />
          </div>
        )}
        <Divider style={{ backgroundColor: "#c1c1c1" }} />
        <ModalFooter className="flex items-center p-4 space-x-2">
          {reviewMode ? (
            <div className="flex-1 flex items-center justify-between">
              <Button
                size="md"
                variant="flat"
                onPress={() => setReviewMode(false)}
              >
                Назад
              </Button>
              <Button color="primary" onPress={onClose}>
                {t("tests.closeButton")}
              </Button>
            </div>
          ) : (
            <Button color="primary" onPress={onClose}>
              {t("tests.closeButton")}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
