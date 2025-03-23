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
import { User03Icon, Mail02Icon, LockPasswordIcon, PasswordValidationIcon, ViewIcon, ViewOffSlashIcon} from '@hugeicons/core-free-icons';


interface LoginWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function LoginWindow({ isOpen, onOpenChange }: LoginWindowProps) {
    // State for toggling between login, register and forgot password forms
    // login - 0
    // register - 1
    // forgot password - 2
    const [currentState, setCurrentState] = useState(0);

    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    
    // Валидация никнейма (мин. 4 символа, только латинские буквы и цифры)
    const validateNickname = (value: string): boolean => /^[A-Za-z0-9]{4,}$/.test(value);

    // Валидация email
    const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // Валидация пароля (8-64 символа, латинские буквы и цифры)
    const validatePassword = (value: string): boolean => /^[A-Za-z0-9]{8,64}$/.test(value);

    // Обработчики изменения полей
    interface NicknameChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    const handleNicknameChange = (e: NicknameChangeEvent): void => {
        const value: string = e.target.value;
        setNickname(value);
        setNicknameError(validateNickname(value) ? "" : "Минимум 4 символа, только латинские буквы и цифры.");
    };

    interface EmailChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    const handleEmailChange = (e: EmailChangeEvent): void => {
        const value: string = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value) ? "" : "Некорректный email.");
    };

    interface PasswordChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    const handlePasswordChange = (e: PasswordChangeEvent): void => {
        const value: string = e.target.value;
        setPassword(value);
        setPasswordError(validatePassword(value) ? "" : "Пароль должен содержать 8-64 символов, только латинские буквы и цифры.");

        // Сбрасываем проверку подтверждения пароля, если пароль изменился
        if (confirmPassword) {
            setConfirmPasswordError(value === confirmPassword ? "" : "Пароли не совпадают.");
        }
    };

    interface ConfirmPasswordChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    const handleConfirmPasswordChange = (e: ConfirmPasswordChangeEvent): void => {
        const value: string = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordError(value === password ? "" : "Пароли не совпадают.");
    };

    // Получение цветов иконки
    interface InputProps {
        color: string;
        tooltip: string;
    }

    const getInputProps = (value: string, error: string): InputProps => ({
        color: !value ? "text-default-400" : error ? "text-red-500" : "text-green-400",
        tooltip: !value ? "Введите данные" : error ? error : "Данные корректны"
    });

    // Проверка на активность кнопки
    const isSignUpDisabled =
        currentState === 0 ? !email || !password || !!emailError :
        currentState === 1 ? !nickname || !email || !password || !confirmPassword ||
        !!nicknameError || !!emailError || !!passwordError || !!confirmPasswordError : !email || !!emailError;

    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => setShowPassword(!showPassword);

    useEffect(() => {
        setShowPassword(false);
      }, [currentState]);

    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {currentState === 1 ? "Register" : currentState === 0 ? "Log In" : "Recover password"}
                        </ModalHeader>
                        <ModalBody>
                            {currentState === 1 && (
                                <Input
                                    endContent={
                                        <Tooltip content={getInputProps(nickname, nicknameError).tooltip} placement="top">
                                            <HugeiconsIcon icon={User03Icon} className={`text-2xl cursor-pointer ${getInputProps(nickname, nicknameError).color}`} />
                                        </Tooltip>
                                    }
                                    label="Nickname"
                                    placeholder="Enter your nickname"
                                    value={nickname}
                                    onChange={handleNicknameChange}
                                    variant="bordered"
                                />
                            )}
                            <Input
                                endContent={
                                    <Tooltip content={getInputProps(email, emailError).tooltip} placement="top">
                                        <HugeiconsIcon icon={Mail02Icon} className={`text-2xl cursor-pointer ${getInputProps(email, emailError).color}`} />
                                    </Tooltip>
                                }
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleEmailChange}
                                variant="bordered"
                            />
                            {(currentState !== 2) && (
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
                                            {currentState === 0 ? (
                                                <HugeiconsIcon icon={LockPasswordIcon} className="text-default-400" />
                                            ) : (
                                                <Tooltip content={getInputProps(password, passwordError).tooltip} placement="top">
                                                    <HugeiconsIcon icon={LockPasswordIcon} className={`${getInputProps(password, passwordError).color}`} />
                                                </Tooltip>
                                            )}
                                        </div>
                                    }
                                />
                            )}
                            {currentState === 1 && (
                                    <Input
                                        label="Confirm Password"
                                        placeholder="Confirm your password"
                                        type={showPassword ? "text" : "password"}
                                        variant="bordered"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        endContent={
                                            <Tooltip content={getInputProps(confirmPassword, confirmPasswordError).tooltip} placement="top">
                                                <HugeiconsIcon icon={PasswordValidationIcon} className={`text-2xl cursor-pointer ${getInputProps(confirmPassword, confirmPasswordError).color}`} />
                                            </Tooltip>
                                        }
                                    />
                            )}
                            {(currentState === 0) && (
                                <>
                                    <div className="flex py-2 px-1 justify-between">
                                        <Checkbox classNames={{label: "text-small"}}>
                                            Remember me
                                        </Checkbox>
                                        <Link color="primary" href="#" size="sm" onPress={() => setCurrentState(2)}>
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="flex py-0 px-1 justify-between">
                                        <Link color="primary" href="#" size="sm" onPress={() => setCurrentState(1)}>
                                            Not registered yet?
                                        </Link>
                                    </div>
                                </>
                            )}
                            {(currentState === 1) && (
                                <>
                                    <div className="flex py-2 px-1 justify-between">
                                        <Checkbox classNames={{label: "text-small"}}>
                                            Remember me
                                        </Checkbox>
                                        <Link color="primary" href="#" size="sm" onPress={() => setCurrentState(0)}>
                                            Already have an account?
                                        </Link>
                                    </div>
                                </>
                            )}
                            {(currentState === 2) && (
                                <>
                                <div className="flex py-2 px-1 justify-end">
                                    <Link color="primary" href="#" size="sm" onPress={() => setCurrentState(0)}>
                                        Back to login
                                    </Link>
                                </div>
                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>

                            <Button {...(isSignUpDisabled && { isDisabled: true })} color="primary" onPress={onClose}>
                                {(currentState === 1) ? "Sign up" : currentState === 0 ? "Sign in" : "Recover"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
