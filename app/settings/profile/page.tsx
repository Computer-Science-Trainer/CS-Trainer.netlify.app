"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Input,
  Form,
  Button,
  addToast,
  Card,
  Textarea,
  Avatar,
  Spinner,
} from "@heroui/react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/context/auth";
import { makeApiRequest } from "@/config/api";

export default function SettingsProfilePage() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const base = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const [nickname, setNickname] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telegram, setTelegram] = useState(user?.telegram || "");
  const [github, setGithub] = useState(user?.github || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.username || "");
      setEmail(user.email || "");
      setTelegram(user.telegram || "");
      setGithub(user.github || "");
      setWebsite(user.website || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatar || "");
      setRemoveAvatar(false);
    }
  }, [user]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateLength = (field: string, value: string) => {
    if (value.length > 240) {
      setErrors((prev) => ({ ...prev, [field]: `Максимум 240 символов` }));
    } else {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();

      formData.append("username", nickname);
      formData.append("email", email);
      formData.append("telegram", telegram);
      formData.append("github", github);
      formData.append("website", website);
      formData.append("bio", bio);
      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      } else if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const data = await makeApiRequest(
        `api/auth/update-profile`,
        "PATCH",
        formData,
      );

      addToast({ title: t("settings.profileUpdated"), color: "success" });
      login(data.token, true);
    } catch (e: any) {
      addToast({
        title: t("settings.updateError"),
        description: e.message,
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNew) {
      addToast({ title: t("auth.errors.passwordMismatch"), color: "danger" });

      return;
    }
    if (newPassword.length < 8 || newPassword.length > 32) {
      addToast({
        title: t("auth.errors.passwordLengthError"),
        color: "danger",
      });

      return;
    }
    try {
      await makeApiRequest(`api/auth/change-password`, "POST", {
        oldPassword,
        newPassword,
      });
      addToast({
        title: t("settings.passwordChangeSuccess"),
        color: "success",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (e: any) {
      addToast({
        title: t("auth.errors.passwordChangeError"),
        description: t(`auth.errors.${e.message}`),
        color: "danger",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        {t("settings.profileTitle")}
      </h1>

      <Card className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">
          {t("settings.infoHeading")}
        </h2>
        <Form onSubmit={handleProfileUpdate}>
          <div className="flex w-full items-stretch gap-6 mb-4">
            <div className="flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border cursor-pointer relative"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {avatarPreview ? (
                  avatarPreview.startsWith("blob:") ? (
                    <Image
                      fill
                      alt="avatar preview"
                      className="object-cover object-center"
                      src={avatarPreview}
                    />
                  ) : (
                    <Avatar
                      showFallback
                      className="w-full h-full object-cover object-center"
                      radius="full"
                      size="lg"
                      src={`${base}${avatarPreview}`}
                    />
                  )
                ) : (
                  <Avatar
                    showFallback
                    className="w-full h-full object-cover object-center"
                    radius="full"
                    size="lg"
                  />
                )}
              </div>
              <Button
                className="mt-4"
                color="danger"
                size="sm"
                variant="flat"
                onPress={handleRemoveAvatar}
              >
                {t("settings.removeAvatarButton")}
              </Button>
            </div>
            <div className="flex w-full flex-wrap flex-nowrap mb-6 md:mb-0 gap-4">
              <Textarea
                className="w-full h-full"
                errorMessage={errors.bio}
                isInvalid={!!errors.bio}
                label={t("settings.bioLabel")}
                maxLength={160}
                minRows={5}
                name="bio"
                placeholder={t("settings.bioLabel")}
                value={bio}
                variant="bordered"
                onValueChange={(v) => {
                  setBio(v);
                  validateLength("bio", v);
                }}
              />
              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
            <Input
              defaultValue={user?.username}
              errorMessage={errors.nickname}
              isInvalid={!!errors.nickname}
              label={t("settings.nicknameLabel")}
              maxLength={240}
              name="username"
              placeholder={t("settings.placeholders.nickname")}
              value={nickname}
              variant="bordered"
              onValueChange={(v) => {
                setNickname(v);
                validateLength("nickname", v);
              }}
            />
            <Input
              defaultValue={user?.email}
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label={t("settings.emailLabel")}
              maxLength={240}
              name="email"
              placeholder={t("settings.placeholders.email")}
              type="email"
              value={email}
              variant="bordered"
              onValueChange={(v) => {
                setEmail(v);
                validateLength("email", v);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
            <Input
              defaultValue={user?.telegram}
              errorMessage={errors.telegram}
              isInvalid={!!errors.telegram}
              label={t("settings.telegramLabel")}
              maxLength={240}
              name="telegram"
              placeholder={t("settings.placeholders.telegram")}
              value={telegram}
              variant="bordered"
              onValueChange={(v) => {
                setTelegram(v);
                validateLength("telegram", v);
              }}
            />
            <Input
              defaultValue={user?.github}
              errorMessage={errors.github}
              isInvalid={!!errors.github}
              label={t("settings.githubLabel")}
              maxLength={240}
              name="github"
              placeholder={t("settings.placeholders.github")}
              value={github}
              variant="bordered"
              onValueChange={(v) => {
                setGithub(v);
                validateLength("github", v);
              }}
            />
          </div>

          <Input
            className="mb-4"
            defaultValue={user?.website}
            errorMessage={errors.website}
            isInvalid={!!errors.website}
            label={t("settings.websiteLabel")}
            maxLength={240}
            name="website"
            placeholder={t("settings.placeholders.website")}
            type="text"
            value={website}
            variant="bordered"
            onValueChange={(v) => {
              setWebsite(v);
              validateLength("website", v);
            }}
          />

          <Button
            className="w-full"
            color="primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex justify-center w-full">
                <Spinner size="sm" color="white" />
              </div>
            ) : (
              t("settings.saveButton")
            )}
          </Button>
        </Form>
      </Card>

      <Card className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">
          {t("settings.changePasswordHeading")}
        </h2>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
        >
          <div className="w-full space-y-4">
            <Input
              label={t("settings.currentPasswordLabel")}
              placeholder={t("settings.currentPasswordLabel")}
              type="password"
              value={oldPassword}
              variant="bordered"
              onValueChange={setOldPassword}
            />
            <Input
              label={t("settings.newPasswordLabel")}
              placeholder={t("settings.newPasswordLabel")}
              type="password"
              value={newPassword}
              variant="bordered"
              onValueChange={setNewPassword}
            />
            <Input
              label={t("settings.confirmNewPasswordLabel")}
              placeholder={t("settings.confirmNewPasswordLabel")}
              type="password"
              value={confirmNew}
              variant="bordered"
              onValueChange={setConfirmNew}
            />
          </div>
          <Button className="mt-4 w-full" color="primary" type="submit">
            {t("settings.changePasswordButton")}
          </Button>
        </Form>
      </Card>

      <Button
        className="w-full"
        color="danger"
        variant="flat"
        onPress={() => {
          logout();
        }}
      >
        {t("settings.logoutButton")}
      </Button>
    </div>
  );
}
