/**
 * Authentication Modal Component
 *
 * This component provides a complete authentication flow including:
 * - Login
 * - Registration
 * - Email verification
 * - Password recovery
 * - Password change
 *
 * Backend Requirements:
 * - All endpoints must return standardized error responses with a 'detail' field
 * - Successful responses should include a token for authenticated endpoints
 * - Verification codes should be 6-digit numeric strings
 */

// Import necessary UI components and hooks
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Input,
  Link,
  Tooltip,
  Spinner,
  addToast,
  Form,
  Divider,
} from "@heroui/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  User03Icon,
  Mail02Icon,
  LockPasswordIcon,
  PasswordValidationIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { GoogleIcon, Github01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { useAuth } from "@/context/auth";
import { API_BASE_URL, makeApiRequest } from "@/config/api";

/**
 * Authentication State Enum
 *
 * Defines all possible states of the authentication flow:
 * - Login: Standard email/password login
 * - Register: New account registration
 * - Verify: Email verification with 6-digit code
 * - Recover: Password recovery initiation
 * - RecoverVerify: Recovery code verification
 * - ChangePassword: Setting new password after recovery
 */
enum AuthState {
  Login,
  Register,
  Verify,
  Recover,
  RecoverVerify,
  ChangePassword,
}

/**
 * AuthWindow Props Interface
 *
 * @property isOpen - Controls modal visibility
 * @property onOpenChange - Callback for modal visibility changes
 * @property onAuthSuccess - Callback when authentication succeeds (receives token)
 */
interface AuthWindowProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAuthSuccess?: (token?: string) => void;
}

/**
 * Main AuthWindow Component
 *
 * Manages complete authentication flow with state management,
 * validation, and API communication.
 */
