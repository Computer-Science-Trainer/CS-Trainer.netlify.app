import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Progress, Chip, Divider } from "@heroui/react";
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
  } | null;
}

export const TestDetailsModal: React.FC<TestDetailsModalProps> = ({ open, onClose, test }) => {
  const t = useTranslations();
  if (!test) return null;
  const percent = test.total ? Math.round((test.passed / test.total) * 100) : 0;

  return (
    <Modal isOpen={open} onOpenChange={onClose} placement="center" size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
          {t(`tests.testTypes.${test.type}`)}
          <span className="text-base font-normal text-default-500">
            {test.section == "fundamentals" ? t("leaderboard.topics.fundamentals") : t("leaderboard.topics.algorithms")} 
          </span>
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
                  color={percent >= 80 ? "success" : percent >= 50 ? "warning" : "danger"}
                  size="lg"
                  value={percent}
                  label={undefined}
                  isIndeterminate={false}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Chip color="success" variant="flat" className="text-base px-3 py-1">
                  {t("tests.correctAnswersLabel")}: {test.passed}
                </Chip>
                <Chip color="danger" variant="flat" className="text-base px-3 py-1">
                  {t("tests.incorrectAnswersLabel")}: {test.total - test.passed}
                </Chip>
                <Chip color="default" variant="bordered" className="text-sm">
                  {t("tests.totalLabel")}: {test.total}
                </Chip>
              </div>
            </div>
            <div className="flex-1 space-y-4 text-base rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-default-700">{t("tests.dateLabel")}:</span>
                <span className="text-default-600">{new Date(test.created_at).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-default-700">{t("tests.topicsLabel")}:</span>
                <div className="flex flex-col gap-0.5">
                  {test.topics.map((topic, idx) => (
                    <span key={idx} className="text-default-600">{t(`tests.topics.${topic}`)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>{t("tests.closeButton")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
