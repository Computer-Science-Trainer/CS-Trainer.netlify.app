"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  User as UserComponent,
  Pagination,
  Tabs,
  Tab,
  Progress,
  addToast,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// Define TopicProgress type which contains progress data for a topic.
interface TopicProgress {
  score: number;
  testsPassed: number;
  totalTests: number; // Total number of tests the user attempted.
  lastActivity: string;
}

// Define User interface with additional achievement field.
interface User {
  id: number;
  username: string;
  achievement: string; // Achievement or title of the user.
  avatar: string;
  fundamentals: TopicProgress;
  algorithms: TopicProgress;
}

export default function Leaderboard() {
  // Initialize translations hook.
  const t = useTranslations();

  // Define API base URL from environment variables.
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  // Define current user id.
  const currentUserId = -1;

  // Component state for search filter, current topic, pagination, and sorting.
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedTopic, setSelectedTopic] = React.useState<"fundamentals" | "algorithms">("fundamentals");
  const [rowsPerPage] = React.useState(7);
  const [sortDescriptor, setSortDescriptor] = React.useState<{ column: string; direction: "ascending" | "descending" }>({
      column: "score",
      direction: "descending",
  });
  const [page, setPage] = React.useState(1);

  // State for leaderboard data, loading indicator, and error message.
  // raw JSON from API
  const [rawData, setRawData] = React.useState<{ fundamentals: any[]; algorithms: any[] }>({
    fundamentals: [],
    algorithms: [],
  });
  const emptyTopicProgress: TopicProgress = { score: 0, testsPassed: 0, totalTests: 0, lastActivity: "" };

  // build usersData based on selectedTopic only
  const usersData = React.useMemo(() => {
    return (rawData[selectedTopic] || []).map((item: any) => ({
      id: item.id,
      username: item.nickname,
      achievement: item.achievement ?? "",
      avatar: item.avatar || "",
      fundamentals:
        selectedTopic === "fundamentals"
          ? { score: item.score, testsPassed: item.testPassed, totalTests: item.totalTests, lastActivity: item.lastActivity }
          : emptyTopicProgress,
      algorithms:
        selectedTopic === "algorithms"
          ? { score: item.score, testsPassed: item.testPassed, totalTests: item.totalTests, lastActivity: item.lastActivity }
          : emptyTopicProgress,
    }));
  }, [rawData, selectedTopic]);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Fetch leaderboard data from the backend.
  React.useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/leaderboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data: any) => {
        // normalize backend shape: { fundamentals: [...], algorithms: [...] }
        if (data && Array.isArray(data.fundamentals) && Array.isArray(data.algorithms)) {
          // store raw arrays, UI will pick fundamentals or algorithms based on tab
          setRawData({ fundamentals: data.fundamentals, algorithms: data.algorithms });
        } else {
          console.error("Unexpected API response format:", data);
          setRawData({ fundamentals: [], algorithms: [] });
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setFetchError(err.message);
        setLoading(false);
        addToast({
          title: t("leaderboard.fetchErrorTitle"),
          description: t("leaderboard.fetchError"),
          color: "danger",
        });
      });
  }, [t]);

  // Get current user data based on currentUserId.
  const currentUser = React.useMemo(
    () => usersData.find((user) => user.id === currentUserId),
    [usersData, currentUserId]
  );

  // Define table columns with their names and sortability.
  const columns = [
    { name: t("leaderboard.table.rank"), uid: "rank", sortable: false },
    { name: t("leaderboard.table.user"), uid: "user" },
    { name: t("leaderboard.table.score"), uid: "score", sortable: true },
    { name: t("leaderboard.table.testsPassed"), uid: "testsPassed", sortable: true },
    { name: t("leaderboard.table.accuracy"), uid: "accuracy", sortable: false },
    { name: t("leaderboard.table.lastActivity"), uid: "lastActivity", sortable: true },
  ];

  // Define topics available for leaderboard filtering.
  const topics = [
    { name: t("leaderboard.topics.fundamentals"), uid: "fundamentals" },
    { name: t("leaderboard.topics.algorithms"), uid: "algorithms" },
  ];

  // Calculate total pages available.
  const pages = Math.ceil(usersData.length / rowsPerPage);
  // Determine if search filter is active.
  const hasSearchFilter = Boolean(filterValue);

  // Compute fixed ranking based solely on fundamentals.score (the higher the score, the higher the rank).
  const fixedRanking = React.useMemo(() => {
    return [...usersData].sort((a, b) => b.fundamentals.score - a.fundamentals.score);
  }, [usersData]);

  // Compute fixed rank for the current user based on the fixedRanking.
  const fixedMyRank = React.useMemo(() => {
    return fixedRanking.findIndex((user) => user.id === currentUserId) + 1;
  }, [fixedRanking, currentUserId]);

  // Dynamically filter users based on the search input.
  const filteredItems = React.useMemo(() => {
    let filtered = [...usersData];
    if (hasSearchFilter) {
      filtered = filtered.filter((user) =>
        user.username.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filtered;
  }, [filterValue, usersData, hasSearchFilter]);

  // Dynamically sort the filtered list based on the selected topic and sort descriptor.
  const sortedFilteredItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[selectedTopic][sortDescriptor.column as keyof TopicProgress];
      const second = b[selectedTopic][sortDescriptor.column as keyof TopicProgress];
      if (sortDescriptor.column === "lastActivity") {
        const dateA = new Date(first as string).getTime();
        const dateB = new Date(second as string).getTime();
        return sortDescriptor.direction === "descending" ? dateB - dateA : dateA - dateB;
      }
      const cmp = Number(first) - Number(second);
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor, selectedTopic]);

  // Utility function: Get a user's fixed rank from the fixedRanking.
  const getFixedRank = React.useCallback(
    (user: User) => fixedRanking.findIndex((u) => u.id === user.id) + 1,
    [fixedRanking]
  );

  // Build the list of items to display. On page 1 without search,
  // always display 7 rows (either top 7 or 6 plus a special "current user" row).
  const displayItems = React.useMemo(() => {
    const isMissingInTop = !sortedFilteredItems.slice(0, 7).some(u => u.id === currentUserId);

    if (!hasSearchFilter && page === 1) {
      const top7 = sortedFilteredItems.slice(0, 7);
      if (!isMissingInTop || !currentUser) {
        return top7;
      } else {
        const top6 = sortedFilteredItems.slice(0, 6);
        return [...top6, { isMyRank: true, id: -1 } as any];
      }
    }

    let start = (page - 1) * rowsPerPage;
    if (!hasSearchFilter && page > 1 && (!isMissingInTop || currentUser)) {
      start = start - 1;
    }
    return sortedFilteredItems.slice(start, start + rowsPerPage);
  }, [page, sortedFilteredItems, rowsPerPage, hasSearchFilter, currentUserId]);

  // Render cell content for a given column. Compute dynamic content based on column key.
  const renderCell = React.useCallback(
    (user: any, columnKey: string | number, rank: number) =>
      (() => {
        // If the row is a special current user row, use currentUser data; otherwise use the row data.
        const cellData = user.isMyRank ? currentUser : user;
        if (!cellData) return null;

        switch (columnKey) {
          case "rank":
            return (
              <div className="flex items-center justify-center">
                <Chip variant="flat" color="primary">
                  #{rank}
                </Chip>
              </div>
            );
          case "user":
            return (
              <UserComponent
                avatarProps={{ radius: "full", size: "md", src: cellData.avatar }}
                name={cellData.username}
                description={`${cellData.achievement}`}
              />
            );
          case "score":
            return (
              <div className="flex flex-col">
                <span className="font-bold text-lg">{cellData[selectedTopic].score}</span>
                <span className="text-default-500 text-sm">{t("leaderboard.points")}</span>
              </div>
            );
          case "testsPassed":
            // Render progress along with the raw passed tests over total tests.
            return (
              <div className="flex items-center gap-2">
                <Progress
                  value={cellData[selectedTopic].testsPassed}
                  maxValue={cellData[selectedTopic].totalTests}
                  color="primary"
                  showValueLabel={false}
                  className="w-24"
                />
                <span>
                  {cellData[selectedTopic].testsPassed}/{cellData[selectedTopic].totalTests}
                </span>
              </div>
            );
          case "accuracy": {
            // Calculate accuracy as the percentage of correctly passed tests.
            const testsPassed = cellData[selectedTopic].testsPassed;
            const totalTests = cellData[selectedTopic].totalTests;
            const percent = totalTests ? Math.round((testsPassed / totalTests) * 100) : 0;
            const chipColor = percent < 25 ? "danger" : percent < 50 ? "warning" : "success";
            return (
              <Chip color={chipColor} variant="flat">
                {percent}%
              </Chip>
            );
          }
          case "lastActivity":
            return (
              <div className="flex flex-col">
                <span className="text-sm">
                  {new Date(cellData[selectedTopic].lastActivity).toLocaleDateString()}
                </span>
                <span className="text-default-500 text-xs">
                  {new Date(cellData[selectedTopic].lastActivity).toLocaleTimeString()}
                </span>
              </div>
            );
          default:
            return null;
        }
      })(),
    [selectedTopic, t, currentUser]
  );

  // Top content: contains search input and topic tabs.
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder={t("leaderboard.searchPlaceholder")}
            size="sm"
            startContent={<HugeiconsIcon icon={Search01Icon} className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <Tabs
            selectedKey={selectedTopic}
            onSelectionChange={(key) => {
              setSelectedTopic(key as "fundamentals" | "algorithms");
              setPage(1);
            }}
            variant="solid"
            color="primary"
          >
            {topics.map((topic) => (
              <Tab key={topic.uid} title={topic.name} />
            ))}
          </Tabs>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {t("leaderboard.totalParticipants", { count: usersData.length })}
          </span>
        </div>
      </div>
    );
  }, [filterValue, selectedTopic, usersData.length, t]);

  // Bottom content: includes pagination and summary of displayed participants.
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {t("leaderboard.showingParticipants", { shown: displayItems.length, total: usersData.length })}
        </span>
      </div>
    );
  }, [page, pages, hasSearchFilter, displayItems, t]);

  // Render the Leaderboard component.
  return (
    <div className="max-w-6xl mx-auto p-6" key={selectedTopic}>
      <h1 className="mb-4 text-2xl font-bold">{t("leaderboard.title")}</h1>
      <Table
        aria-label={t("leaderboard.ariaLabel")}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={(descriptor) =>
          setSortDescriptor({ column: String(descriptor.column), direction: descriptor.direction })
        }
      >
        {/* Table header */}
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.sortable}
              align={column.uid === "rank" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        {/* Table body */}
        <TableBody items={displayItems}>
          {(item: any): JSX.Element => {
            // Check if the current row corresponds to the current user.
            const isCurrentRow = item.isMyRank || (item.id === currentUserId);
            // Compute rank: use fixed rank if it's a special current-user row.
            const rank = item.isMyRank ? fixedMyRank : getFixedRank(item);
            // Apply border styles: If the current user row is special, use a top border;
            // otherwise, if naturally present, use a left border.
            const borderClass = isCurrentRow
              ? item.isMyRank
                ? "bg-gray-100 dark:bg-zinc-800 border-t border-t-2 border-blue-600"
                : "bg-gray-100 dark:bg-zinc-800 border-l-4 border-blue-600"
              : "";
            return (
              <TableRow key={item.isMyRank ? "myRank" : item.id} className={`${borderClass}`}>
                {(columnKey: string | number): JSX.Element => (
                  <TableCell>{renderCell(item, columnKey, rank)}</TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
}

