"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  BookOpenIcon,
  Mail02Icon,
  ChartUpIcon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Card } from "@heroui/react";

import { title } from "@/components/primitives";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="max-w-6xl mx-auto leading-relaxed">
      <h1 className={title()}>{t("title")}</h1>
      <p className="mt-4 text-lg leading-7">{t("description")}</p>
      <h2 className="mt-8 text-2xl font-semibold text-center md:text-left">
        {t("features.title")}:
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        <Card
          className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900"
          shadow="none"
        >
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon
              className="text-2xl text-primary"
              icon={BookOpenIcon}
            />
            {t("features.tests")}
          </p>
        </Card>
        <Card
          className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900"
          shadow="none"
        >
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon
              className="text-2xl text-primary"
              icon={InformationCircleIcon}
            />
            {t("features.feedback")}
          </p>
        </Card>
        <Card
          className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900"
          shadow="none"
        >
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon
              className="text-2xl text-primary"
              icon={ChartUpIcon}
            />
            {t("features.statistics")}
          </p>
        </Card>
        <Card
          className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900"
          shadow="none"
        >
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon
              className="text-2xl text-primary"
              icon={Edit02Icon}
            />
            {t("features.suggestQuestion")}
          </p>
        </Card>
      </div>
      <h2 className="mt-8 text-2xl font-semibold text-center md:text-left">
        {t("contacts")}:
      </h2>
      <Card
        className="mt-4 dark:bg-zinc-800 p-6 border-3 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900"
        shadow="none"
      >
        <p className="flex items-center gap-2">
          <HugeiconsIcon className="text-xl text-primary" icon={Mail02Icon} />
          <a
            className="text-base hover:underline"
            href="mailto:cs-trainer@list.ru"
          >
            cs-trainer@list.ru
          </a>
        </p>
      </Card>
    </div>
  );
}
