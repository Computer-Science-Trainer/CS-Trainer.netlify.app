import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  Divider,
} from "@heroui/react";
import { useTranslations } from "next-intl";

interface TestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  test: {
    id: number;
    type: string;
    section: string;
    passed: number;
    total: number;
    average: number;
    topics: string[];
    created_at: string;
    earned_score: number;
  } | null;
}

export const TestDetailsModal: React.FC<TestDetailsModalProps> = ({
  open,
  onClose,
  test,
}) => {
  const t = useTranslations();

  if (!test) return null;
  const percent = test.total ? Math.round((test.passed / test.total) * 100) : 0;

  return (
    <Modal isOpen={open} placement="center" size="lg" onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
          {t(`tests.testTypes.${test.type}`)}
          <div className="flex gap-2 w-full">
            <span className="text-base font-normal text-default-500">
              {test.section == "fundamentals"
                ? t("leaderboard.topics.fundamentals")
                : t("leaderboard.topics.algorithms")}
            </span>
            <span className="text-base font-normal text-default-500 text-right ml-auto">
              {t("tests.testIdLabel")}: {test.id}
            </span>
          </div>
        </ModalHeader>
        <Divider />
        <ModalBody>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex flex-col items-center w-full gap-4 rounded-2xl p-6 shadow-inner">
              <div className="flex flex-col items-center justify-center w-full gap-2">
                <span className="text-3xl font-extrabold text-primary drop-shadow-sm mb-4">
                  {percent}%
                </span>
                <Progress
                  color={
                    percent >= 80
                      ? "success"
                      : percent >= 50
                        ? "warning"
                        : "danger"
                  }
                  isIndeterminate={false}
                  label={undefined}
                  size="lg"
                  value={percent}
                />
              </div>
              <div className="w-full mt-2 flex flex-wrap gap-2 justify-center">
                <Chip
                  className="text-base px-3 py-1 font-bold"
                  color="success"
                  variant="flat"
                >
                  {t("tests.correctAnswersLabel")} : {test.passed}
                </Chip>
                <Chip
                  className="text-base px-3 py-1 font-bold"
                  color="danger"
                  variant="flat"
                >
                  {t("tests.incorrectAnswersLabel")} :{" "}
                  {test.total - test.passed}
                </Chip>
                <Chip
                  className="text-base px-3 py-1 font-bold"
                  color="primary"
                  variant="flat"
                >
                  {t("tests.earnedScoreLabel")} : {test.earned_score}
                </Chip>
                <Chip
                  className="text-sm font-bold"
                  color="default"
                  variant="bordered"
                >
                  {t("tests.totalLabel")} : {test.total}
                </Chip>
              </div>
            </div>
            <div className="flex-1 space-y-4 text-base rounded-2xl p-6 shadow-sm w-full">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-default-700">
                  {t("tests.dateLabel")}:
                </span>
                <span className="text-default-600">
                  {new Date(test.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-default-700">
                  {t("tests.topicsLabel")}:
                </span>
                <div className="flex flex-col gap-0.5">
                  {test.topics.map((topic, idx) => (
                    <span key={idx} className="text-default-600">
                      {t(`tests.topics.${topic}`)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            {t("tests.closeButton")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
