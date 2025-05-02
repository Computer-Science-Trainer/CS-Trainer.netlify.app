"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/context/auth";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const t = useTranslations();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      const description =
        searchParams.get("error_description") ||
        t("auth.errors.detail.accessDenied");

      addToast({
        title: t("auth.errors.title.authError"),
        description,
        color: "danger",
      });
      router.replace("/");

      return;
    }
    const token = searchParams.get("token");

    if (token) {
      login(token, true);
    }
    router.replace("/");
  }, [searchParams, login, router]);

  return null;
}