export default function AuthWindow({
  isOpen,
  onOpenChange,
  onAuthSuccess,
}: AuthWindowProps) {
  const t = useTranslations(); // Hook for translations
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false); // Loading state for API requests
  const [rememberMe, setRememberMe] = useState(false); // Remember me

  // Form state management
  const [authState, setAuthState] = useState<AuthState>(AuthState.Login); // Current authentication state
  const [username, setNickname] = useState(""); // Nickname for registration
  const [email, setEmail] = useState(""); // Email for login/registration
  const [password, setPassword] = useState(""); // Password for login/registration
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password for registration
  const [verificationCode, setVerificationCode] = useState(""); // Verification code for email/recovery
  const [termsAccepted, setTermsAccepted] = useState(false); // Terms acceptance for registration
  const [isConfirmPasswordDirty, setIsConfirmPasswordDirty] = useState(false); // Tracks if confirm password field has been touched

  // UI states
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const [errors, setErrors] = useState<Record<string, string>>({}); // Validation errors

  /**
   * Password confirmation validation effect
   *
   * Automatically validates when either password or confirmPassword changes
   * and the confirm field has been touched (is dirty)
   */
  useEffect(() => {
    if (password && confirmPassword && isConfirmPasswordDirty) {
      const error = validateConfirmPassword(password, confirmPassword);

      setErrors((prev) => ({
        ...prev,
        confirmPassword: error || "",
      }));
    }
  }, [password, confirmPassword, isConfirmPasswordDirty]);

  // Reset verification code when auth state changes
  useEffect(() => {
    if (
      authState !== AuthState.Verify &&
      authState !== AuthState.RecoverVerify
    ) {
      setVerificationCode("");
    }
  }, [authState]);

  const resetForm = () => {
    setShowPassword(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  /**
   * Validation Functions
   *
   * Each validates a specific field and returns error message or null
   * Uses translations for localized error messages
   */

  // Validates email format and presence
  const validateEmail = useCallback(
    (value: string): string | null => {
      if (!value) return t("auth.errors.emailMissing");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) return t("auth.errors.emailInvalid");

      return null;
    },
    [t],
  );

  // Validates username length and allowed characters
  const validateNickname = useCallback(
    (value: string): string | null => {
      if (!value) return t("auth.errors.usernameMissing");
      if (value.length < 3) return t("auth.errors.usernameShort");
      if (value.length > 15) return t("auth.errors.usernameLong");
      if (!/^[a-zA-Z0-9_]+$/.test(value))
        return t("auth.errors.usernameInvalid");

      return null;
    },
    [t],
  );

  // Validates password meets minimum length requirement
  const validatePassword = useCallback(
    (value: string): string | null => {
      if (!value) return t("auth.errors.passwordMissing");
      if (value.length < 8) return t("auth.errors.passwordLengthError");

      return null;
    },
    [t],
  );

  // Validates password confirmation matches original password
  const validateConfirmPassword = useCallback(
    (password: string, confirm: string): string | null => {
      if (!confirm) return t("auth.errors.confirmPasswordMissing");
      if (password !== confirm) return t("auth.errors.passwordMismatch");

      return null;
    },
    [t],
  );

  // Validates verification code is 6 digits
  const validateVerificationCode = useCallback(
    (code: string): string | null => {
      if (!code) return t("auth.errors.codeMissing");
      if (code.length !== 6) return t("auth.errors.codeInvalid");

      return null;
    },
    [t],
  );

  /**
   * Form Validation
   *
   * Validates all fields in the current auth state
   * Returns boolean indicating if form is valid
   * Sets error messages in state
   */
  const validateCurrentForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    switch (authState) {
      case AuthState.Login:
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;
        break;

      case AuthState.Register:
        const usernameError = validateNickname(username);
        const regEmailError = validateEmail(email);
        const regPasswordError = validatePassword(password);
        const confirmError = validateConfirmPassword(password, confirmPassword);

        if (usernameError) newErrors.username = usernameError;
        if (regEmailError) newErrors.email = regEmailError;
        if (regPasswordError) newErrors.password = regPasswordError;
        if (confirmError) newErrors.confirmPassword = confirmError;
        if (!termsAccepted) newErrors.terms = t("auth.errors.terms");
        break;

      case AuthState.Verify:
      case AuthState.RecoverVerify:
        const codeError = validateVerificationCode(verificationCode);

        if (codeError) newErrors.verificationCode = codeError;
        break;

      case AuthState.Recover:
        const recoverEmailError = validateEmail(email);

        if (recoverEmailError) newErrors.email = recoverEmailError;
        break;

      case AuthState.ChangePassword:
        const newPasswordError = validatePassword(password);
        const confirmNewError = validateConfirmPassword(
          password,
          confirmPassword,
        );

        if (newPasswordError) newErrors.newPassword = newPasswordError;
        if (confirmNewError) newErrors.confirmNewPassword = confirmNewError;
        break;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [
    authState,
    email,
    password,
    username,
    confirmPassword,
    verificationCode,
    termsAccepted,
    validateEmail,
    validateNickname,
    validatePassword,
    validateConfirmPassword,
    validateVerificationCode,
    t,
  ]);

  // Check if form is ready for submission
  const isFormValid = useMemo(() => {
    switch (authState) {
      case AuthState.Login:
        return (
          !!email &&
          !!password &&
          !validateEmail(email) &&
          !validatePassword(password)
        );

      case AuthState.Register:
        return (
          !!username &&
          !!email &&
          !!password &&
          !!confirmPassword &&
          !validateNickname(username) &&
          !validateEmail(email) &&
          !validatePassword(password) &&
          !validateConfirmPassword(password, confirmPassword) &&
          termsAccepted
        );

      case AuthState.Verify:
      case AuthState.RecoverVerify:
        return verificationCode.length === 6;

      case AuthState.Recover:
        return !!email && !validateEmail(email);

      case AuthState.ChangePassword:
        return (
          !!password &&
          !!confirmPassword &&
          !validatePassword(password) &&
          !validateConfirmPassword(password, confirmPassword)
        );

      default:
        return false;
    }
  }, [
    authState,
    email,
    password,
    username,
    confirmPassword,
    verificationCode,
    termsAccepted,
    validateEmail,
    validateNickname,
    validatePassword,
    validateConfirmPassword,
  ]);

  /**
   * Form Submission Handlers
   *
   * Each handles a specific authentication action
   * Manages loading states, errors, and state transitions
   */

  // Handles login and automatically switches to verification if account not verified
  const handleLogin = async () => {
    try {
      const data = await makeApiRequest(
        "api/auth/login",
        "POST",
        { email, password },
        true,
      );

      addToast({
        title: t("auth.success.title.loginSuccess"),
        description: t("auth.success.loginSuccess"),
        color: "success",
      });

      login(data.access_token, rememberMe);
      onOpenChange(false);
    } catch (error: any) {
      if (error.message === "account_not_verified") {
        setAuthState(AuthState.Verify);
        addToast({
          title: t("auth.errors.title.accountNotVerified"),
          description: t("auth.errors.detail.accountNotVerified"),
          color: "warning",
        });
      } else {
        let desc = t(`auth.errors.detail.${error.message}`);

        if (desc.startsWith("auth.errors.detail.")) {
          desc = t("auth.errors.detail.unknown");
        }
        addToast({
          title: t("auth.errors.title.loginFailed"),
          description: desc,
          color: "danger",
        });
      }
    }
  };

  const handleRegister = async () => {
    try {
      await makeApiRequest(
        "api/auth/register",
        "POST",
        { email, password, username },
        true,
      );
      setAuthState(AuthState.Verify);
    } catch (error: any) {
      addToast({
        title: t("auth.errors.title.registerFailed"),
        description: (() => {
          const desc = t(`auth.errors.detail.${error.message}`);

          return desc.startsWith("auth.errors.detail.")
            ? t("auth.errors.detail.unknown")
            : desc;
        })(),
        color: "danger",
      });
    }
  };

  const handleVerify = async () => {
    try {
      const data = await makeApiRequest(
        "api/auth/verify",
        "POST",
        { email, code: verificationCode },
        true,
      );

      login(data.access_token, rememberMe);
      addToast({
        title: t("auth.success.title.verifySuccess"),
        description: t("auth.success.verifySuccess"),
        color: "success",
      });
      onOpenChange(false);
    } catch (error: any) {
      addToast({
        title: t("auth.errors.title.verifyFailed"),
        description: (() => {
          const desc = t(`auth.errors.detail.${error.message}`);

          return desc.startsWith("auth.errors.detail.")
            ? t("auth.errors.detail.unknown")
            : desc;
        })(),
        color: "danger",
      });
    }
  };

  const handleRecover = async () => {
    try {
      await makeApiRequest("api/auth/recover", "POST", { email }, true);
      setAuthState(AuthState.RecoverVerify);
    } catch (error: any) {
      addToast({
        title: t("auth.errors.title.recoverFailed"),
        description: (() => {
          const desc = t(`auth.errors.detail.${error.message}`);

          return desc.startsWith("auth.errors.detail.")
            ? t("auth.errors.detail.unknown")
            : desc;
        })(),
        color: "danger",
      });
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    const code_type =
      authState === AuthState.Verify ? "verification" : "recover";

    try {
      await makeApiRequest(
        "api/auth/verify/resend",
        "POST",
        { email, code_type },
        true,
      );
      addToast({
        title: t("auth.success.title.codeResent"),
        description: t("auth.success.codeResent"),
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: t("auth.errors.title.resendFailed"),
        description: (() => {
          const desc = t(`auth.errors.detail.${error.message}`);

          return desc.startsWith("auth.errors.detail.")
            ? t("auth.errors.detail.unknown")
            : desc;
        })(),
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverVerify = async () => {
    try {
      await makeApiRequest(
        "api/auth/recover/verify",
        "POST",
        { email, code: verificationCode },
        true,
      );
      setAuthState(AuthState.ChangePassword);
    } catch (error: any) {
      addToast({
        title: t("auth.errors.title.recoverVerifyFailed"),
        description: (() => {
          const desc = t(`auth.errors.detail.${error.message}`);

          return desc.startsWith("auth.errors.detail.")
            ? t("auth.errors.detail.unknown")
            : desc;
        })(),
        color: "danger",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      const data = await makeApiRequest(
        "api/auth/recover/change",
        "POST",
        {
          email,
          code: verificationCode,
          password,
        },
        true,
      );

      login(data.access_token, rememberMe);
      addToast({
        title: t("auth.success.title.changePasswordSuccess"),
        description: t("auth.success.changePasswordSuccess"),
        color: "success",
      });
      if (onAuthSuccess) onAuthSuccess(data.access_token);
      onOpenChange(false);
    } catch (error: any) {
      addToast({
        title: t("auth.errors.changePasswordFailed"),
        description: (() => {
          const desc = t(`auth.errors.detail.${error.message}`);

          return desc.startsWith("auth.errors.detail.")
            ? t("auth.errors.detail.unknown")
            : desc;
        })(),
        color: "danger",
      });
    }
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      if (!validateCurrentForm()) return;

      setIsLoading(true);
      setErrors({});

      try {
        switch (authState) {
          case AuthState.Login:
            await handleLogin();
            break;
          case AuthState.Register:
            await handleRegister();
            break;
          case AuthState.Verify:
            await handleVerify();
            break;
          case AuthState.Recover:
            await handleRecover();
            break;
          case AuthState.RecoverVerify:
            await handleRecoverVerify();
            break;
          case AuthState.ChangePassword:
            await handleChangePassword();
            break;
        }
      } catch (error: any) {
        setErrors({ form: error.message || t("auth.errors.general") });
      } finally {
        setIsLoading(false);
      }
    },
    [
      authState,
      email,
      password,
      username,
      confirmPassword,
      verificationCode,
      termsAccepted,
      rememberMe,
      validateCurrentForm,
      t,
    ],
  );

  /**
   * Render Functions
   *
   * Each returns JSX for a specific form field or form layout
   * Handles validation states, icons, and interactions
   */

  // Renders email input with resend button when in verification states
  const renderNicknameInput = () => (
    <Input
      isRequired
      endContent={
        <Tooltip content={t("auth.rules.username")} placement="top">
          <HugeiconsIcon
            className="text-2xl text-default-400"
            icon={User03Icon}
          />
        </Tooltip>
      }
      errorMessage={errors.username}
      isInvalid={!!errors.username}
      label={t("auth.labels.username")}
      name="username"
      placeholder={t("auth.placeholders.username")}
      value={username}
      onBlur={() => {
        const error = validateNickname(username);

        setErrors((prev) => ({ ...prev, username: error || "" }));
      }}
      onValueChange={setNickname}
    />
  );

  const renderEmailInput = (readOnly = false) => (
    <Input
      isRequired
      endContent={
        readOnly ? (
          <div className="flex items-center gap-1">
            <Button
              className="text-sm"
              isDisabled={isLoading}
              size="sm"
              variant="flat"
              onPress={handleResendCode}
            >
              {isLoading ? <Spinner size="sm" /> : t("auth.actions.resendCode")}
            </Button>
          </div>
        ) : (
          <Tooltip content={t("auth.rules.email")} placement="top">
            <HugeiconsIcon
              className="text-2xl text-default-400"
              icon={Mail02Icon}
            />
          </Tooltip>
        )
      }
      errorMessage={errors.email}
      isInvalid={!!errors.email}
      isReadOnly={readOnly}
      label={t("auth.labels.email")}
      name="email"
      placeholder={t("auth.placeholders.email")}
      type="email"
      value={email}
      onBlur={() => {
        const error = validateEmail(email);

        setErrors((prev) => ({ ...prev, email: error || "" }));
      }}
      onValueChange={setEmail}
    />
  );

  const renderPasswordInput = () => (
    <Input
      isRequired
      endContent={
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            className="focus:outline-none ml-2"
            size="sm"
            type="button"
            variant="bordered"
            onPress={() => setShowPassword(!showPassword)}
          >
            <HugeiconsIcon
              className="text-2xl text-default-400"
              icon={showPassword ? ViewOffSlashIcon : ViewIcon}
            />
          </Button>
          <Tooltip content={t("auth.rules.password")} placement="top">
            <HugeiconsIcon
              className="text-2xl text-default-400"
              icon={LockPasswordIcon}
            />
          </Tooltip>
        </div>
      }
      errorMessage={errors["password"]}
      isInvalid={!!errors["password"]}
      label={t("auth.labels.password")}
      name="password"
      placeholder={t("auth.placeholders.password")}
      type={showPassword ? "text" : "password"}
      value={password}
      onBlur={() => {
        const error = validatePassword(password);

        setErrors((prev) => ({ ...prev, ["password"]: error || "" }));
      }}
      onValueChange={setPassword}
    />
  );

  const renderConfirmPasswordInput = () => {
    const shouldShowError = isConfirmPasswordDirty || !!errors.confirmPassword;
    const isInvalid =
      shouldShowError && !!validateConfirmPassword(password, confirmPassword);

    return (
      <Input
        isRequired
        endContent={
          <Tooltip content={t("auth.rules.confirmPassword")} placement="top">
            <HugeiconsIcon
              className="text-2xl text-default-400 pointer-events-none"
              icon={PasswordValidationIcon}
            />
          </Tooltip>
        }
        errorMessage={
          isInvalid
            ? validateConfirmPassword(password, confirmPassword)
            : undefined
        }
        isInvalid={isInvalid}
        label={t("auth.labels.confirmPassword")}
        name="confirmPassword"
        placeholder={t("auth.placeholders.confirmPassword")}
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onBlur={() => setIsConfirmPasswordDirty(true)}
        onValueChange={(value) => {
          setConfirmPassword(value);
          setIsConfirmPasswordDirty(true);
        }}
      />
    );
  };

  const renderTermsCheckbox = () => (
    <Checkbox
      classNames={{ label: "text-small" }}
      isInvalid={!!errors.terms}
      isSelected={termsAccepted}
      onValueChange={setTermsAccepted}
    >
      {t("auth.footer.acceptTerms")}
      <Link className="ml-1" href="/terms" size="sm">
        {t("auth.footer.termsLink")}
      </Link>
    </Checkbox>
  );

  // Form renderers
  const renderLoginForm = () => (
    <Form onSubmit={handleSubmit}>
      <div className="w-full justify-between space-y-4">
        {renderEmailInput()}
        {renderPasswordInput()}
        <div className="flex justify-between items-center">
          <Checkbox
            classNames={{ label: "text-small" }}
            isSelected={rememberMe}
            onValueChange={setRememberMe}
          >
            {t("auth.footer.rememberMe")}
          </Checkbox>
          <Link
            color="primary"
            size="sm"
            onPress={() => setAuthState(AuthState.Recover)}
          >
            {t("auth.footer.forgotPassword")}
          </Link>
        </div>
        <div className="flex justify-end pt-2">
          <Link
            color="primary"
            size="sm"
            onPress={() => setAuthState(AuthState.Register)}
          >
            {t("auth.footer.notRegistered")}
          </Link>
        </div>
      </div>
    </Form>
  );

  const renderRegisterForm = () => (
    <Form onSubmit={handleSubmit}>
      <div className="w-full justify-between space-y-4">
        {renderNicknameInput()}
        {renderEmailInput()}
        {renderPasswordInput()}
        {renderConfirmPasswordInput()}
        {renderTermsCheckbox()}
        <div className="flex justify-between items-center pt-2">
          <Checkbox
            classNames={{ label: "text-small" }}
            isSelected={rememberMe}
            onValueChange={setRememberMe}
          >
            {t("auth.footer.rememberMe")}
          </Checkbox>
          <Link
            color="primary"
            size="sm"
            onPress={() => setAuthState(AuthState.Login)}
          >
            {t("auth.footer.alreadyRegistered")}
          </Link>
        </div>
      </div>
    </Form>
  );

  const renderRecoverForm = () => (
    <Form onSubmit={handleSubmit}>
      <div className="w-full justify-between space-y-4">
        {renderEmailInput()}
        <div className="flex justify-end pt-2">
          <Link
            color="primary"
            size="sm"
            onPress={() => setAuthState(AuthState.Login)}
          >
            {t("auth.footer.backToLogin")}
          </Link>
        </div>
      </div>
    </Form>
  );

  const renderChangePasswordForm = () => (
    <Form onSubmit={handleSubmit}>
      <div className="w-full justify-between space-y-4">
        {renderEmailInput(true)}
        {renderPasswordInput()}
        {renderConfirmPasswordInput()}
        <div className="flex justify-between items-center pt-2">
          <Checkbox
            classNames={{ label: "text-small" }}
            isSelected={rememberMe}
            onValueChange={setRememberMe}
          >
            {t("auth.footer.rememberMe")}
          </Checkbox>
          <Link
            color="primary"
            size="sm"
            onPress={() => setAuthState(AuthState.Login)}
          >
            {t("auth.footer.backToLogin")}
          </Link>
        </div>
      </div>
    </Form>
  );

  const renderVerificationCodeInput = () => {
    const getValue = (index: number) =>
      verificationCode[index] && verificationCode[index] !== " "
        ? verificationCode[index]
        : "";

    const handleCodeChange = (index: number, value: string) => {
      if (/^[0-9]?$/.test(value)) {
        const codeArr = Array.from(verificationCode.padEnd(6, " "));

        codeArr[index] = value;
        const newCode = codeArr.join("");

        setVerificationCode(newCode);

        if (value && index < 5) {
          const nextInput = document.getElementById(
            `code-${index + 1}`,
          ) as HTMLInputElement;

          if (nextInput) {
            nextInput.focus();
            const length = getValue(index + 1).length;

            nextInput.setSelectionRange(length, length);
          }
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasteData = e.clipboardData
        .getData("text/plain")
        .replace(/\D/g, "")
        .substring(0, 6);

      if (pasteData.length === 6) {
        setVerificationCode(pasteData);
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      const input = e.target as HTMLInputElement;

      if (/^\d$/.test(e.key)) {
        if (input.value !== "" && input.selectionStart === input.selectionEnd) {
          e.preventDefault();
          const codeArr = Array.from(verificationCode.padEnd(6, " "));

          codeArr[index] = e.key;
          setVerificationCode(codeArr.join(""));
          if (index < 5) {
            const nextInput = document.getElementById(
              `code-${index + 1}`,
            ) as HTMLInputElement;

            if (nextInput) {
              nextInput.focus();
              const length = getValue(index + 1).length;

              nextInput.setSelectionRange(length, length);
            }
          }

          return;
        }
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        const codeArr = Array.from(verificationCode.padEnd(6, " "));

        if (codeArr[index].trim() !== "") {
          codeArr[index] = " ";
          setVerificationCode(codeArr.join(""));
        } else if (index > 0) {
          const prevInput = document.getElementById(
            `code-${index - 1}`,
          ) as HTMLInputElement;

          if (prevInput) {
            prevInput.focus();
            const length = getValue(index - 1).length;

            prevInput.setSelectionRange(length, length);
          }
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        const prevInput = document.getElementById(
          `code-${index - 1}`,
        ) as HTMLInputElement;

        if (prevInput) {
          prevInput.focus();
          const length = getValue(index - 1).length;

          prevInput.setSelectionRange(length, length);
        }
      } else if (e.key === "ArrowRight" && index < 5) {
        const nextInput = document.getElementById(
          `code-${index + 1}`,
        ) as HTMLInputElement;

        if (nextInput) {
          nextInput.focus();
          const length = getValue(index + 1).length;

          nextInput.setSelectionRange(length, length);
        }
      }
    };

    return (
      <div className="space-y-6">
        {renderEmailInput(true)}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              className="w-12 h-12 text-center text-xl rounded-lg focus:border-primary focus:outline-none border-3 border-gray-200 dark:border-zinc-700"
              id={`code-${index}`}
              inputMode="numeric"
              maxLength={1}
              pattern="[0-9]*"
              type="text"
              value={getValue(index)}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>
        {errors.verificationCode && (
          <p className="text-danger text-sm text-center">
            {errors.verificationCode}
          </p>
        )}
        <div className="flex justify-center pt-4">
          <Link
            color="primary"
            size="sm"
            onPress={() =>
              setAuthState(
                authState === AuthState.Verify
                  ? AuthState.Register
                  : AuthState.Recover,
              )
            }
          >
            {authState === AuthState.Verify
              ? t("auth.footer.backToRegistration")
              : t("auth.footer.backToRecover")}
          </Link>
        </div>
      </div>
    );
  };

  // Determine which form to render
  const renderCurrentForm = () => {
    // TODO: Implement verification code input for not-verified account with resend button
    switch (authState) {
      case AuthState.Register:
        return renderRegisterForm();
      case AuthState.Verify:
      case AuthState.RecoverVerify:
        return renderVerificationCodeInput();
      case AuthState.Recover:
        return renderRecoverForm();
      case AuthState.ChangePassword:
        return renderChangePasswordForm();
      default:
        return renderLoginForm();
    }
  };

  // Get header text based on auth state
  const getHeaderText = () => {
    switch (authState) {
      case AuthState.Register:
        return t("auth.header.register");
      case AuthState.Verify:
        return t("auth.header.verifyEmail");
      case AuthState.Recover:
        return t("auth.header.recoverAccount");
      case AuthState.RecoverVerify:
        return t("auth.header.recoverVerify");
      case AuthState.ChangePassword:
        return t("auth.header.changePassword");
      default:
        return t("auth.header.login");
    }
  };

  // Get submit button text based on auth state
  const getSubmitButtonText = () => {
    switch (authState) {
      case AuthState.Register:
        return t("auth.actions.register");
      case AuthState.Verify:
      case AuthState.RecoverVerify:
        return t("auth.actions.verify");
      case AuthState.Recover:
        return t("auth.actions.recover");
      case AuthState.ChangePassword:
        return t("auth.actions.changePassword");
      default:
        return t("auth.actions.signIn");
    }
  };

  /**
   * Main Component Render
   *
   * Returns modal with dynamic content based on current auth state
   */
  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "max-w-md",
        wrapper: "items-center",
      }}
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
              {getHeaderText()}
            </ModalHeader>
            <ModalBody>
              {renderCurrentForm()}
              {authState === AuthState.Login ? (
                <>
                  <Divider className="mt-4 mb-4" />
                  <div className="flex flex-col gap-2 mb-4">
                    <Button
                      className="w-full flex items-center justify-center"
                      variant="ghost"
                      onPress={() =>
                        (window.location.href = `${API_BASE_URL}/api/auth/google/login`)
                      }
                    >
                      <HugeiconsIcon
                        className="text-lg mr-2"
                        icon={GoogleIcon}
                      />
                      {t("auth.oauth.google")}
                    </Button>
                    <Button
                      className="w-full flex items-center justify-center"
                      variant="ghost"
                      onPress={() =>
                        (window.location.href = `${API_BASE_URL}/api/auth/github/login`)
                      }
                    >
                      <HugeiconsIcon
                        className="text-lg mr-2"
                        icon={Github01Icon}
                      />
                      {t("auth.oauth.github")}
                    </Button>
                  </div>
                </>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                isDisabled={isLoading}
                variant="light"
                onPress={onClose}
              >
                {t("auth.actions.close")}
              </Button>
              <Button
                color="primary"
                isDisabled={!isFormValid || isLoading}
                onPress={() => handleSubmit()}
              >
                {isLoading ? (
                  <Spinner color="white" size="sm" />
                ) : (
                  getSubmitButtonText()
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
