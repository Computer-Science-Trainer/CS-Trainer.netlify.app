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
    addToast,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import {
    User03Icon,
    Mail02Icon,
    LockPasswordIcon,
    PasswordValidationIcon,
    ViewIcon,
    ViewOffSlashIcon,
    SquareArrowReload02Icon
} from '@hugeicons/core-free-icons';

// Enum representing the different authentication states: Login, Register, Verify (for registration),
// Recover (initial recover stage), RecoverVerify (code verification for recovery) and ChangePassword (password change form).
enum AuthState {
    Login,
    Register,
    Verify,       // New state for email verification code input during registration
    Recover,      // Initial recover stage: пользователь видит email и может запросить отправку кода
    RecoverVerify,// Этап ввода 6-значного кода для восстановления аккаунта
    ChangePassword, // Окно смены пароля после успешной проверки кода
}

// Props for the LoginWindow component, including its open state and a callback to change that state.
interface LoginWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

// The LoginWindow component renders a modal for user authentication.
// It manages state for different auth modes (login, register, verify, recover, recover verify, change password) and form fields.
export default function LoginWindow({ isOpen, onOpenChange }: LoginWindowProps) {
    // Current authentication state (Login, Register, Verify, Recover, RecoverVerify, or ChangePassword)
    const [authState, setAuthState] = useState<AuthState>(AuthState.Login);

    // Form field states for registration/login
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // New state for verification code input during registration or recovery.
    // В этом случае мы храним код как строку длиной до 6 символов.
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationCodeError, setVerificationCodeError] = useState("");

    // Error messages for form field validation
    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    // Validation functions for input fields
    // Validates that nickname has at least 4 characters and contains only Latin letters and numbers
    const validateNickname = (value: string): boolean => /^[A-Za-z0-9]{4,}$/.test(value);
    // Validates a correct email format
    const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    // Validates that password is 8-64 characters long and contains only Latin letters and numbers
    const validatePassword = (value: string): boolean => /^[A-Za-z0-9]{8,64}$/.test(value);
    // Validates that the verification code is exactly 6 digits
    const validateVerificationCode = (value: string): boolean => /^\d{6}$/.test(value);

    // Interface for input properties used to style the icons and provide tooltips.
    interface InputProps {
        color: string;
        tooltip: string;
    }
    // Returns properties (color and tooltip message) for the input icon based on the value and error state.
    const getInputProps = (value: string, error: string): InputProps => ({
        color: !value ? "text-default-400" : error ? "text-red-500" : "text-green-400",
        tooltip: !value ? "Введите данные" : error ? error : "Данные корректны",
    });

    // Event handler for changes in the Nickname input field.
    // Updates the nickname state and sets an error message if validation fails.
    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setNickname(value);
        setNicknameError(validateNickname(value) ? "" : "Минимум 4 символа, только латинские буквы и цифры.");
    };

    // Event handler for changes in the Email input field.
    // Updates the email state and sets an error message if the email is not valid.
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value) ? "" : "Некорректный email.");
    };

    // Event handler for changes in the Password input field.
    // Updates the password state, validates the password, and also checks the confirm password field if necessary.
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setPassword(value);
        setPasswordError(validatePassword(value) ? "" : "Пароль должен содержать 8-64 символов, только латинские буквы и цифры.");
        if (confirmPassword) {
            setConfirmPasswordError(value === confirmPassword ? "" : "Пароли не совпадают.");
        }
    };

    // Event handler for changes in the Confirm Password input field.
    // Updates the confirmPassword state and sets an error if it doesn't match the password.
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordError(value === password ? "" : "Пароли не совпадают.");
    };

    // State to determine if the password should be shown in plain text.
    const [showPassword, setShowPassword] = useState(false);
    // Toggles the visibility of the password.
    const toggleShowPassword = () => setShowPassword(prev => !prev);
    // When the authentication state changes, reset the password visibility to false.
    useEffect(() => {
        setShowPassword(false);
    }, [authState]);

    // Renders the Nickname input field for the Register state.
    const renderNicknameInput = () => (
        <Input
            label="Nickname"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={handleNicknameChange}
            variant="bordered"
            endContent={
                <Tooltip content={getInputProps(nickname, nicknameError).tooltip} placement="top">
                    <HugeiconsIcon
                        icon={User03Icon}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                        className={`text-2xl cursor-pointer ${getInputProps(nickname, nicknameError).color}`}
                    />
                </Tooltip>
            }
        />
    );

    // Renders the Email input field for all authentication states.
    // Делаем поле только для чтения, если пользователь находится на этапах верификации или восстановления.
    const renderEmailInput = () => (
        <Input
            isReadOnly={authState === AuthState.Verify || authState === AuthState.RecoverVerify || authState === AuthState.ChangePassword}
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            variant="bordered"
            endContent={
                <div className="flex items-center gap-1">
                    {authState === AuthState.Verify || authState === AuthState.RecoverVerify ? (
                        <Tooltip content="Resend Email" placement="top">
                            <Button size="sm" isIconOnly onPress={() => console.log("Resending verification code to", email)} variant="ghost" className="opacity-70">
                                <HugeiconsIcon
                                    icon={SquareArrowReload02Icon}
                                    onMouseDown={(e) => e.preventDefault()}
                                    style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                                />
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip content={getInputProps(email, emailError).tooltip} placement="top">
                            <HugeiconsIcon
                                icon={Mail02Icon}
                                onMouseDown={(e) => e.preventDefault()}
                                style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                                className={`text-2xl cursor-pointer ${getInputProps(email, emailError).color}`}
                            />
                        </Tooltip>
                    )}
                </div>
            }
        />
    );

    // Renders the Password input field for Login and Register states.
    // Includes a button to toggle password visibility and shows appropriate icon tooltip.
    const renderPasswordInput = () => (
        <Input
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            variant="bordered"
            value={password}
            onChange={handlePasswordChange}
            errorMessage={!validatePassword(password) && password ? "Invalid password format" : ""}
            endContent={
                <div className="flex items-center gap-1">
                    <Button size="sm" isIconOnly onPress={toggleShowPassword} variant="ghost" className="opacity-70">
                        {showPassword ? 
                            <HugeiconsIcon
                                icon={ViewOffSlashIcon}
                                onMouseDown={(e) => e.preventDefault()}
                                style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                            /> 
                        : 
                            <HugeiconsIcon
                                icon={ViewIcon}
                                onMouseDown={(e) => e.preventDefault()}
                                style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                            />}
                    </Button>
                    {authState === AuthState.Login ? (
                        <HugeiconsIcon
                        icon={LockPasswordIcon}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                        className="text-default-400" />
                    ) : (
                        <Tooltip content={getInputProps(password, passwordError).tooltip} placement="top">
                            <HugeiconsIcon
                            icon={LockPasswordIcon} 
                            onMouseDown={(e) => e.preventDefault()}
                            style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                            className={`${getInputProps(password, passwordError).color}`} />
                        </Tooltip>
                    )}
                </div>
            }
        />
    );

    // Renders the Confirm Password input field for the Register state.
    const renderConfirmPasswordInput = () => (
        // TODO: Back to Login on ChangePassword
        <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            type={showPassword ? "text" : "password"}
            variant="bordered"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            endContent={
                <Tooltip content={getInputProps(confirmPassword, confirmPasswordError).tooltip} placement="top">
                    <HugeiconsIcon
                        icon={PasswordValidationIcon}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                        className={`text-2xl cursor-pointer ${getInputProps(confirmPassword, confirmPasswordError).color}`}
                    />
                </Tooltip>
            }
        />
    );

    /**
     * Renders the Verify Email stage for registration.
     * Displays:
     * - 6 individual input cells for a single-digit code.
     * - A "Back to Registration" link.
     */
    const renderVerificationCodeInput = () => {
        // Обработчик для изменения значения в конкретной ячейке.
        const handleCellChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (/^\d?$/.test(val)) {
                const codeArr = verificationCode.split("");
                while (codeArr.length < 6) codeArr.push("");
                codeArr[index] = val;
                const newCode = codeArr.join("");
                setVerificationCode(newCode);
                if (val && index < 5) {
                    const nextInput = document.getElementById(`code-${index + 1}`);
                    if (nextInput) (nextInput as HTMLInputElement).focus();
                }
            }
        };

        const inputs = [];
        for (let i = 0; i < 6; i++) {
            inputs.push(
                <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    maxLength={1}
                    value={verificationCode[i] || ""}
                    onChange={(e) => handleCellChange(i, e)}
                    className="w-10 h-10 border-2 border-default-300 text-center mx-1 rounded-xl"
                />
            );
        }
        return (
            <div className="flex flex-col items-center">
                {/* Ячейки ввода кода */}
                <div className="flex justify-center">{inputs}</div>
                {/* Ссылка "Back to Registration" */}
                <div className="flex gap-4 mt-4">
                    <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Register)}>
                        Back to Registration
                    </Link>
                </div>
            </div>
        );
    };

    // Determines whether the primary action button should be disabled based on the current state and form validation errors.
    // - For Login state: disables if email or password are missing or email is invalid.
    // - For Register state: disables if any required field (nickname, email, password, confirmPassword) is missing or any has validation errors.
    // - For Verify state: disables if verification code is missing or invalid.
    // - For Recover state: disables if email is missing or email is invalid.
    // - For RecoverVerify state: disables if verification code is missing or invalid.
    // - For ChangePassword state: disables if new password fields are missing or invalid.
    const isActionDisabled =
        authState === AuthState.Login ? !email || !password || !!emailError :
        authState === AuthState.Register ? !nickname || !email || !password || !confirmPassword ||
        !!nicknameError || !!emailError || !!passwordError || !!confirmPasswordError :
        authState === AuthState.Verify ? !verificationCode || !!verificationCodeError :
        authState === AuthState.Recover ? !email || !!emailError :
        authState === AuthState.RecoverVerify ? !verificationCode || !!verificationCodeError :
        authState === AuthState.ChangePassword ? !password || !confirmPassword || !!passwordError || !!confirmPasswordError :
        false;

    // Returns the text to be displayed in the header of the modal based on the current authentication state.
    // - For Register state: returns "Register"
    // - For Verify state: returns "Verify Email"
    // - For Recover state: returns "Recover Account"
    // - For RecoverVerify state: returns "Verify Recovery Code"
    // - For ChangePassword state: returns "Change Password"
    // - For Login state: returns "Log In"
    const getHeaderText = () => {
        switch (authState) {
            case AuthState.Register:
                return "Register";
            case AuthState.Verify:
                return "Verify Email";
            case AuthState.Recover:
                return "Recover Account";
            case AuthState.RecoverVerify:
                return "Verify Recovery Code";
            case AuthState.ChangePassword:
                return "Change Password";
            default:
                return "Log In";
        }
    };

    // Returns the text to be displayed on the primary action button based on the current authentication state.
    // - For Register state: returns "Send Verification Code" (to trigger sending code)
    // - For Verify state: returns "Verify" (to finish registration)
    // - For Recover state: returns "Send Recovery Code" (to trigger sending code)
    // - For RecoverVerify state: returns "Verify" (to proceed to password change)
    // - For ChangePassword state: returns "Change Password"
    // - For Login state: returns "Sign in"
    const getActionButtonText = () => {
        switch (authState) {
            case AuthState.Register:
                return "Send Verification Code";
            case AuthState.Verify:
                return "Verify";
            case AuthState.Recover:
                return "Send Recovery Code";
            case AuthState.RecoverVerify:
                return "Verify";
            case AuthState.ChangePassword:
                return "Change Password";
            default:
                return "Sign in";
        }
    };

    /**
     * Renders the footer section containing links and checkboxes based on the current authentication state.
     *
     * - For Login state: displays a "Remember me" checkbox, "Forgot password?" link, and "Not registered yet?" link.
     * - For Register state: displays a "Remember me" checkbox and "Already have an account?" link.
     * - For Recover state: displays a "Back to login" link.
     * - For Verify state: ссылки уже отображаются в самом компоненте этапа верификации.
     */
    const renderFooterLinks = () => {
        if (authState === AuthState.Login) {
            return (
                <>
                    <div className="flex py-2 px-1 justify-between">
                        <Checkbox classNames={{ label: "text-small" }}>Remember me</Checkbox>
                        <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Recover)}>
                            Forgot password?
                        </Link>
                    </div>
                    <div className="flex py-0 px-1 justify-between">
                        <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Register)}>
                            Not registered yet?
                        </Link>
                    </div>
                </>
            );
        } else if (authState === AuthState.Register) {
            return (
                <div className="flex py-2 px-1 justify-between">
                    <Checkbox classNames={{ label: "text-small" }}>Remember me</Checkbox>
                    <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Login)}>
                        Already have an account?
                    </Link>
                </div>
            );
        } else if (authState === AuthState.Recover) {
            return (
                <div className="flex py-2 px-1 justify-end">
                    <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Login)}>
                        Back to login
                    </Link>
                </div>
            );
        } else if (authState === AuthState.ChangePassword) {
            return (
                <div className="flex py-2 px-1 justify-end">
                    <Checkbox classNames={{ label: "text-small" }}>Remember me</Checkbox>
                </div>
            );
        }
    };

    // Primary action button handler.
    // Handles different actions based on the current auth state:
    // - For Login: performs sign in and shows a success toast.
    // - For Register: sends the verification code to the user's email and switches to Verify state.
    // - For Verify: validates the verification code and, if valid, completes registration (shows toast).
    // - For Recover: sends the recovery code to the user's email and switches to RecoverVerify state.
    // - For RecoverVerify: validates the recovery code and, if valid, switches to ChangePassword stage.
    // - For ChangePassword: validates new password fields, updates the password, shows a success toast, and closes the modal.
    const handleAction = () => {
        if (authState === AuthState.Login) {
            // Здесь должна быть логика входа; при успешном входе показываем toast.
            console.log("Logged in successfully.");
            addToast({ title: "Success", description: "Logged in successfully.", color: "success" });
            onOpenChange(false);
        } else if (authState === AuthState.Register) {
            // Логика отправки verification code на email для регистрации.
            console.log("Sending verification code to", email);
            setAuthState(AuthState.Verify);
        } else if (authState === AuthState.Verify) {
            // Логика проверки введённого verification code для регистрации.
            if (validateVerificationCode(verificationCode)) {
                console.log("Verification successful. Registration completed.");
                addToast({ title: "Success", description: "Registration completed successfully.", color: "success" });
                onOpenChange(false);
            } else {
                console.log("Invalid verification code.");
            }
        } else if (authState === AuthState.Recover) {
            // Логика отправки recovery code на email для восстановления аккаунта.
            console.log("Sending recovery code to", email);
            setAuthState(AuthState.RecoverVerify);
        } else if (authState === AuthState.RecoverVerify) {
            // Логика проверки введённого recovery code.
            if (validateVerificationCode(verificationCode)) {
                console.log("Recovery code verified.");
                setAuthState(AuthState.ChangePassword);
            } else {
                console.log("Invalid recovery code.");
            }
        } else if (authState === AuthState.ChangePassword) {
            if (!password || !confirmPassword || password !== confirmPassword || !validatePassword(password)) {
                if (!validatePassword(password)) setPasswordError("Password must be 8-64 chars, only Latin letters and digits.");
                if (password !== confirmPassword) setConfirmPasswordError("Passwords do not match.");
            } else {
                console.log("Password changed successfully.");
                addToast({ title: "Success", description: "Password changed successfully. Logged in.", color: "success" });
                onOpenChange(false);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {getHeaderText()}
                        </ModalHeader>
                        <ModalBody>
                            {authState === AuthState.Register && renderNicknameInput()}
                            {renderEmailInput()}
                            {authState === AuthState.Login && renderPasswordInput()}
                            {(authState === AuthState.Register || authState === AuthState.ChangePassword) && renderPasswordInput()}
                            {(authState === AuthState.Register || authState === AuthState.ChangePassword) && renderConfirmPasswordInput()}
                            {authState === AuthState.Verify && renderVerificationCodeInput()}
                            {authState === AuthState.RecoverVerify && renderVerificationCodeInput()}
                            {renderFooterLinks()}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <Button {...(isActionDisabled && { isDisabled: true })} color="primary" onPress={handleAction}>
                                {getActionButtonText()}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
