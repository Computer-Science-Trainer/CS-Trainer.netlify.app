"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Avatar,
  Card,
  Calendar,
  Progress,
  Button,
  Chip,
  Tab,
  Tabs,
  Divider,
  Spacer,
  Tooltip,
  addToast,
  Spinner,
} from "@heroui/react";
import { Link as HeroLink } from "@heroui/link";
import { useTranslations } from "next-intl";
import { DateValue } from "@internationalized/date";
import { motion } from "framer-motion";

import { TelegramIcon, GithubIcon, WebsiteIcon } from "@/components/icons";
import { useAuth } from "@/context/auth";
import { makeApiRequest } from "@/config/api";
import { TestDetailsModal } from "@/components/TestDetailsModal";

// Type for other user's profile data
interface ProfileUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  telegram?: string;
  github?: string;
  website?: string;
  bio?: string;
}

export default function ProfilePage() {
  const t = useTranslations();
  const { username } = useParams() as { username: string };
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const idParam = searchParams.get("id");

      if (idParam) {
        try {
          const dataById: ProfileUser = await makeApiRequest(
            `api/user/${idParam}`,
            "GET",
          );

          router.replace(`/${dataById.username}`);

          return;
        } catch {
          router.replace("/404");

          return;
        }
      }
      try {
        const data: ProfileUser = await makeApiRequest(
          `api/user/${username}`,
          "GET",
        );

        setProfileUser(data);
      } catch {
        router.replace("/404");

        return;
      }
    }
    loadProfile();
  }, [username, searchParams, router]);

  const [stats, setStats] = useState({
    passed: 0,
    total: 0,
    avg: 0,
    fundamentals: 0,
    algorithms: 0,
  });

  interface Test {
    id: number;
    type: string;
    section: string;
    passed: number;
    total: number;
    average: number;
    topics: string[];
    created_at: string;
    earned_score: number;
  }
  interface Achievement {
    code: string;
    emoji: string;
    unlocked: boolean;
    unlocked_at: string;
  }
  const [tests, setTests] = useState<Test[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  const [visibleTests, setVisibleTests] = useState(4);
  const [visibleMonths, setVisibleMonths] = useState(1);
  const [calendarContainer, setCalendarContainer] =
    useState<HTMLElement | null>(null);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!profileUser) return;
    setLoadingTests(true);
    makeApiRequest(`api/user/${username}/tests`, "GET")
      .then(setTests)
      .finally(() => setLoadingTests(false));
    setLoadingAchievements(true);
    makeApiRequest(`api/user/${username}/achievements`, "GET")
      .then((data: Achievement[]) => setAchievements(data))
      .finally(() => setLoadingAchievements(false));
    setLoadingStats(true);
    makeApiRequest(`api/user/${username}/stats`, "GET")
      .then((data) =>
        setStats({
          passed: data.passed,
          total: data.total,
          avg: data.average,
          fundamentals: data.fundamentals,
          algorithms: data.algorithms,
        }),
      )
      .finally(() => setLoadingStats(false));
  }, [username, profileUser]);

  useEffect(() => {
    if (!calendarContainer) return;
    const observer = new ResizeObserver(() => {
      const width = calendarContainer.getBoundingClientRect().width;

      if (width >= 768) setVisibleMonths(3);
      else if (width >= 518) setVisibleMonths(2);
      else setVisibleMonths(1);
    });

    observer.observe(calendarContainer);

    return () => observer.disconnect();
  }, [calendarContainer]);

  let isDateUnavailable = (date: any): boolean => {
    const formatted = date.toString().slice(0, 10);

    return (
      tests.filter((test: Test) => test.created_at.slice(0, 10) === formatted)
        .length === 0
    );
  };

  const testsOnDate = selectedDate
    ? tests.filter(
        (test) =>
          test.created_at.slice(0, 10) === selectedDate.toString().slice(0, 10),
      )
    : [];

  const base = process.env.NEXT_PUBLIC_API_URL;

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner label={t("loading")} size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card
            className="p-6 border-3 border-gray-200 dark:border-zinc-800 rounded-3xl"
            shadow="none"
          >
            <div className="flex flex-col items-center space-y-4">
              <Avatar
                showFallback
                className="w-60 h-60 border-4 border-gray-200 dark:border-zinc-800"
                radius="full"
                size="lg"
                src={
                  profileUser?.avatar
                    ? `${base}${profileUser.avatar}`
                    : user?.username === username && user?.avatar
                      ? `${base}${user.avatar}`
                      : undefined
                }
              />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                {profileUser.username}
              </h1>
              {profileUser?.bio && (
                <>
                  <p className="text-center text-default-500 px-4">
                    {profileUser.bio}
                  </p>
                  <Divider />
                </>
              )}
              {profileUser && (
                <div className="flex items-center gap-4">
                  {profileUser.telegram && (
                    <HeroLink
                      isExternal
                      aria-label="Telegram"
                      className="text-default-500 hover:text-default-400 transition-colors"
                      href={`https://t.me/${profileUser.telegram}`}
                    >
                      <TelegramIcon size={20} />
                    </HeroLink>
                  )}
                  {profileUser.github && (
                    <HeroLink
                      isExternal
                      aria-label="GitHub"
                      className="text-default-500 hover:text-default-400 transition-colors"
                      href={`https://github.com/${profileUser.github}`}
                    >
                      <GithubIcon size={24} />
                    </HeroLink>
                  )}
                  {profileUser.website && (
                    <HeroLink
                      isExternal
                      aria-label="Website"
                      className="text-default-500 hover:text-default-400 transition-colors"
                      href={`https://${profileUser.website}`}
                    >
                      <WebsiteIcon size={26} />
                    </HeroLink>
                  )}
                </div>
              )}
              {user?.username.toLocaleLowerCase() ===
                username.toLocaleLowerCase() && (
                <>
                  <Divider />
                  <Button
                    className="w-full"
                    color="default"
                    variant="flat"
                    onPress={() => router.push("/settings/profile")}
                  >
                    {t("profile.editProfileButton")}
                  </Button>
                  <Button
                    className="w-full mt-2"
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      logout();
                      router.push("/");
                    }}
                  >
                    {t("profile.logoutButton")}
                  </Button>
                </>
              )}
            </div>
          </Card>
          <Card
            className="p-4 rounded-3xl border-3 border-gray-200 dark:border-zinc-800"
            shadow="none"
          >
            <Tabs color="secondary" variant="underlined">
              <Tab key="achievements" title={t("profile.achievementsTab")}>
                <div className="space-y-4 mt-4">
                  {loadingAchievements ? (
                    <div className="flex justify-center py-8">
                      <Spinner color="primary" size="lg" />
                    </div>
                  ) : (
                    achievements.map((achievement) => (
                      <Card
                        key={achievement.code}
                        isPressable
                        className="text-left w-full bg-default-100 hover:bg-default-200 transition-colors cursor-pointer"
                        shadow="sm"
                        onPress={() => {
                          const unlockedDate = new Date(
                            achievement.unlocked_at,
                          ).toLocaleDateString();
                          const titleStr = t(
                            `profile.achievements.${achievement.code}.title`,
                          );

                          addToast({
                            description: t("profile.achievementUnlocked", {
                              title: titleStr,
                              date: unlockedDate,
                            }),
                          });
                        }}
                      >
                        <div className="flex items-center gap-3 p-2 ml-1">
                          <span className="text-3xl">{achievement.emoji}</span>
                          <div>
                            <p className="font-semibold text-primary">
                              {t(
                                `profile.achievements.${achievement.code}.title`,
                              )}
                            </p>
                            <p className="text-sm text-default-500">
                              {t(
                                `profile.achievements.${achievement.code}.description`,
                              )}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Tab>
              <Tab key="stats" title={t("profile.statsTab")}>
                <div className="mt-4 space-y-3">
                  {loadingStats ? (
                    <div className="flex justify-center py-8">
                      <Spinner color="primary" size="lg" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-default-500">
                        <span>{t("profile.testsTakenLabel")}</span>
                        <span className="text-primary">
                          {stats.passed}/{stats.total}
                        </span>
                      </div>
                      <Progress
                        color={
                          (stats.passed / stats.total) * 100 >= 80
                            ? "success"
                            : (stats.passed / stats.total) * 100 >= 50
                              ? "warning"
                              : "danger"
                        }
                        value={stats.avg * 100}
                      />
                      <div className="flex justify-between text-default-500">
                        <span>{t("profile.avgResultLabel")}</span>
                        <span className="text-primary">{stats.avg}%</span>
                      </div>
                      <div className="flex justify-between text-default-500">
                        <span>{t("profile.fundamentalsScoreLabel")}</span>
                        <span className="text-primary">
                          {stats.fundamentals}
                        </span>
                      </div>
                      <div className="flex justify-between text-default-500">
                        <span>{t("profile.algorithmsScoreLabel")}</span>
                        <span className="text-primary">{stats.algorithms}</span>
                      </div>
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card
            ref={setCalendarContainer}
            className="rounded-3xl border-3 border-gray-200 dark:border-zinc-800"
            shadow="none"
          >
            <div className="p-4 flex items-center gap-2 mt-2">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary pl-4 border-l-4 border-purple-500">
                {t("profile.activityHeading")}
              </h2>
              <Spacer />
            </div>
            <div className="mx-auto transform flex flex-col items-center">
              <Calendar
                aria-label="Activity Calendar"
                className="[&_button]:text-default-600 [&_button:hover]:bg-default-100 shadow-none"
                color="primary"
                isDateUnavailable={isDateUnavailable}
                value={selectedDate}
                visibleMonths={visibleMonths}
                onChange={setSelectedDate}
              />
            </div>
          </Card>

          <Card
            className="p-4 rounded-3xl border-3 border-gray-200 dark:border-zinc-800"
            shadow="none"
          >
            <div className="flex items-center justify-between mt-2 mb-4">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary pl-4 border-l-4 border-purple-500">
                {t("profile.testResultsHeading")}
              </h2>
              <div className="flex gap-2">
                <Tooltip content={t("profile.clearFilterTooltip")}>
                  <Button
                    color="default"
                    size="sm"
                    variant="bordered"
                    onPress={() => {
                      setSelectedDate(null);
                      setVisibleTests(4);
                    }}
                  >
                    {t("profile.clearFilterTooltip")}
                  </Button>
                </Tooltip>
              </div>
            </div>

            {loadingTests ? (
              <div className="flex justify-center py-8">
                <Spinner color="primary" size="lg" />
              </div>
            ) : testsOnDate.length > 0 ? (
              <>
                <div
                  key="tests-list"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {testsOnDate.slice(0, visibleTests).map((test, idx) => (
                    <Card
                      key={test.id || test.created_at || idx}
                      isPressable
                      className="transition-transform duration-300 ease-in-out transform rounded-xl p-3 h-44 cursor-pointer bg-default-100 hover:bg-default-200"
                      shadow="sm"
                      onPress={() => {
                        setSelectedTest(test);
                        setTestModalOpen(true);
                      }}
                    >
                      <div className="flex justify-between items-start w-full p-1">
                        <div className="w-full">
                          <div className="flex items-center gap-2 w-full">
                            <p className="font-medium text-primary text-lg">
                              {t(`tests.testTypes.${test.type}`)}
                            </p>
                            <Chip
                              className="mt-1"
                              color="default"
                              variant="bordered"
                            >
                              {t(`tests.sections.${test.section}`)}
                            </Chip>
                            <div className="flex-1 text-right ml-auto font-bold">
                              <p>{`${Math.round(test.average * 100)}%`}</p>
                            </div>
                          </div>
                          <div className="text-default-500 text-left mt-2">
                            {test.topics.slice(0, 2).map((topic, idx) => (
                              <p key={idx} className="truncate">
                                {t(`tests.topics.${topic}`)}
                              </p>
                            ))}
                            {test.topics.length > 2 && <p>...</p>}
                          </div>
                        </div>
                      </div>
                      <Progress
                        className="mt-2"
                        color={
                          test.average >= 0.8
                            ? "success"
                            : test.average >= 0.5
                              ? "warning"
                              : "danger"
                        }
                        size="sm"
                        value={test.average * 100}
                      />
                    </Card>
                  ))}
                </div>
                {testsOnDate.length > visibleTests && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => setVisibleTests((prev) => prev + 4)}
                    >
                      {t("profile.showMoreButton")}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div key="no-tests" className="text-center py-8">
                <p className="text-default-500">
                  {selectedDate
                    ? t("profile.noTestsMessage")
                    : t("profile.selectDateMessage")}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <TestDetailsModal
        open={testModalOpen}
        showReviewButton={
          user?.username.toLocaleLowerCase() === username.toLocaleLowerCase()
        }
        test={selectedTest}
        onClose={() => setTestModalOpen(false)}
      />
    </motion.div>
  );
}
