"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";

import { makeApiRequest } from "@/config/api";

export default function RedirectById() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    async function go() {
      try {
        const user = await makeApiRequest(
          `api/user?id=${id}`,
          "GET",
          undefined,
          true,
        );

        router.replace(`/${user.username}`);
      } catch {
        router.replace("/404");
      }
    }
    go();
  }, [id, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <Spinner label={t("loading")} size="lg" />
    </div>
  );
}
