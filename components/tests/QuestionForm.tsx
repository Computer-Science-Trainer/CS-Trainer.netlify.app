"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Autocomplete,
  AutocompleteItem,
  Input,
  Select,
  SelectItem,
  Textarea,
  Checkbox,
  Button,
  Card,
  addToast,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { TrashIcon, DragHandleIcon } from "../icons";
import { makeApiRequest } from "../../config/api";

import { useAuth } from "@/context/auth";

interface QuestionFormProps {
  initialData?: Record<string, any>;
  isEditMode?: boolean;
  onSave?: () => void;
  onClose?: () => void;
  apiBase?: string;
  submitLabel?: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface Topic {
  code: string;
  name: string;
}

function SortableChoice({
  id,
  value,
  onChange,
  onRemove,
  dragHandleProps,
  inputRef,
  isDisabled,
  isInvalid,
  removeDisabled,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  dragHandleProps?: any;
  inputRef?: React.Ref<HTMLInputElement>;
  isDisabled?: boolean;
  isInvalid?: boolean;
  removeDisabled?: boolean;
}) {
  // Hook to make this component draggable/sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-1 py-1 w-full"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      {/* Drag handle users grab to reorder options */}
      <div
        {...listeners}
        {...attributes}
        {...dragHandleProps}
        aria-label="Drag handle"
        className="flex items-center justify-center cursor-grab p-1 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 select-none"
        style={{ touchAction: "none" }}
        tabIndex={-1}
      >
        <DragHandleIcon />
      </div>

      {/* Text input for the option label */}
      <Input
        ref={inputRef}
        className="flex-1 max-w-md"
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        name="options"
        placeholder="Answer option"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Button to remove this option */}
      <Button
        isIconOnly
        aria-label="Delete option"
        className="transition-none"
        color="danger"
        isDisabled={removeDisabled}
        type="button"
        variant="flat"
        onPress={onRemove}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}

