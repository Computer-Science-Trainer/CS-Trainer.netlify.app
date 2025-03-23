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
} from "@heroui/react";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import {
    User03Icon,
    Mail02Icon,
    LockPasswordIcon,
    PasswordValidationIcon,
    ViewIcon,
    ViewOffSlashIcon
} from '@hugeicons/core-free-icons';

// Enum representing the different authentication states: Login, Register, and Recover.
enum AuthState {
    Login,
    Register,
    Recover,
}

// Props for the LoginWindow component, including its open state and a callback to change that state.
interface LoginWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

// The LoginWindow component renders a modal for user authentication.
// It manages state for different auth modes (login, register, recover) and form fields.
export default function LoginWindow({ isOpen, onOpenChange }: LoginWindowProps) {
    // Current authentication state (Login, Register, or Recover)
    const [authState, setAuthState] = useState<AuthState>(AuthState.Login);

    // Form field states
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
                        className={`text-2xl cursor-pointer ${getInputProps(nickname, nicknameError).color}`}
                    />
                </Tooltip>
            }
        />
    );

    // Renders the Email input field for all authentication states.
    const renderEmailInput = () => (
        <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            variant="bordered"
            endContent={
                <Tooltip content={getInputProps(email, emailError).tooltip} placement="top">
                    <HugeiconsIcon
                        icon={Mail02Icon}
                        className={`text-2xl cursor-pointer ${getInputProps(email, emailError).color}`}
                    />
                </Tooltip>
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
                        {showPassword ? <HugeiconsIcon icon={ViewOffSlashIcon} /> : <HugeiconsIcon icon={ViewIcon} />}
                    </Button>
                    {authState === AuthState.Login ? (
                        <HugeiconsIcon icon={LockPasswordIcon} className="text-default-400" />
                    ) : (
                        <Tooltip content={getInputProps(password, passwordError).tooltip} placement="top">
                            <HugeiconsIcon icon={LockPasswordIcon} className={`${getInputProps(password, passwordError).color}`} />
                        </Tooltip>
                    )}
                </div>
            }
        />
    );

    // Renders the Confirm Password input field for the Register state.
    const renderConfirmPasswordInput = () => (
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
                        className={`text-2xl cursor-pointer ${getInputProps(confirmPassword, confirmPasswordError).color}`}
                    />
                </Tooltip>
            }
        />
    );

    // Determines whether the primary action button should be disabled based on the current state and form validation errors.
    // - For Login state: disables if email or password are missing or email is invalid.
    // - For Register state: disables if any required field (nickname, email, password, confirmPassword) is missing or any has validation errors.
    // - For Recover state: disables if email is missing or invalid.
    const isActionDisabled =
        authState === AuthState.Login ? !email || !password || !!emailError :
        authState === AuthState.Register ? !nickname || !email || !password || !confirmPassword ||
        !!nicknameError || !!emailError || !!passwordError || !!confirmPasswordError :
        !email || !!emailError;

    // Returns the text to be displayed in the header of the modal based on the current authentication state.
    // - For Register state: returns "Register"
    // - For Recover state: returns "Recover password"
    // - For Login state: returns "Log In"
    const getHeaderText = () => {
        switch (authState) {
            case AuthState.Register:
                return "Register";
            case AuthState.Recover:
                return "Recover password";
            default:
                return "Log In";
        }
    };

    // Returns the text to be displayed on the primary action button based on the current authentication state.
    // - For Register state: returns "Sign up"
    // - For Recover state: returns "Recover"
    // - For Login state: returns "Sign in"
    const getActionButtonText = () => {
        switch (authState) {
            case AuthState.Register:
                return "Sign up";
            case AuthState.Recover:
                return "Recover";
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
                            {authState !== AuthState.Recover && renderPasswordInput()}
                            {authState === AuthState.Register && renderConfirmPasswordInput()}
                            {renderFooterLinks()}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <Button {...(isActionDisabled && { isDisabled: true })} color="primary" onPress={onClose}>
                                {getActionButtonText()}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
