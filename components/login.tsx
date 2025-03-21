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
import { useState } from "react";

export function BaselinePerson(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
      >
        <path
          fill="currentColor"
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
        ></path>
      </svg>
    )
  }

interface MailIconProps extends React.SVGProps<SVGSVGElement> {}

export const MailIcon = (props: MailIconProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M17 3.5H7C4 3.5 2 5 2 8.5V15.5C2 19 4 20.5 7 20.5H17C20 20.5 22 19 22 15.5V8.5C22 5 20 3.5 17 3.5ZM17.47 9.59L14.34 12.09C13.68 12.62 12.84 12.88 12 12.88C11.16 12.88 10.31 12.62 9.66 12.09L6.53 9.59C6.21 9.33 6.16 8.85 6.41 8.53C6.67 8.21 7.14 8.15 7.46 8.41L10.59 10.91C11.35 11.52 12.64 11.52 13.4 10.91L16.53 8.41C16.85 8.15 17.33 8.2 17.58 8.53C17.84 8.85 17.79 9.33 17.47 9.59Z"
                fill="currentColor"
            />
        </svg>
    );
};


export function LockPasswordBold(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
        >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M5.25 10.055V8a6.75 6.75 0 0 1 13.5 0v2.055c1.115.083 1.84.293 2.371.824C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16s0-4.243.879-5.121c.53-.531 1.256-.741 2.371-.824M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004Q16.676 9.999 16 10H8q-.677-.001-1.25.004zM8 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4 0a1 1 0 1 0 0-2a1 1 0 0 0 0 2m5-1a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
            clipRule="evenodd"
        ></path>
        </svg>
        )
    }

  export function LockPasswordOutline(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
      >
        <path
          fill="currentColor"
          d="M9 16a1 1 0 1 1-2 0a1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
        ></path>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M5.25 8v1.303q-.34.023-.642.064c-.9.12-1.658.38-2.26.981c-.602.602-.86 1.36-.981 2.26c-.117.867-.117 1.97-.117 3.337v.11c0 1.367 0 2.47.117 3.337c.12.9.38 1.658.981 2.26c.602.602 1.36.86 2.26.982c.867.116 1.97.116 3.337.116h8.11c1.367 0 2.47 0 3.337-.116c.9-.122 1.658-.38 2.26-.982s.86-1.36.982-2.26c.116-.867.116-1.97.116-3.337v-.11c0-1.367 0-2.47-.116-3.337c-.122-.9-.38-1.658-.982-2.26s-1.36-.86-2.26-.981a10 10 0 0 0-.642-.064V8a6.75 6.75 0 0 0-13.5 0M12 2.75A5.25 5.25 0 0 0 6.75 8v1.253q.56-.004 1.195-.003h8.11q.635 0 1.195.003V8c0-2.9-2.35-5.25-5.25-5.25m-7.192 8.103c-.734.099-1.122.28-1.399.556c-.277.277-.457.665-.556 1.4c-.101.755-.103 1.756-.103 3.191s.002 2.436.103 3.192c.099.734.28 1.122.556 1.399c.277.277.665.457 1.4.556c.754.101 1.756.103 3.191.103h8c1.435 0 2.436-.002 3.192-.103c.734-.099 1.122-.28 1.399-.556c.277-.277.457-.665.556-1.4c.101-.755.103-1.756.103-3.191s-.002-2.437-.103-3.192c-.099-.734-.28-1.122-.556-1.399c-.277-.277-.665-.457-1.4-.556c-.755-.101-1.756-.103-3.191-.103H8c-1.435 0-2.437.002-3.192.103"
          clipRule="evenodd"
        ></path>
      </svg>
    )
  }
  


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
    const validateNickname = (value) => /^[A-Za-z0-9]{4,}$/.test(value);

    // Валидация email
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // Валидация пароля (8-64 символа, латинские буквы и цифры)
    const validatePassword = (value) => /^[A-Za-z0-9]{8,64}$/.test(value);

    // Обработчики изменения полей
    const handleNicknameChange = (e) => {
        const value = e.target.value;
        setNickname(value);
        setNicknameError(validateNickname(value) ? "" : "Минимум 4 символа, только латинские буквы и цифры.");
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value) ? "" : "Некорректный email.");
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordError(validatePassword(value) ? "" : "Пароль должен содержать 8-64 символов, только латинские буквы и цифры.");

        // Сбрасываем проверку подтверждения пароля, если пароль изменился
        if (confirmPassword) {
            setConfirmPasswordError(value === confirmPassword ? "" : "Пароли не совпадают.");
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordError(value === password ? "" : "Пароли не совпадают.");
    };

    // Получение цветов иконки
    const getInputProps = (value, error) => ({
        color: !value ? "text-default-400" : error ? "text-red-500" : "text-green-400",
        tooltip: !value ? "Введите данные" : error ? error : "Данные корректны"
    });

    // Проверка на активность кнопки
    const isSignUpDisabled =
        !nickname || !email || !password || !confirmPassword ||
        nicknameError || emailError || passwordError || confirmPasswordError;

    
    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {currentState == 1 ? "Register" : currentState == 0 ? "Log In" : "Recover password"}
                        </ModalHeader>
                        <ModalBody>
                            {currentState == 1 && (
                                <Input
                                    endContent={
                                        <Tooltip content={getInputProps(nickname, nicknameError).tooltip} placement="top">
                                            <BaselinePerson className={`text-2xl cursor-pointer ${getInputProps(nickname, nicknameError).color}`} />
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
                                        <MailIcon className={`text-2xl cursor-pointer ${getInputProps(email, emailError).color}`} />
                                    </Tooltip>
                                }
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleEmailChange}
                                variant="bordered"
                            />
                            {(currentState == 0) && (
                                <Input
                                    endContent={<LockPasswordBold className="text-2xl text-default-400 flex-shrink-0" />}
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                    variant="bordered"
                                    onChange={(e) => setPassword(e.target.value)}
                            />
                            )}
                            {currentState == 1 && (
                                <>
                                    <Input
                                        label="Password"
                                        placeholder="Enter your password"
                                        type="password"
                                        variant="bordered"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        errorMessage={!validatePassword(password) && password ? "Invalid password format" : ""}
                                        endContent={
                                            <Tooltip content={getInputProps(password, passwordError).tooltip} placement="top">
                                                <LockPasswordBold className={`text-2xl cursor-pointer ${getInputProps(password, passwordError).color}`} />
                                            </Tooltip>
                                        }
                                    />
                                    <Input
                                        label="Confirm Password"
                                        placeholder="Confirm your password"
                                        type="password"
                                        variant="bordered"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        endContent={
                                            <Tooltip content={getInputProps(confirmPassword, confirmPasswordError).tooltip} placement="top">
                                                <LockPasswordOutline className={`text-2xl cursor-pointer ${getInputProps(confirmPassword, confirmPasswordError).color}`} />
                                            </Tooltip>
                                        }
                                    />
                                </>
                            )}
                            {(currentState == 0) && (
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
                            {(currentState == 1) && (
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
                            {(currentState == 2) && (
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
                            <Button disabled={isSignUpDisabled} color="primary" onPress={onClose}>
                                {(currentState == 1) ? "Sign up" : currentState == 0 ? "Sign in" : "Recover"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
