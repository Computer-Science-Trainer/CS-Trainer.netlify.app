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
  import { useTranslations } from "next-intl";
  
  enum AuthState {
    Login,
    Register,
    Verify,
    Recover,
    RecoverVerify,
    ChangePassword,
  }
  
  interface AuthWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onAuthSuccess?: (token?: string) => void;
  }  
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  interface ApiError extends Error {
    response?: Response;
    detail?: {
      code?: string;
    } | string;
  }

  async function makeApiRequest(
    endpoint: string,
    method: string,
    body?: any
) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error: ApiError = new Error(
            typeof errorData.detail === 'string' 
              ? errorData.detail 
              : errorData.detail?.code || errorData.message || 'Request failed'
          );
        error.response = response;
        error.detail = errorData.detail;
        throw error;
    }

    return response.json();
}

  export default function AuthWindow({ isOpen, onOpenChange, onAuthSuccess }: AuthWindowProps) {
    const t = useTranslations();
    const [isLoading, setIsLoading] = useState(false);
  
    // Form states
    const [authState, setAuthState] = useState<AuthState>(AuthState.Login);
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [isConfirmPasswordDirty, setIsConfirmPasswordDirty] = useState(false);

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (password && confirmPassword && isConfirmPasswordDirty) {
          const error = validateConfirmPassword(password, confirmPassword);
          setErrors(prev => ({
            ...prev,
            confirmPassword: error || ''
          }));
        }
    }, [password, confirmPassword, isConfirmPasswordDirty]);

    // const resetForm = () => {
    //   setAuthState(AuthState.Login);
    //   setNickname("");
    //   setEmail("");
    //   setPassword("");
    //   setConfirmPassword("");
    //   setNewPassword("");
    //   setConfirmNewPassword("");
    //   setVerificationCode("");
    //   setTermsAccepted(false);
    //   setErrors({});
    //   setShowPassword(false);
    //   setShowNewPassword(false);
    //   setIsLoading(false);
    // };
  
    // Validation functions
    const validateEmail = useCallback((value: string): string | null => {
      if (!value) return t("auth.errors.emailMissing");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return t("auth.errors.emailInvalid");
      return null;
    }, [t]);
  
    const validateNickname = useCallback((value: string): string | null => {
      if (!value) return t("auth.errors.nicknameMissing");
      if (value.length < 3) return t("auth.errors.nicknameShort");
      if (value.length > 20) return t("auth.errors.nicknameLong");
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return t("auth.errors.nicknameInvalid");
      return null;
    }, [t]);
  
    const validatePassword = useCallback((value: string): string | null => {
        if (!value) return t("auth.errors.passwordMissing");
        if (value.length < 8) return t("auth.errors.passwordShort");
        return null;
      }, [t]);
  
    const validateConfirmPassword = useCallback(
      (password: string, confirm: string): string | null => {
        if (!confirm) return t("auth.errors.confirmPasswordMissing");
        if (password !== confirm) return t("auth.errors.passwordMismatch");
        return null;
      },
      [t]
    );
  
    const validateVerificationCode = useCallback((code: string): string | null => {
      if (!code) return t("auth.errors.codeMissing");
      if (code.length !== 6) return t("auth.errors.codeInvalid");
      return null;
    }, [t]);
  
    // Validate current form
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
          const nicknameError = validateNickname(nickname);
          const regEmailError = validateEmail(email);
          const regPasswordError = validatePassword(password);
          const confirmError = validateConfirmPassword(password, confirmPassword);
          if (nicknameError) newErrors.nickname = nicknameError;
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
          const confirmNewError = validateConfirmPassword(password, confirmPassword);
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
      nickname,
      confirmPassword,
      verificationCode,
      termsAccepted,
      validateEmail,
      validateNickname,
      validatePassword,
      validateConfirmPassword,
      validateVerificationCode,
      t
    ]);
  
    // Check if form is ready for submission
    const isFormValid = useMemo(() => {
      switch (authState) {
        case AuthState.Login:
          return !!email && !!password && !validateEmail(email) && !validatePassword(password);
  
        case AuthState.Register:
          return (
            !!nickname &&
            !!email &&
            !!password &&
            !!confirmPassword &&
            !validateNickname(nickname) &&
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
      nickname,
      confirmPassword,
      verificationCode,
      termsAccepted,
      validateEmail,
      validateNickname,
      validatePassword,
      validateConfirmPassword
    ]);
  
    const handleLogin = async () => {
        try {
            const data = await makeApiRequest(
                'auth/login',
                'POST',
                { email, password }
            );
            
            addToast({
                title: t("auth.success.title.loginSuccess"),
                description: t("auth.success.loginSuccess"),
                color: 'success'
            });
            
            if (onAuthSuccess) onAuthSuccess(data.token);
            onOpenChange(false);
        } catch (error: any) {
            if (error.message === "account_not_verified") {
                setAuthState(AuthState.Verify);
                addToast({
                    title: t("auth.errors.title.accountNotVerified"),
                    description: t("auth.errors.detail.accountNotVerified"),
                    color: 'warning'
                });
            } else {
                addToast({
                    title: t("auth.errors.title.loginFailed"),
                    description: t(`auth.errors.detail.${error.message}`),
                    color: 'danger'
                });
            }
        }
    };

    const handleRegister = async () => {
        try {
            await makeApiRequest('auth/register', 'POST', { email, password, nickname });
            setAuthState(AuthState.Verify);
        } catch (error: any) {
            addToast({
                title: t("auth.errors.title.registerFailed"),
                description: t(`auth.errors.detail.${error.message}`),
                color: 'danger'
            });
        }
    };

    const handleVerify = async () => {
        try {
            const data = await makeApiRequest('auth/verify', 'POST', { email, code: verificationCode });
            addToast({
                title: t("auth.success.title.verifySuccess"),
                description: t("auth.success.verifySuccess"),
                color: 'success'
            });
            if (onAuthSuccess) onAuthSuccess(data.token);
            onOpenChange(false);
        } catch (error: any) {
            addToast({
                title: t("auth.errors.title.verifyFailed"),
                description: t(`auth.errors.detail.${error.message}`),
                color: 'danger'
            });
        }
    };

    const handleRecover = async () => {
        try {
            await makeApiRequest('auth/recover', 'POST', { email });
            setAuthState(AuthState.RecoverVerify);
        } catch (error: any) {
            addToast({
                title: t("auth.errors.title.recoverFailed"),
                description: t(`auth.errors.detail.${error.message}`),
                color: 'danger'
            });
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        try {
          await makeApiRequest('auth/verify/resend', 'POST', {
            email,
            code_type: authState === AuthState.Verify ? 'verification' : 'recovery'
          });
          addToast({
            title: t("auth.success.title.codeResent"),
            description: t("auth.success.codeResent"),
            color: 'success'
          });
        } catch (error: any) {
          addToast({
            title: t("auth.errors.title.resendFailed"),
            description: t(`auth.errors.detail.${error.message}`),
            color: 'danger'
          });
        } finally {
          setIsLoading(false);
        }
      };

    const handleRecoverVerify = async () => {
        try {
            await makeApiRequest('auth/recover/verify', 'POST', { email, code: verificationCode });
            setAuthState(AuthState.ChangePassword);
        } catch (error: any) {
            addToast({
                title: t("auth.errors.title.recoverVerifyFailed"),
                description: t(`auth.errors.detail.${error.message}`),
                color: 'danger'
            });
        }
    };

    const handleChangePassword = async () => {
        try {
            const data = await makeApiRequest('auth/recover/change', 'POST', { 
                email, 
                code: verificationCode, 
                password 
            });
            addToast({
                title: t("auth.success.title.changePasswordSuccess"),
                description: t("auth.success.changePasswordSuccess"),
                color: 'success'
            });
            if (onAuthSuccess) onAuthSuccess(data.token);
            onOpenChange(false);
        } catch (error: any) {
            addToast({
                title: t("auth.errors.changePasswordFailed"),
                description: t(`auth.errors.detail.${error.message}`),
                color: 'danger'
            });
        }
    };

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
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
      }, [
        authState,
        email,
        password,
        nickname,
        confirmPassword,
        verificationCode,
        termsAccepted,
        validateCurrentForm,
        t
      ]);
  
    // Input field renderers
    const renderNicknameInput = () => (
      <Input
        isRequired
        name="nickname"
        label={t("auth.labels.nickname")}
        placeholder={t("auth.placeholders.nickname")}
        value={nickname}
        onValueChange={setNickname}
        onBlur={() => {
          const error = validateNickname(nickname);
          setErrors(prev => ({ ...prev, nickname: error || '' }));
        }}
        endContent={
          <Tooltip content={t("auth.rules.nickname")} placement="top">
            <HugeiconsIcon icon={User03Icon} className="text-2xl text-default-400" />
          </Tooltip>
        }
        errorMessage={errors.nickname}
        isInvalid={!!errors.nickname}
      />
    );
  
    const renderEmailInput = (readOnly = false) => (
        <Input
        isRequired
        isReadOnly={readOnly}
        name="email"
        label={t("auth.labels.email")}
        placeholder={t("auth.placeholders.email")}
        type="email"
        value={email}
        onValueChange={setEmail}
        onBlur={() => {
          const error = validateEmail(email);
          setErrors(prev => ({ ...prev, email: error || '' }));
        }}
        endContent={
          readOnly ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="flat"
                onPress={handleResendCode}
                isDisabled={isLoading}
                className="text-sm"
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                    t("auth.actions.resendCode")
                )}
              </Button>
            </div>
          ) : (
            <Tooltip content={t("auth.rules.email")} placement="top">
              <HugeiconsIcon icon={Mail02Icon} className="text-2xl text-default-400" />
            </Tooltip>
          )
        }
        errorMessage={errors.email}
        isInvalid={!!errors.email}
      />
    );
  
    const renderPasswordInput = () => (
      <Input
        isRequired
        name='password'
        label={t("auth.labels.password")}
        placeholder={t("auth.placeholders.password")}
        type={showPassword ? "text" : "password"}
        value={password}
        onValueChange={setPassword}
        onBlur={() => {
          const error = validatePassword(password);
          setErrors(prev => ({ ...prev, ['password']: error || '' }));
        }}
        endContent={
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              type="button"
              variant="bordered"
              onPress={() => setShowPassword(!showPassword)}
              className="focus:outline-none ml-2"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                className="text-2xl text-default-400"
              />
            </Button>
            <Tooltip content={t("auth.rules.password")} placement="top">
              <HugeiconsIcon icon={LockPasswordIcon} className="text-2xl text-default-400" />
            </Tooltip>
          </div>
        }
        errorMessage={errors['password']}
        isInvalid={!!errors['password']}
      />
    );
  
    const renderConfirmPasswordInput = () => {
        const shouldShowError = isConfirmPasswordDirty || !!errors.confirmPassword;
        const isInvalid = shouldShowError && !!validateConfirmPassword(password, confirmPassword);
    
        return (
          <Input
            isRequired
            name="confirmPassword"
            label={t("auth.labels.confirmPassword")}
            placeholder={t("auth.placeholders.confirmPassword")}
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onValueChange={(value) => {
              setConfirmPassword(value);
              setIsConfirmPasswordDirty(true);
            }}
            onBlur={() => setIsConfirmPasswordDirty(true)}
            endContent={
              <Tooltip content={t("auth.rules.confirmPassword")} placement="top">
                <HugeiconsIcon
                  icon={PasswordValidationIcon}
                  className="text-2xl text-default-400 pointer-events-none"
                />
              </Tooltip>
            }
            errorMessage={isInvalid ? validateConfirmPassword(password, confirmPassword) : undefined}
            isInvalid={isInvalid}
          />
        );
      };
    
  
    const renderTermsCheckbox = () => (
      <Checkbox
        isSelected={termsAccepted}
        onValueChange={setTermsAccepted}
        classNames={{ label: "text-small" }}
        isInvalid={!!errors.terms}
      >
        {t("auth.footer.acceptTerms")}
        <Link href="/terms" className="ml-1" size="sm">
          {t("auth.footer.termsLink")}
        </Link>
      </Checkbox>
    );
  
    // Form renderers
    const renderLoginForm = () => (
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderEmailInput()}
        {renderPasswordInput()}
        <div className="flex justify-between items-center">
          <Checkbox classNames={{ label: "text-small" }}>
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
      </form>
    );
  
    const renderRegisterForm = () => (
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderNicknameInput()}
        {renderEmailInput()}
        {renderPasswordInput()}
        {renderConfirmPasswordInput()}
        {renderTermsCheckbox()}
        <div className="flex justify-between items-center pt-2">
          <Checkbox classNames={{ label: "text-small" }}>
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
      </form>
    );
  
    const renderRecoverForm = () => (
      <form onSubmit={handleSubmit} className="space-y-4">
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
      </form>
    );
  
    const renderChangePasswordForm = () => (
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderEmailInput(true)}
        {renderPasswordInput()}
        {renderConfirmPasswordInput()}
        <div className="flex justify-between items-center pt-2">
          <Checkbox classNames={{ label: "text-small" }}>
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
      </form>
    );
  
    const renderVerificationCodeInput = () => {
        const handleCodeChange = (index: number, value: string) => {
          if (/^[0-9]?$/.test(value)) {
            const codeArr = Array.from(verificationCode.padEnd(6, ' '));
            codeArr[index] = value;
            const newCode = codeArr.join('').trim();
            setVerificationCode(newCode);
            
            if (value && index < 5) {
              const nextInput = document.getElementById(`code-${index + 1}`);
              if (nextInput) (nextInput as HTMLInputElement).focus();
            }
          }
        };
      
        const handlePaste = (e: React.ClipboardEvent) => {
          e.preventDefault();
          const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').substring(0, 6);
          if (pasteData.length === 6) {
            setVerificationCode(pasteData);
          }
        };
  
      return (
        <div className="space-y-6">
          {renderEmailInput(true)}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={verificationCode[index] || ""}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl border-2 rounded-lg focus:border-primary focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>
          {errors.verificationCode && (
            <p className="text-danger text-sm text-center">{errors.verificationCode}</p>
          )}
          <div className="flex justify-center pt-4">
            <Link 
              color="primary" 
              size="sm" 
              onPress={() => setAuthState(
                authState === AuthState.Verify ? AuthState.Register : AuthState.Recover
              )}
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
  
    return (
      <Modal 
        isOpen={isOpen} 
        placement="center" 
        onOpenChange={onOpenChange}
        backdrop="blur"
        classNames={{
          base: "max-w-md",
          wrapper: "items-center",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
                {getHeaderText()}
              </ModalHeader>
              <ModalBody>
                {renderCurrentForm()}
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="default" 
                  variant="light" 
                  onPress={onClose}
                  isDisabled={isLoading}
                >
                  {t("auth.actions.close")}
                </Button>
                <Button 
                    color="primary" 
                    onPress={() => handleSubmit()} // Без передачи события
                    isDisabled={!isFormValid || isLoading}
                    >
                    {isLoading ? <Spinner color="white" size="sm" /> : getSubmitButtonText()}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }