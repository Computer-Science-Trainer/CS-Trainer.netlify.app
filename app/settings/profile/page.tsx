"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
} from "@heroui/react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/context/auth";
import { makeApiRequest } from "@/config/api";

interface ProfileData {
  username: string;
  email: string;
  telegram: string;
  github: string;
  website: string;
  bio: string;
  avatar: string;
}

export default function SettingsProfilePage() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const base = process.env.NEXT_PUBLIC_API_URL;

  const [profile, setProfile] = useState<ProfileData>({
    username: user?.username || "",
    email: user?.email || "",
    telegram: user?.telegram || "",
    github: user?.github || "",
    website: user?.website || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile from backend
  const fetchProfile = useCallback(
    async (username: string) => {
      setIsProfileLoading(true);
      try {
        const profile = await makeApiRequest(`api/user/${username}`, "GET");

        setProfile((prev) => ({
          ...prev,
          telegram: profile.telegram || "",
          github: profile.github || "",
          website: profile.website || "",
          bio: profile.bio || "",
          avatar: profile.avatar || "",
        }));
        setAvatarPreview(profile.avatar || "");
      } catch (e: any) {
        addToast({
          title: t("settings.updateError"),
          description: e?.message,
          color: "danger",
        });
      } finally {
        setIsProfileLoading(false);
      }
    },
    [t],
  );

  // Initial load and on user change
  useEffect(() => {
    if (!user) {
      router.push("/");

      return;
    }
    setProfile({
      username: user.username || "",
      email: user.email || "",
      telegram: user.telegram || "",
      github: user.github || "",
      website: user.website || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
    setAvatarPreview(user.avatar || "");
    setRemoveAvatar(false);
    fetchProfile(user.username);
  }, [user, router, fetchProfile]);

  // Avatar blob cleanup
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Universal field change handler
  const handleFieldChange = useCallback(
    (field: keyof ProfileData, value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
      if (value.length > 240) {
        setErrors((prev) => ({ ...prev, [field]: `Maximum 240 symbols` }));
      } else {
        setErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: removed, ...rest } = prev;

          return rest;
        });
      }
    },
    [],
  );

  // Avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
  };

  // Profile update
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();

      Object.entries(profile).forEach(([key, value]) => {
        if (key !== "avatar") formData.append(key, value);
      });
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
      setProfile((prev) => ({ ...prev, ...data.user }));
      setAvatarPreview(data.user?.avatar || "");
      setAvatarFile(null);
      setRemoveAvatar(false);
      fetchProfile(profile.username);
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

  // Change password
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
    setIsChangingPassword(true);
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
        title: t("settings.passwordChangeError"),
        description: t(`auth.errors.detail.${e.message}`),
        color: "danger",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const profileFields = useMemo(
    () => [
      {
        key: "username",
        label: t("settings.usernameLabel"),
        type: "text",
        placeholder: t("settings.placeholders.username"),
      },
      {
        key: "email",
        label: t("settings.emailLabel"),
        type: "email",
        placeholder: t("settings.placeholders.email"),
      },
      {
        key: "telegram",
        label: t("settings.telegramLabel"),
        type: "text",
        placeholder: t("settings.placeholders.telegram"),
      },
      {
        key: "github",
        label: t("settings.githubLabel"),
        type: "text",
        placeholder: t("settings.placeholders.github"),
      },
      {
        key: "website",
        label: t("settings.websiteLabel"),
        type: "text",
        placeholder: t("settings.placeholders.website"),
      },
    ],
    [t],
  );

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        {t("settings.profileTitle")}
      </h1>
      <Card
        className="bg-white dark:bg-zinc-900 p-6 space-y-6 rounded-3xl border-3 border-gray-200 dark:border-zinc-800"
        shadow="none"
      >
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
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
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
                value={profile.bio}
                variant="bordered"
                onValueChange={(v) => handleFieldChange("bio", v)}
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
            {profileFields.slice(0, 2).map((field) => (
              <Input
                key={field.key}
                errorMessage={errors[field.key]}
                isInvalid={!!errors[field.key]}
                label={field.label}
                maxLength={240}
                name={field.key}
                placeholder={field.placeholder}
                type={field.type}
                value={profile[field.key as keyof ProfileData]}
                variant="bordered"
                onValueChange={(v) =>
                  handleFieldChange(field.key as keyof ProfileData, v)
                }
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
            {profileFields.slice(2, 4).map((field) => (
              <Input
                key={field.key}
                errorMessage={errors[field.key]}
                isInvalid={!!errors[field.key]}
                label={field.label}
                maxLength={240}
                name={field.key}
                placeholder={field.placeholder}
                type={field.type}
                value={profile[field.key as keyof ProfileData]}
                variant="bordered"
                onValueChange={(v) =>
                  handleFieldChange(field.key as keyof ProfileData, v)
                }
              />
            ))}
          </div>
          <div className="mb-4 w-full">
            <Input
              key={profileFields[4].key}
              className="w-full"
              errorMessage={errors[profileFields[4].key]}
              isInvalid={!!errors[profileFields[4].key]}
              label={profileFields[4].label}
              maxLength={240}
              name={profileFields[4].key}
              placeholder={profileFields[4].placeholder}
              type={profileFields[4].type}
              value={profile[profileFields[4].key as keyof ProfileData]}
              variant="bordered"
              onValueChange={(v) =>
                handleFieldChange(profileFields[4].key as keyof ProfileData, v)
              }
            />
          </div>
          <Button
            className="w-full"
            color="primary"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? (
              <div className="flex justify-center w-full">
                <Spinner color="white" size="sm" />
              </div>
            ) : (
              t("settings.saveButton")
            )}
          </Button>
        </Form>
      </Card>
      <Card
        className="bg-white dark:bg-zinc-900 p-6 space-y-6 rounded-3xl border-3 border-gray-200 dark:border-zinc-800"
        shadow="none"
      >
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
          <Button
            className="mt-4 w-full"
            color="primary"
            disabled={isChangingPassword}
            type="submit"
          >
            {isChangingPassword ? (
              <Spinner color="white" size="sm" />
            ) : (
              t("settings.changePasswordButton")
            )}
          </Button>
        </Form>
      </Card>
      <Button className="w-full" color="danger" variant="flat" onPress={logout}>
        {t("settings.logoutButton")}
      </Button>
      <Button
        className="w-full mt-2"
        color="danger"
        variant="solid"
        onPress={() => setShowDeleteModal(true)}
      >
        {t("settings.deleteAccountButton")}
      </Button>
      <Modal
        isOpen={showDeleteModal}
        placement="center"
        onOpenChange={setShowDeleteModal}
      >
        <ModalContent>
          <ModalHeader>{t("settings.deleteAccountButton")}</ModalHeader>
          <ModalBody>{t("settings.deleteAccountConfirm")}</ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowDeleteModal(false)}>
              {t("settings.cancelButton")}
            </Button>
            <Button
              color="danger"
              isLoading={isDeleting}
              onPress={async () => {
                setIsDeleting(true);
                try {
                  await makeApiRequest("api/auth/delete-account", "DELETE");
                  addToast({
                    title: t("settings.accountDeleted"),
                    color: "success",
                  });
                  logout();
                  router.push("/");
                } catch (e: any) {
                  addToast({
                    title: t("settings.updateError"),
                    description: e.message,
                    color: "danger",
                  });
                } finally {
                  setIsDeleting(false);
                  setShowDeleteModal(false);
                }
              }}
            >
              {t("settings.deleteAccountButton")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
