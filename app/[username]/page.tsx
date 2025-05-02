"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Avatar,
  Card,
  Calendar,
  Progress,
  Button,
  Chip,
  Badge,
  Tab,
  Tabs,
  Divider,
  Spacer,
  Tooltip,
} from "@heroui/react";
import { Link as HeroLink } from "@heroui/link";
import { useTranslations } from "next-intl";

import { TelegramIcon, GithubIcon, WebsiteIcon } from "@/components/icons";
import { useAuth } from "@/context/auth";
import { makeApiRequest } from "@/config/api";

export default function ProfilePage() {
  const t = useTranslations();
  const { username } = useParams() as { username: string };
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ passed: 0, total: 0, avg: 0 });

  interface Test {
    id: number;
    date: string;
    title: string;
    passed: boolean;
    progress: number;
  }
  interface Achievement {
    code: number;
    title: string;
    description: string;
    icon: string;
  }
  const [tests, setTests] = useState<Test[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleTests, setVisibleTests] = useState(4);
  const [visibleMonths, setVisibleMonths] = useState(3);

  useEffect(() => {
    makeApiRequest(`api/user/${username}/tests`, "GET").then(setTests);
    makeApiRequest(`api/user/${username}/achievements`, "GET").then(
      setAchievements,
    );
    makeApiRequest(`api/user/${username}/stats`, "GET").then((data) =>
        setStats({ passed: data.passed, total: data.total, avg: data.average }),
      );
  }, [username]);

  useEffect(() => {
    const updateVisibleMonths = () => {
      const width = window.innerWidth;

      setVisibleMonths(width >= 1200 ? 3 : width >= 768 ? 2 : 1);
    };

    updateVisibleMonths();
    window.addEventListener("resize", updateVisibleMonths);

    return () => window.removeEventListener("resize", updateVisibleMonths);
  }, []);

  let isDateUnavailable = (date: any): boolean => {
    const formatted = date.toString().slice(0, 10);

    return tests.filter((test: Test) => test.date === formatted).length === 0;
  };

  const testsOnDate = selectedDate
    ? tests.filter((test) => test.date === selectedDate)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar
                showFallback
                className="w-60 h-60 border-4 border-primary"
                radius="full"
                size="lg"
                src={user?.avatar}
              />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {username}
              </h1>
              {user?.bio && user.username === username && (
                <>
                  <p className="text-center text-default-500 px-4">
                    {user.bio}
                  </p>
                  <Divider />
                </>
              )}
              {user?.username === username && (
                <div className="flex items-center gap-4 pt-2">
                  {user.telegram && (
                    <HeroLink
                      isExternal
                      aria-label="Telegram"
                      color="foreground"
                      href={`https://t.me/${user.telegram}`}
                    >
                      <TelegramIcon size={20} />
                    </HeroLink>
                  )}
                  {user.github && (
                    <HeroLink
                      isExternal
                      aria-label="GitHub"
                      color="foreground"
                      href={`https://github.com/${user.github}`}
                    >
                      <GithubIcon size={24} />
                    </HeroLink>
                  )}
                  {user.website && (
                    <HeroLink
                      isExternal
                      aria-label="Website"
                      color="foreground"
                      href={user.website}
                    >
                      <WebsiteIcon size={26} />
                    </HeroLink>
                  )}
                </div>
              )}
              {user?.username === username && (
                <>
                  <Divider />
                  <Button
                    className="w-full"
                    color="default"
                    variant="shadow"
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
          <Card className="p-4 rounded-xl shadow-md">
            <Tabs color="secondary" variant="underlined">
              <Tab key="achievements" title={t("profile.achievementsTab")}>
                <div className="space-y-4 mt-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.code}
                      className="bg-default-100 hover:bg-default-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 p-2">
                        <Badge
                          color={achievement.code === 1 ? "warning" : "secondary"}
                          size="lg"
                          variant="shadow"
                        >
                          {achievement.icon === "star" ? "★" : "🛡️"}
                        </Badge>
                        <div>
                          <p className="font-semibold text-primary">
                            {achievement.title}
                          </p>
                          <p className="text-sm text-default-500">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Tab>
              <Tab key="stats" title={t("profile.statsTab")}>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-default-500">
                    <span>{t("profile.testsTakenLabel")}</span>
                    <span className="text-primary">
                      {stats.passed}/{stats.total}
                    </span>
                  </div>
                  <Progress color="primary" value={stats.avg} />
                  <div className="flex justify-between text-default-500">
                    <span>{t("profile.avgScoreLabel")}</span>
                    <span className="text-primary">{stats.avg}%</span>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pl-4 border-l-4 border-purple-500">
                {t("profile.activityHeading")}
              </h2>
              <Spacer />
            </div>
            <Calendar
              aria-label="Activity Calendar"
              className="[&_button]:text-default-600 [&_button:hover]:bg-default-100"
              color="primary"
              isDateUnavailable={isDateUnavailable}
              visibleMonths={visibleMonths}
              onChange={(date) => setSelectedDate(date.toString().slice(0, 10))}
            />
          </Card>

          <Card className="p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pl-4 border-l-4 border-purple-500">
                {t("profile.testResultsHeading")}
              </h2>
              <div className="flex gap-2">
                <Tooltip content={t("profile.clearFilterTooltip")}>
                  <Button
                    color="default"
                    size="sm"
                    variant="flat"
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

            {testsOnDate.length > 0 ? (
              <>
                <div
                  key="tests-list"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {testsOnDate.slice(0, visibleTests).map((test) => (
                    <Card
                      key={test.id}
                      className="transition-transform duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl rounded-xl border border-default-200 p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-primary text-lg">
                            {test.title}
                          </p>
                          <p className="text-sm text-default-500">
                            {test.date}
                          </p>
                        </div>
                        <Chip
                          color={test.passed ? "success" : "warning"}
                          size="sm"
                          variant="flat"
                        >
                          {test.passed
                            ? t("profile.testPassed")
                            : `${test.progress}%`}
                        </Chip>
                      </div>
                      <Progress
                        className="mt-2"
                        color={test.passed ? "success" : "warning"}
                        size="sm"
                        value={test.progress}
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
    </div>
  );
}
