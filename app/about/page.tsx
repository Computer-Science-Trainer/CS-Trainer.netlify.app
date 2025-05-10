"use client";

import { title } from "@/components/primitives";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, BookOpenIcon, Mail02Icon, ChartUpIcon, Edit02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Card } from "@heroui/react";

export default function AboutPage() {
  const t = useTranslations();
  return (
    <div className="max-w-6xl mx-auto leading-relaxed">
      <h1 className={title()}>{t("about.title")}</h1>
      <p className="mt-4 text-lg leading-7">
        {t("about.description")}
      </p>
      <h2 className="mt-8 text-2xl font-semibold text-center md:text-left">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        <Card className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900" shadow="none">
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon icon={BookOpenIcon} className="text-2xl text-primary" />
            {t("about.features.tests")}
          </p>
        </Card>
        <Card className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900" shadow="none">
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon icon={InformationCircleIcon} className="text-2xl text-primary" />
            {t("about.features.feedback")}
          </p>
        </Card>
        <Card className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900" shadow="none">
          <p className="flex items-center gap-2 text-base font-medium">
            <HugeiconsIcon icon={ChartUpIcon} className="text-2xl text-primary" />
            {t("about.features.statistics")}
          </p>
        </Card>
        <Card className="flex w-full items-start gap-4 dark:bg-zinc-800 p-6 border-3 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900" shadow="none">
          <p className="flex items-center gap-2 text-base font-medium">
          <HugeiconsIcon icon={Edit02Icon} className="text-2xl text-primary" />
            {t("about.features.suggestQuestion")}
          </p>
        </Card>
      </div>
      <h2 className="mt-8 text-2xl font-semibold text-center md:text-left">{t("about.contacts")}:</h2>
      <Card className="mt-8 dark:bg-zinc-800 p-6 border-3 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900" shadow="none">
        <p className="flex items-center gap-2">
          <HugeiconsIcon icon={Mail02Icon} className="text-xl text-primary" />
          <a href="mailto:cs-trainer@list.ru" className="text-base hover:underline">
            cs-trainer@list.ru
          </a>
        </p>
      </Card>
    </div>
  );
}
