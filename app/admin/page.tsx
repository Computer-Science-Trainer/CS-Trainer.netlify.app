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
} from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquare01Icon, Edit02Icon } from "@hugeicons/core-free-icons";
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
      className="border-3 rounded-3xl dark:border-zinc-800 p-1 bg-content1"
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
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [tab, setTab] = useState<"current" | "proposed" | "settings">(
    "current",
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [proposedQuestions, setProposedQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loadingState, setLoadingState] = useState<{
    loading: boolean;
    deletingId?: string;
    approvingId?: string;
    rejectingId?: string;
  }>({ loading: false });

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
      className="mt-4 border-3 dark:border-zinc-800 bg-content1 h-full rounded-3xl p-2"
      radius="sm"
      selectedKey={tab}
      variant="light"
      onSelectionChange={(key) =>
        setTab(key as "current" | "proposed" | "settings")
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
        key="settings"
        className="w-full justify-start"
        title={t("admin.tabs.settings")}
      >
        <div className="flex flex-col gap-4 p-4 w-full">
          {loadingState.loading ? (
            <Spinner label={t("loading")} />
          ) : (
            <Table
              className="w-full rounded-3xl border-3 dark:border-zinc-800 p-1 bg-content1"
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