export default function QuestionForm({
  initialData,
  isEditMode,
  onSave,
  apiBase = "api/admin/proposed",
}: QuestionFormProps) {
  const { user } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState<boolean>(
    initialData?.terms_accepted ?? false,
  );
  // State for question text
  const [questionText, setQuestionText] = useState<string>("");
  // State for tracking validation errors
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  // State for the selected question type
  const [questionType, setQuestionType] = useState("");
  // State for the selected difficulty level
  const [difficulty, setDifficulty] = useState<string>("");
  // State for example answer in open-ended questions
  const [sampleAnswer, setSampleAnswer] = useState<string>("");
  // Dynamic list of answer options
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  // Index of selected answer in single-choice mode
  const [singleAnswerIndex, setSingleAnswerIndex] = useState<number | null>(
    null,
  );
  // Indices of selected answers in multiple-choice mode
  const [multipleAnswerIndices, setMultipleAnswerIndices] = useState<number[]>(
    [],
  );
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicCode, setSelectedTopicCode] = useState<string>("");

  // Configure pointer sensor with a small drag activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    if (initialData) {
      setDifficulty(initialData.difficulty || "");
      setQuestionType(initialData.question_type);
      setAnswerOptions(initialData.options || []);
      setSelectedTopicCode(initialData.topic_code ?? "");
      setQuestionText(initialData.question_text || "");
      const corr = (initialData.correct_answers ??
        initialData.correct_answer) as string;

      if (initialData.question_type === "single-choice") {
        const idx = initialData.options?.indexOf(corr) ?? -1;

        setSingleAnswerIndex(idx >= 0 ? idx : null);
      } else if (initialData.question_type === "multiple-choice") {
        const arr = corr.split(",");
        const idxs = (initialData.options || [])
          .map((opt: string, i: number) => (arr.includes(opt) ? i : -1))
          .filter((i: number) => i >= 0);

        setMultipleAnswerIndices(idxs);
      }
      if (initialData.question_type === "open-ended") {
        setSampleAnswer(initialData.sample_answer || "");
      }
      setTermsAccepted(initialData.terms_accepted ?? false);
    } else {
      handleReset();
    }
  }, [initialData]);
  function flattenTopics(items: any[]): Topic[] {
    const result: Topic[] = [];

    function recurse(node: any) {
      if (typeof node === "string") {
        result.push({ code: node, name: node });

        return;
      }
      if (node?.label) {
        const children = Array.isArray(node.accordions) ? node.accordions : [];
        const isLeaf =
          children.length > 0 &&
          children.every((c: any) => typeof c === "string");

        if (children.length === 0 || isLeaf) {
          result.push({ code: node.label, name: node.label });
        }
        children.forEach((child: any) => recurse(child));
      }
    }
    items.forEach(recurse);

    return result;
  }
  const tForm = useTranslations("tests.questionForm");
  const tTests = useTranslations("tests");
  const tTopic = useTranslations("tests.topics");

  useEffect(() => {
    makeApiRequest("api/topics", "GET")
      .then((data: any[]) => {
        const flat = flattenTopics(data);

        setTopics(flat);
      })
      .catch(() => {});
  }, []);
  // Add a blank option and clear option-related validation if enough exist
  const handleAddOption = () => {
    const newOptions = [...answerOptions, ""];

    setAnswerOptions(newOptions);
    if (
      validationErrors.options &&
      newOptions.filter((o) => o.trim() !== "").length >= 2
    ) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Remove an option and adjust selected indices accordingly
  const handleRemoveOption = (idx: number) => {
    const newOptions = answerOptions.filter((_, i) => i !== idx);

    setAnswerOptions(newOptions);
    setMultipleAnswerIndices((prev) =>
      prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
    );
    if (singleAnswerIndex === idx) setSingleAnswerIndex(null);
    else if (singleAnswerIndex !== null && singleAnswerIndex > idx)
      setSingleAnswerIndex(singleAnswerIndex - 1);
    if (
      validationErrors.options &&
      newOptions.filter((o) => o.trim() !== "").length >= 2
    ) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Update the text of an option and clear validation for options
  const handleUpdateOption = (idx: number, val: string) => {
    const newOptions = answerOptions.map((o, i) => (i === idx ? val : o));

    setAnswerOptions(newOptions);
    if (
      validationErrors.options &&
      newOptions.filter((o) => o.trim() !== "").length >= 2
    ) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Reorder options array after drag-and-drop ends
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = answerOptions.findIndex(
        (_, i) => `opt-${i}` === active.id,
      );
      const newIndex = answerOptions.findIndex(
        (_, i) => `opt-${i}` === over.id,
      );

      setAnswerOptions(arrayMove(answerOptions, oldIndex, newIndex));
    }
  };

  // Validate form inputs and set submission data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTopicCode) {
      setValidationErrors((prev) => ({
        ...prev,
        topic: tForm("errors.topicRequired"),
      }));

      return;
    }
    const data = {
      questionText: questionText,
      questionType: questionType,
      difficulty: difficulty,
      topicCode: selectedTopicCode!,
      options: answerOptions.filter((o) => o.trim()),
      sampleAnswer: sampleAnswer,
      termsAccepted: termsAccepted,
    };

    const newErrors: FormErrors = {};

    if (!data.questionText?.trim())
      newErrors.question = tForm("errors.questionRequired");
    if (!data.questionType) newErrors.type = tForm("errors.typeRequired");

    if (
      ["single-choice", "multiple-choice", "ordering"].includes(
        data.questionType,
      )
    ) {
      if (data.options.length < 2) {
        newErrors.options = tForm("errors.optionsMin");
      } else if (answerOptions.some((o) => o.trim() === "")) {
        newErrors.options = tForm("errors.optionsFillAll");
      } else {
        if (
          data.questionType === "single-choice" &&
          singleAnswerIndex === null
        ) {
          newErrors.correctAnswer = tForm("errors.correctAnswerRequired");
        }
        if (
          data.questionType === "multiple-choice" &&
          multipleAnswerIndices.length === 0
        ) {
          newErrors.correctAnswers = tForm("errors.correctAnswersRequired");
        }
      }
    }

    if (data.questionType === "open-ended" && !data.sampleAnswer?.trim()) {
      newErrors.sampleAnswer = tForm("errors.sampleAnswerRequired");
    }

    if (!data.termsAccepted) newErrors.terms = tForm("errors.termsRequired");

    if (Object.keys(newErrors).length) {
      setValidationErrors(newErrors);

      return;
    }
    setValidationErrors({});
    setSubmitting(true);
    let correctAnswersValue = "";

    if (questionType === "single-choice" && singleAnswerIndex !== null) {
      correctAnswersValue = answerOptions[singleAnswerIndex];
    } else if (questionType === "multiple-choice") {
      correctAnswersValue = multipleAnswerIndices
        .map((i) => answerOptions[i])
        .join(",");
    } else if (questionType === "ordering") {
      correctAnswersValue = answerOptions.join(",");
    }
    const payload = {
      title: data.questionText,
      question_text: data.questionText,
      question_type: data.questionType,
      difficulty: data.difficulty,
      options: data.options,
      correct_answer: correctAnswersValue,
      sample_answer: data.sampleAnswer || null,
      terms_accepted: data.termsAccepted,
      topic_code: data.topicCode,
      proposer_id: user?.id,
    };

    try {
      const endpoint = apiBase;

      if (isEditMode && initialData?.id) {
        await makeApiRequest(`${endpoint}/${initialData.id}`, "PUT", payload);
      } else {
        await makeApiRequest(endpoint, "POST", payload);
      }
      addToast({
        title: isEditMode ? tForm("toast.saved") : tForm("toast.submitted"),
        color: "success",
      });
      onSave?.();
      handleReset();
    } catch {
      setValidationErrors({ submit: tForm("errors.submitError") });
      addToast({ title: tForm("errors.submitError"), color: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  // Reset related states when question type changes
  const handleTypeChange = (
    selection: { currentKey?: string } | { [key: string]: any }[],
  ) => {
    const key = Array.isArray(selection) ? selection[0] : selection?.currentKey;

    if (key) {
      if (typeof key === "string") {
        setQuestionType(key);
      }
      setValidationErrors({});
      if (key === "open-ended") {
        setAnswerOptions([]);
      } else {
        setAnswerOptions(["", ""]);
      }
      setSingleAnswerIndex(null);
      setMultipleAnswerIndices([]);
    }
  };

  const handleReset = () => {
    setQuestionType("");
    setDifficulty("");
    setAnswerOptions([]);
    setValidationErrors({});
    setSingleAnswerIndex(null);
    setMultipleAnswerIndices([]);
    setSelectedTopicCode("");
    setQuestionText("");
    setSampleAnswer("");
    setTermsAccepted(false);
  };

  return (
    <div>
      {/* Card container wrapping the entire question form */}
      <Card
        className="mb-4 p-6 w-full mx-auto border-3 border-gray-200 dark:border-zinc-800 rounded-3xl"
        shadow="none"
      >
        {/* Form component handling validation and events */}
        <Form
          className="w-full flex flex-col gap-4"
          validationErrors={Object.fromEntries(
            Object.entries(validationErrors).filter(([_, v]) => v) as [
              string,
              string,
            ][],
          )}
          onReset={handleReset}
          onSubmit={handleSubmit}
        >
          <Autocomplete
            isRequired
            errorMessage={validationErrors.topic}
            label={tForm("topicLabel")}
            placeholder={tForm("topicPlaceholder")}
            selectedKey={selectedTopicCode}
            onSelectionChange={(val) => setSelectedTopicCode(val as string)}
          >
            {topics.map((topic) => (
              <AutocompleteItem key={topic.code} textValue={tTopic(topic.code)}>
                {tTopic(topic.code)}
              </AutocompleteItem>
            ))}
          </Autocomplete>
          {/* Text area for entering the question prompt */}
          <Textarea
            isRequired
            errorMessage={validationErrors.question}
            label={tForm("questionLabel")}
            labelPlacement="outside"
            minRows={5}
            placeholder={tForm("questionPlaceholder")}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          {/* Select question type and difficulty */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Question type */}
            <div className="grow basis-2/3">
              <Select
                isRequired
                className="w-full"
                label={tForm("typeLabel")}
                name="questionType"
                placeholder={tForm("typePlaceholder")}
                selectedKeys={[questionType]}
                onSelectionChange={handleTypeChange}
              >
                <SelectItem key="single-choice">
                  {tForm("type.singleChoice")}
                </SelectItem>
                <SelectItem key="multiple-choice">
                  {tForm("type.multipleChoice")}
                </SelectItem>
                <SelectItem key="ordering">{tForm("type.ordering")}</SelectItem>
                <SelectItem key="open-ended">
                  {tForm("type.openEnded")}
                </SelectItem>
              </Select>
            </div>

            {/* Question difficulty */}
            <div className="grow basis-1/3">
              <Select
                isRequired
                className="w-full"
                label={tForm("difficultyLabel")}
                name="difficulty"
                placeholder={tForm("difficultyPlaceholder")}
                selectedKeys={[difficulty]}
                onSelectionChange={(sel) => {
                  const key = Array.isArray(sel) ? sel[0] : sel.currentKey;

                  setDifficulty(key || "");
                }}
              >
                <SelectItem key="easy">{tForm("difficulty.easy")}</SelectItem>
                <SelectItem key="medium">
                  {tForm("difficulty.medium")}
                </SelectItem>
                <SelectItem key="hard">{tForm("difficulty.hard")}</SelectItem>
              </Select>
            </div>
          </div>

          {/* Render answer choices for single/multiple choice questions */}
          {["single-choice", "multiple-choice"].includes(questionType) && (
            <div className="flex flex-col gap-3 items-center w-full">
              <p className="font-medium text-center w-full">
                {tForm("optionsLabel")}
              </p>
              <div className="flex flex-col gap-2 items-center w-full">
                {answerOptions.map((o, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-1 w-full justify-center">
                      {questionType === "single-choice" && (
                        <Checkbox
                          aria-label="Select correct option"
                          isDisabled={
                            singleAnswerIndex !== null &&
                            singleAnswerIndex !== i
                          }
                          isSelected={singleAnswerIndex === i}
                          onValueChange={(checked) => {
                            setSingleAnswerIndex(checked ? i : null);
                            if (validationErrors.correctAnswer) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                correctAnswer: undefined,
                              }));
                            }
                          }}
                        />
                      )}
                      {questionType === "multiple-choice" && (
                        <Checkbox
                          aria-label="Select correct option"
                          isSelected={multipleAnswerIndices.includes(i)}
                          onValueChange={(checked) => {
                            setMultipleAnswerIndices((prev) =>
                              checked
                                ? [...prev, i]
                                : prev.filter((idx) => idx !== i),
                            );
                            if (validationErrors.correctAnswers) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                correctAnswers: undefined,
                              }));
                            }
                          }}
                        />
                      )}
                      <Input
                        className="flex-1 max-w-md"
                        isInvalid={
                          !!validationErrors.options &&
                          (answerOptions.filter((x) => x.trim()).length < 2 ||
                            !o.trim())
                        }
                        name="options"
                        placeholder={`Option ${i + 1}`}
                        value={o}
                        onChange={(e) => handleUpdateOption(i, e.target.value)}
                      />
                      <Button
                        isIconOnly
                        aria-label="Delete option"
                        className="transition-none"
                        color="danger"
                        isDisabled={i < 2}
                        type="button"
                        variant="flat"
                        onPress={() => handleRemoveOption(i)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <Button
                className="self-center"
                type="button"
                onPress={handleAddOption}
              >
                {tForm("addOption")}
              </Button>
            </div>
          )}

          {/* Drag-and-drop interface for ordering questions */}
          {questionType === "ordering" && (
            <div className="flex flex-col gap-2 items-center w-full">
              <p className="font-medium text-center w-full">
                {tForm("orderingLabel")}
              </p>
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                sensors={sensors}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={answerOptions.map((_, i) => `opt-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col items-center w-full">
                    {answerOptions.map((o, i) => (
                      <React.Fragment key={`opt-${i}`}>
                        <div className="flex items-center w-full justify-center max-w-lg">
                          <SortableChoice
                            dragHandleProps={{ tabIndex: 0 }}
                            id={`opt-${i}`}
                            inputRef={undefined}
                            isInvalid={
                              !!validationErrors.options &&
                              (answerOptions.filter((x) => x.trim()).length <
                                2 ||
                                !o.trim())
                            }
                            removeDisabled={i < 2}
                            value={o}
                            onChange={(val) => handleUpdateOption(i, val)}
                            onRemove={() => handleRemoveOption(i)}
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                className="self-center"
                type="button"
                onPress={handleAddOption}
              >
                {tForm("addOption")}
              </Button>
            </div>
          )}

          {/* Input for sample answer in open-ended questions */}
          {questionType === "open-ended" && (
            <Textarea
              isRequired
              errorMessage={validationErrors.sampleAnswer}
              label={tForm("sampleAnswerLabel")}
              labelPlacement="outside"
              placeholder={tForm("sampleAnswerPlaceholder")}
              value={sampleAnswer}
              onChange={(e) => setSampleAnswer(e.target.value)}
            />
          )}

          {/* Read-only display of correct answer(s) */}
          {questionType && questionType !== "open-ended" && (
            <Textarea
              isDisabled
              errorMessage={
                validationErrors.options ||
                validationErrors.correctAnswer ||
                validationErrors.correctAnswers
              }
              isInvalid={
                !!(
                  validationErrors.options ||
                  validationErrors.correctAnswer ||
                  validationErrors.correctAnswers
                )
              }
              label={tTests("correctAnswersLabel")}
              labelPlacement="outside"
              minRows={1}
              name="displayCorrect"
              placeholder={tForm("correctAnswersPlaceholder")}
              value={
                questionType === "single-choice"
                  ? (answerOptions[singleAnswerIndex ?? -1] ?? "")
                  : questionType === "multiple-choice"
                    ? multipleAnswerIndices
                        .map((i) => answerOptions[i])
                        .join(", ")
                    : questionType === "ordering"
                      ? answerOptions.every((o) => !o.trim())
                        ? ""
                        : answerOptions.join(", ")
                      : ""
              }
            />
          )}

          {/* Checkbox to confirm question validity */}
          <Checkbox
            isRequired
            isInvalid={!!validationErrors.terms}
            isSelected={termsAccepted}
            validationBehavior="aria"
            onValueChange={(checked) => {
              setTermsAccepted(checked);
              setValidationErrors((prev) => ({ ...prev, terms: undefined }));
            }}
          >
            {tForm("termsConfirmation")}
          </Checkbox>
          {validationErrors.terms && (
            <span className="text-danger text-small">
              {validationErrors.terms}
            </span>
          )}

          {/* Buttons for submitting or resetting the form */}
          <div className="flex gap-4">
            <Button
              className="flex-1"
              color="primary"
              isLoading={submitting}
              type="submit"
            >
              {isEditMode
                ? tForm("submitButton.save")
                : tForm("submitButton.propose")}
            </Button>
            <Button className="flex-1" type="reset" variant="bordered">
              {tForm("resetButton")}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
