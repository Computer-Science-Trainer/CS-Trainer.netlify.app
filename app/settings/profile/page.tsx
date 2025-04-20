"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Input, Form, Button, addToast, Card, Textarea, Avatar } from "@heroui/react";
import { useTranslations } from "next-intl";
import { makeApiRequest } from "@/config/api";

export default function SettingsProfilePage() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const t = useTranslations();

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleProfileUpdate = async () => {
    try {
      const form = new FormData();
      form.append("username", nickname);
      form.append("email", email);
      form.append("telegram", telegram);
      form.append("github", github);
      form.append("website", website);
      form.append("bio", bio);
      if (avatarFile) form.append("avatar", avatarFile);
      const data = await makeApiRequest(`api/auth/update-profile`, "PATCH", form);
      addToast({ title: t("settings.profileUpdated"), color: "success" });
      login(data.token, true);
    } catch (e: any) {
      addToast({ title: t("settings.updateError"), description: e.message, color: "danger" });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNew) {
      addToast({ title: t("settings.passwordMismatch"), color: "warning" });
      return;
    }
    try {
      await makeApiRequest(`api/auth/change-password`, "POST", { oldPassword, newPassword });
      addToast({ title: t("settings.passwordChangeSuccess"), color: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (e: any) {
      addToast({ title: t("settings.passwordChangeError"), description: e.message, color: "danger" });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">{t("settings.profileTitle")}</h1>

      <Card className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">{t("settings.infoHeading")}</h2>
        <Form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }}>
          <div className="flex w-full items-start gap-6 mb-4">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border cursor-pointer"
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
                <img
                  src={avatarPreview}
                  alt="avatar preview"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <Avatar
                  showFallback
                  radius="full"
                  size="lg"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="flex-1 w-full">
              <Textarea
                label={t("settings.bioLabel")}
                value={bio}
                onValueChange={setBio}
                placeholder={t("settings.bioLabel")}
                className="w-full"
                variant="bordered"
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
            <Input
              label={t("settings.nicknameLabel")}
              defaultValue={user?.username}
              value={nickname}
              onValueChange={setNickname}
              placeholder={t("settings.placeholders.nickname")}
              variant="bordered"
            />
            <Input
              label={t("settings.emailLabel")}
              type="email"
              defaultValue={user?.email}
              value={email}
              onValueChange={setEmail}
              placeholder={t("settings.placeholders.email")}
              variant="bordered"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
            <Input
              label={t("settings.telegramLabel")}
              defaultValue={user?.telegram}
              value={telegram}
              onValueChange={setTelegram}
              placeholder={t("settings.placeholders.telegram")}
              variant="bordered"
            />
            <Input
              label={t("settings.githubLabel")}
              defaultValue={user?.github}
              value={github}
              onValueChange={setGithub}
              placeholder={t("settings.placeholders.github")}
              variant="bordered"
            />
          </div>

          <Input
            label={t("settings.websiteLabel")}
            type="url"
            defaultValue={user?.website}
            value={website}
            onValueChange={setWebsite}
            placeholder={t("settings.placeholders.website")}
            variant="bordered"
            className="mb-4"
          />

          <Button color="primary" className="w-full">
            {t("settings.saveButton")}
          </Button>
        </Form>
      </Card>

      <Card className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">{t("settings.changePasswordHeading")}</h2>
        <Form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
          <div className="w-full space-y-4">
            <Input
              label={t("settings.currentPasswordLabel")}
              type="password"
              value={oldPassword}
              onValueChange={setOldPassword}
              placeholder={t("settings.currentPasswordLabel")}
              variant="bordered"
            />
            <Input
              label={t("settings.newPasswordLabel")}
              type="password"
              value={newPassword}
              onValueChange={setNewPassword}
              placeholder={t("settings.newPasswordLabel")}
              variant="bordered"
            />
            <Input
              label={t("settings.confirmNewPasswordLabel")}
              type="password"
              value={confirmNew}
              onValueChange={setConfirmNew}
              placeholder={t("settings.confirmNewPasswordLabel")}
              variant="bordered"
            />
          </div>
          <Button color="primary" className="mt-4 w-full">
            {t("settings.changePasswordButton")}
          </Button>
        </Form>
      </Card>

      <Button
        color="danger"
        variant="flat"
        className="w-full"
        onPress={() => { logout(); }}
      >
        {t("settings.logoutButton")}
      </Button>
    </div>
  );
}
