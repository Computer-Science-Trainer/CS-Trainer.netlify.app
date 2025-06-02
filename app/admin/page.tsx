"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Checkbox,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Chip,
  Slider,
  Textarea,
} from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquare01Icon, Edit02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { Link } from "@heroui/link";
import { useTranslations } from "next-intl";

import { API_BASE_URL, makeApiRequest } from "../../config/api";
import QuestionForm from "../../components/tests/QuestionForm";
import { useAuth } from "@/context/auth";
import { TrashIcon } from "@/components/icons";

interface Question {
  id: string;
  title: string;
  content: string;
  [key: string]: any;
}

// API returns nested question and feedback metadata
interface FeedbackItem {
  question: {
    id: number;
    question_text: string;
    question_type: string;
    difficulty: string;
    options: string[];
    correct_answer: string[];
    topic_code: string;
    proposer_id: number;
  };
  user_id: number;
  rating: number;
  feedback_message: string;
  created_at: string;
  isRead: boolean;
}

function QuestionTable({
  questions,
  loading,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isDeletingId,
  isApprovingId,
  isRejectingId,
  t,
  type,
}: {
  questions: Question[];
  loading: boolean;
  onEdit: (q: Question) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isDeletingId?: string | null;
  isApprovingId?: string | null;
  isRejectingId?: string | null;
  t: ReturnType<typeof useTranslations>;
  type: "current" | "proposed";
}) {
  if (!loading && questions.length === 0) {
    return <div className="p-4 text-center">{t("admin.noQuestions")}</div>;
  }

  return loading ? (
    <Spinner label={t("loading")} />
  ) : (
    <Table
      className="border-3 rounded-3xl border-gray-200 dark:border-zinc-800 p-1 bg-content1"
      shadow="none"
    >
      <TableHeader className="">
        <TableColumn>{t("admin.table.proposedBy")}</TableColumn>
        <TableColumn>{t("admin.table.question")}</TableColumn>
        <TableColumn>{t("admin.table.type")}</TableColumn>
        <TableColumn>{t("admin.table.difficulty")}</TableColumn>
        <TableColumn>{t("admin.table.edit")}</TableColumn>
        <TableColumn>
          {type === "current" ? t("admin.table.delete") : null}
        </TableColumn>
        <TableColumn>
          {type === "proposed" ? t("admin.table.reject") : null}
        </TableColumn>
        <TableColumn>
          {type === "proposed" ? t("admin.table.approve") : null}
        </TableColumn>
      </TableHeader>
      <TableBody>
        {questions.map((q) => (
          <TableRow key={q.id}>
            <TableCell>
              <Link href={`/id/${q.proposer_id}`}>{q.proposer_id}</Link>
            </TableCell>
            <TableCell>{q.question_text}</TableCell>
            <TableCell>{q.question_type}</TableCell>
            <TableCell>{q.difficulty}</TableCell>
            <TableCell>
              <Button
                isIconOnly
                aria-label="edit"
                color="default"
                size="sm"
                variant="flat"
                onPress={() => onEdit(q)}
              >
                <HugeiconsIcon icon={Edit02Icon} size={20} />
              </Button>
            </TableCell>
            <TableCell>
              {type === "current" ? (
                <Button
                  isIconOnly
                  aria-label="delete"
                  color="danger"
                  isLoading={isDeletingId === q.id}
                  size="sm"
                  variant="flat"
                  onPress={() => onDelete && onDelete(q.id)}
                >
                  <TrashIcon />
                </Button>
              ) : null}
            </TableCell>
            <TableCell>
              {type === "proposed" ? (
                <Button
                  isIconOnly
                  aria-label="reject"
                  color="danger"
                  isLoading={isRejectingId === q.id}
                  size="sm"
                  variant="flat"
                  onPress={() => onReject && onReject(q.id)}
                >
                  <TrashIcon />
                </Button>
              ) : null}
            </TableCell>
            <TableCell>
              {type === "proposed" ? (
                <Button
                  isIconOnly
                  color="success"
                  isLoading={isApprovingId === q.id}
                  size="sm"
                  variant="flat"
                  onPress={() => onApprove && onApprove(q.id)}
                >
                  <HugeiconsIcon icon={CheckmarkSquare01Icon} />
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [tab, setTab] = useState<"current" | "proposed" | "settings" | "feedback">(
    "current",
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [proposedQuestions, setProposedQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const open = !!selectedFeedback;
  const onClose = () => setSelectedFeedback(null);
  const [loadingState, setLoadingState] = useState<{
    loading: boolean;
    deletingId?: string;
    approvingId?: string;
    rejectingId?: string;
  }>({ loading: false });
  const [feedbackPage, setFeedbackPage] = useState(1);
  const rowsPerPage = 10;

  const feedbackPages = React.useMemo(() => {
    return feedbacks.length ? Math.ceil(feedbacks.length / rowsPerPage) : 0;
  }, [feedbacks, rowsPerPage]);

  const displayedFeedbacks = React.useMemo(() => {
    const start = (feedbackPage - 1) * rowsPerPage;
    return feedbacks.slice(start, start + rowsPerPage);
  }, [feedbacks, feedbackPage, rowsPerPage]);

  // ref to scroll to the question table
  const tableRef = useRef<HTMLDivElement>(null);
  // on edit, set editing question and scroll to the table
  const handleEditClick = useCallback((q: Question) => {
    setEditingQuestion(q);
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadData = useCallback(async () => {
    setLoadingState((s) => ({ ...s, loading: true }));
    try {
      if (tab === "current") {
        const data = await makeApiRequest("api/admin/questions", "GET");

        setCurrentQuestions(data);
      }
      if (tab === "proposed") {
        const data = await makeApiRequest("api/admin/proposed", "GET");

        setProposedQuestions(data);
      }
      if (tab === "settings") {
        const data = await makeApiRequest("api/admin/settings", "GET");

        setSettings(data);
      }
      if (tab === "feedback") {
        const data = await makeApiRequest("api/admin/feedback", "GET");
        setFeedbacks((data || []).map((item: any) => ({ ...item, isRead: false })));
      }
    } finally {
      setLoadingState((s) => ({ ...s, loading: false }));
    }
  }, [tab]);

  const handleAction = useCallback(
    async (
      id: string,
      action: "delete" | "approve" | "reject",
      endpoint: string,
      method: "DELETE" | "POST",
    ) => {
      const key =
        action === "delete"
          ? "deletingId"
          : action === "approve"
            ? "approvingId"
            : "rejectingId";

      setLoadingState((s) => ({ ...s, [key]: id }));
      await makeApiRequest(endpoint, method);
      loadData();
      setLoadingState((s) => ({ ...s, [key]: undefined }));
    },
    [loadData],
  );

  const handleDelete = useCallback(
    (id: string) =>
      handleAction(id, "delete", `api/admin/questions/${id}`, "DELETE"),
    [handleAction],
  );

  const handleApprove = useCallback(
    (id: string) =>
      handleAction(id, "approve", `api/admin/proposed/${id}/approve`, "POST"),
    [handleAction],
  );

  const handleReject = useCallback(
    (id: string) =>
      handleAction(id, "reject", `api/admin/proposed/${id}/reject`, "POST"),
    [handleAction],
  );

  const handleMarkRead = useCallback((id: number) => {
    setFeedbacks((prev) => {
      const idx = prev.findIndex((f) => f.question.id === id);
      if (idx < 0) return prev;
      const item = { ...prev[idx], isRead: !prev[idx].isRead };
      const others = prev.filter((_, i) => i !== idx);
      // move read to bottom, unread to top
      return item.isRead ? [...others, item] : [item, ...others];
    });
  }, []);
  // Show modal with the feedback item data
  const handleView = useCallback((item: FeedbackItem) => {
    setSelectedFeedback({ ...item, isRead: true });
    handleMarkRead(item.question.id);
  }, [handleMarkRead]);

  useEffect(() => {
    if (authLoading || isAdminChecked) return;
    if (!user) {
      router.push("/404");

      return;
    }
    (async () => {
      try {
        await makeApiRequest("api/me/is_admin", "GET");
        setIsAdminChecked(true);
      } catch {
        router.push("/404");
      }
    })();
  }, [authLoading, user, isAdminChecked, router]);
  useEffect(() => {
    setEditingQuestion(null);
  }, [tab]);
  useEffect(() => {
    if (authLoading || !user || !isAdminChecked) return;
    loadData();
  }, [tab, authLoading, user, isAdminChecked, loadData]);

  const handleSave = useCallback(() => {
    setEditingQuestion(null);
    loadData();
  }, [loadData]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner label={t("admin.authLoading")} />
      </div>
    );
  }
  if (!user) {
    return null;
  }
  if (!isAdminChecked) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner label={t("admin.checkingAdmin")} />
      </div>
    );
  }

  return (
    <Tabs
      isVertical
      aria-label="admin-navigation"
      className="mt-4 border-3 border-gray-200 dark:border-zinc-800 bg-content1 h-full rounded-3xl p-2"
      radius="sm"
      selectedKey={tab}
      variant="light"
      onSelectionChange={(key) =>
        setTab(key as "current" | "proposed" | "settings" | "feedback")
      }
    >
      <Tab
        key="current"
        className="w-full justify-start"
        title={t("admin.tabs.current")}
      >
        <div className="flex flex-col gap-4 p-4 w-full ">
          <div ref={tableRef}>
            <QuestionForm
              apiBase="api/admin/questions"
              initialData={editingQuestion || undefined}
              isEditMode={!!editingQuestion}
              submitLabel={t("admin.submitLabel.add")}
              onClose={() => setEditingQuestion(null)}
              onSave={handleSave}
            />
          </div>
          <QuestionTable
            isDeletingId={loadingState.deletingId}
            loading={loadingState.loading}
            questions={currentQuestions}
            t={t}
            type="current"
            onDelete={handleDelete}
            onEdit={handleEditClick}
          />
        </div>
      </Tab>
      <Tab
        key="proposed"
        className="w-full justify-start"
        title={t("admin.tabs.proposed")}
      >
        <div className="flex flex-col gap-4 p-4 w-full">
          <div ref={tableRef}>
            <QuestionForm
              apiBase="api/admin/proposed"
              initialData={editingQuestion || undefined}
              isEditMode={!!editingQuestion}
              submitLabel={t("admin.submitLabel.propose")}
              onClose={() => setEditingQuestion(null)}
              onSave={handleSave}
            />
          </div>
          <QuestionTable
            isApprovingId={loadingState.approvingId}
            isRejectingId={loadingState.rejectingId}
            loading={loadingState.loading}
            questions={proposedQuestions}
            t={t}
            type="proposed"
            onApprove={handleApprove}
            onEdit={handleEditClick}
            onReject={handleReject}
          />
        </div>
      </Tab>
      <Tab
        key="feedback"
        className="w-full justify-start"
        title={t("admin.tabs.feedback") || "Feedback"}
      >
        <div className="p-4 w-full">
          <Table
        isStriped
        shadow="none"
        className="w-full"
        bottomContent={
          feedbackPages > 1 ? (
            <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={feedbackPage}
            total={feedbackPages}
            onChange={(page) => setFeedbackPage(page)}
          />
            </div>
          ) : null
        }
          >
        <TableHeader>
          <TableColumn>{t("admin.feedback.table.markRead")}</TableColumn>
          <TableColumn>{t("admin.feedback.table.createdAt")}</TableColumn>
          <TableColumn>{t("admin.feedback.table.questionId")}</TableColumn>
          <TableColumn>{t("admin.feedback.table.comment")}</TableColumn>
          <TableColumn>{t("admin.feedback.table.rating")}</TableColumn>
          <TableColumn>{t("admin.feedback.table.view")}</TableColumn>
        </TableHeader>
        <TableBody>
          {displayedFeedbacks.map((f) => (
            <TableRow key={`${f.question.id}-${f.user_id}-${f.created_at}`}>
          <TableCell>
            <Checkbox
              checked={f.isRead}
              onChange={() => handleMarkRead(f.question.id)}
            />
          </TableCell>
          <TableCell>
            {new Date(f.created_at).toLocaleString()}
          </TableCell>
          <TableCell>{f.question.id}</TableCell>
          <TableCell>{f.feedback_message}</TableCell>
          <TableCell>{f.rating}</TableCell>
          <TableCell>
            <Button
              isIconOnly
              aria-label="view"
              size="sm"
              variant="flat"
              onPress={() => handleView(f)}
            >
              <HugeiconsIcon icon={ViewIcon} size={20} />
            </Button>
          </TableCell>
            </TableRow>
          ))}
        </TableBody>
          </Table>
          <Modal
        isOpen={open}
        scrollBehavior="inside"
        placement="center"
        size={isMobile ? "full" : "lg"}
        onOpenChange={onClose}
          >
        <ModalContent className="rounded-xl shadow-xl p-6">
          <ModalHeader className="relative flex flex-col gap-2 text-2xl font-bold pb-4">
            {t("admin.feedback.modal.title", {
          id: selectedFeedback?.question.id ?? "",
            })}
          </ModalHeader>
          <Divider style={{ backgroundColor: "#c1c1c1" }} />
          <ModalBody className="pt-2 px-6 pb-6">
            <div>
          <div className="flex flex-col mb-2">
            <div className="flex flex-rows gap-4 mb-2">
              <span className="font-semibold">
            {t("admin.feedback.modal.questionTags") || "Тэги"}:
              </span>
            </div>
            <Chip>{selectedFeedback?.question.topic_code}</Chip>
          </div>
          <div className="flex flex-rows gap-4 mb-4">
            <Chip>{selectedFeedback?.question.difficulty}</Chip>
            <Chip>{selectedFeedback?.question.question_type}</Chip>
          </div>
          <div className="flex flex-col mb-4">
            <span className="font-semibold">
              {t("admin.feedback.modal.question")}:
            </span>
            <span>{selectedFeedback?.question.question_text}</span>
          </div>
          {/* Render answer display based on question type */}
          {selectedFeedback?.question.question_type === "single-choice" ||
          selectedFeedback?.question.question_type === "multiple-choice" ? (
            <div className="flex flex-col mb-4">
              <span className="font-semibold mb-1">
            {t("admin.feedback.modal.questionOptions")}:
              </span>
              <ul className="list-disc ml-6">
            {selectedFeedback.question.options.map((opt, idx) => (
              <li
                key={idx}
                className={
              selectedFeedback.question.correct_answer.includes(opt)
                ? "text-green-600"
                : undefined
                }
              >
                {opt}
              </li>
            ))}
              </ul>
            </div>
          ) : selectedFeedback?.question.question_type === "ordering" ? (
            <div className="flex flex-col mb-4">
              <span className="font-semibold mb-1">
            {t("admin.feedback.modal.questionCorrectAnswer")}:
              </span>
              <ol className="list-decimal ml-6">
            {selectedFeedback.question.correct_answer.map((ans, idx) => (
              <li key={idx}>{ans}</li>
            ))}
              </ol>
            </div>
          ) : selectedFeedback?.question.question_type === "open-ended" ? (
            <div className="flex flex-col mb-4">
              <span className="font-semibold mb-1">
            {t("admin.feedback.modal.questionCorrectAnswer")}:
              </span>
              <Textarea
            disabled
            placeholder={selectedFeedback.question.correct_answer[0] || ""}
              />
            </div>
          ) : null}
          <div className="flex flex-col mb-4">
            <span className="font-semibold">
              {t("admin.feedback.modal.userId")}:
            </span>
            <span>{selectedFeedback?.user_id}</span>
          </div>
          <div className="flex flex-col mb-4 sm:col-span-2">
            <span className="font-semibold">
              {t("admin.feedback.modal.rating")}: {selectedFeedback?.rating}
            </span>
            <Slider
              isDisabled
              className="max-w-md"
              color="foreground"
              defaultValue={selectedFeedback?.rating}
              maxValue={5}
              minValue={1}
              showSteps
              size="md"
              step={1}
            />
          </div>
          <div className="flex flex-col sm:col-span-2 mb-4">
            <span className="font-semibold mb-2">
              {t("admin.feedback.modal.comment")}:
            </span>
            <Textarea
              placeholder={selectedFeedback?.feedback_message}
              isDisabled
            />
          </div>
          <div className="flex flex-col sm:col-span-2">
            <span className="font-semibold">
              {t("admin.feedback.modal.createdAt")}:
            </span>
            <span>
              {selectedFeedback &&
            new Date(selectedFeedback.created_at).toLocaleString()}
            </span>
          </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-end p-4">
            <Button color="primary" onPress={onClose}>
          {t("admin.feedback.modal.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
          </Modal>
        </div>
      </Tab>
      <Tab
        key="settings"
        className="w-full justify-start"
        title={t("admin.tabs.settings")}
      >
        <div className="flex flex-col gap-4 p-4 w-full">
          {loadingState.loading ? (
            <Spinner label={t("loading")} />
          ) : (
            <Table
              className="w-full rounded-3xl border-3 border-gray-200 dark:border-zinc-800 p-1 bg-content1"
              radius="lg"
              shadow="none"
            >
              <TableHeader>
                <TableColumn>{t("admin.settings.parameter")}</TableColumn>
                <TableColumn>{t("admin.settings.value")}</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{t("admin.settings.frontendUrl")}</TableCell>
                  <TableCell>{settings?.frontend_url}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("admin.settings.backendUrl")}</TableCell>
                  <TableCell>{API_BASE_URL}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("admin.settings.smtpHost")}</TableCell>
                  <TableCell>{settings?.smtp_host}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("admin.settings.smtpPort")}</TableCell>
                  <TableCell>{settings?.smtp_port}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("admin.settings.fromEmail")}</TableCell>
                  <TableCell>{settings?.from_email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("admin.settings.googleClientId")}</TableCell>
                  <TableCell>{settings?.google_client_id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("admin.settings.githubClientId")}</TableCell>
                  <TableCell>{settings?.github_client_id}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </Tab>
    </Tabs>
  );
}
