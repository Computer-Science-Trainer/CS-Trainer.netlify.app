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
  import { HugeiconsIcon } from "@hugeicons/react";
  import {
    User03Icon,
    Mail02Icon,
    LockPasswordIcon,
    PasswordValidationIcon,
    ViewIcon,
    ViewOffSlashIcon,
    SquareArrowReload02Icon,
  } from "@hugeicons/core-free-icons";
  
  // API URL for backend requests
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Enum representing the different authentication states: Login, Register, Verify (for registration),
  // Recover (initial recover stage), RecoverVerify (code verification for recovery) and ChangePassword (password change form).
  enum AuthState {
    Login,
    Register,
    Verify, // State for email verification code input during registration
    Recover, // Initial recover stage: user sees email and can request a code
    RecoverVerify, // Stage for entering the 6-digit code to recover the account
    ChangePassword, // Password change form after successful code verification
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
    // Here we store the code as a string of up to 6 characters.
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationCodeError, setVerificationCodeError] = useState("");
  
    // New states for ChangePassword stage (for account recovery)
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  
    // Error messages for form field validation
    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
    // Validation functions for input fields
    // Validates that nickname has at least 4 characters and contains only Latin letters and digits.
    const validateNickname = (value: string): boolean => /^[A-Za-z0-9]{4,}$/.test(value);
    // Validates correct email format.
    const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    // Validates that password is 8-64 characters long and contains only Latin letters and digits.
    const validatePassword = (value: string): boolean => /^[A-Za-z0-9]{8,64}$/.test(value);
  
    // Interface for input properties used to style icons and provide tooltips.
    interface InputProps {
      color: string;
      tooltip: string;
    }
    // Returns properties (color and tooltip message) for the input icon based on the value and error state.
    const getInputProps = (value: string, error: string): InputProps => ({
      color: !value ? "text-default-400" : error ? "text-red-500" : "text-green-400",
      tooltip: !value ? "Enter data" : error ? error : "Data is valid",
    });
  
    // Handler for changes in the Nickname input field.
    // Updates the nickname state and sets an error message if validation fails.
    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setNickname(value);
      setNicknameError(validateNickname(value) ? "" : "Minimum 4 characters, only Latin letters and digits.");
    };
  
    // Handler for changes in the Email input field.
    // Updates the email state and sets an error message if the email is invalid.
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setEmail(value);
      setEmailError(validateEmail(value) ? "" : "Invalid email.");
    };
  
    // Handler for changes in the Password input field.
    // Updates the password state, validates it, and checks confirm password if provided.
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setPassword(value);
      setPasswordError(validatePassword(value) ? "" : "Password must be 8-64 characters, only Latin letters and digits.");
      if (confirmPassword) {
        setConfirmPasswordError(value === confirmPassword ? "" : "Passwords do not match.");
      }
    };
  
    // Handler for changes in the Confirm Password input field.
    // Updates the confirmPassword state and sets an error if it doesn't match the password.
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setConfirmPassword(value);
      setConfirmPasswordError(value === password ? "" : "Passwords do not match.");
    };
  
    // Handler for changes in the New Password input field (ChangePassword stage).
    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setNewPassword(value);
      setNewPasswordError(validatePassword(value) ? "" : "Password must be 8-64 characters, only Latin letters and digits.");
      if (confirmNewPassword) {
        setConfirmNewPasswordError(value === confirmNewPassword ? "" : "Passwords do not match.");
      }
    };
  
    // Handler for changes in the Confirm New Password input field (ChangePassword stage).
    const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setConfirmNewPassword(value);
      setConfirmNewPasswordError(value === newPassword ? "" : "Passwords do not match.");
    };
  
    // State to determine if the password should be visible.
    const [showPassword, setShowPassword] = useState(false);
    // Toggles the password visibility.
    // Remembers the cursor position when displaying and returns the cursor back after toggling.
    const toggleShowPassword = () => {
        const input = document.getElementById("password-input") as HTMLInputElement;
        if (!input) return;
      
        const cursorPosition = input.selectionStart;
        const isFocused = document.activeElement === input;
      
        setShowPassword((prev) => !prev);
      
        setTimeout(() => {
          if (isFocused) {
            input.focus();
            input.setSelectionRange(cursorPosition, cursorPosition);
          }
        }, 0);
      };
    // When the auth state changes, reset the password visibility.
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
              className={`text-2xl cursor-pointer select-none ${getInputProps(nickname, nicknameError).color}`}
            />
          </Tooltip>
        }
      />
    );
  
    // Renders the Email input field for states: Login, Register, Recover and ChangePassword.
    // The field is read-only on Verify, RecoverVerify, and ChangePassword stages.
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
                <Button
                  size="sm"
                  isIconOnly
                  onPress={() => {
                    // Backend request to resend the verification code
                    fetch("/api/send-verification-code", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        console.log("Resent verification code:", data);
                        addToast({ title: "Success", description: "Verification code resent.", color: "success" });
                      })
                      .catch((err) => console.error(err));
                  }}
                  variant="ghost"
                  className="opacity-70"
                >
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
                  className={`text-2xl cursor-pointer select-none ${getInputProps(email, emailError).color}`}
                />
              </Tooltip>
            )}
          </div>
        }
      />
    );
  
    // Renders the Password input field for Login and Register states.
    // Includes a button to toggle password visibility and shows an appropriate icon tooltip.
    const renderPasswordInput = () => (
      <Input
        id="password-input"
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
              {showPassword ? (
                <HugeiconsIcon
                  icon={ViewOffSlashIcon}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                />
              ) : (
                <HugeiconsIcon
                  icon={ViewIcon}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                />
              )}
            </Button>
            {authState === AuthState.Login ? (
              <HugeiconsIcon
                icon={LockPasswordIcon}
                onMouseDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                className="text-default-400 select-none"
              />
            ) : (
              <Tooltip content={getInputProps(password, passwordError).tooltip} placement="top">
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                  className={`select-none ${getInputProps(password, passwordError).color}`}
                />
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
              onMouseDown={(e) => e.preventDefault()}
              style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
              className={`text-2xl cursor-pointer select-none ${getInputProps(confirmPassword, confirmPasswordError).color}`}
            />
          </Tooltip>
        }
      />
    );
  
    /**
     * Renders the Verify Email stage for registration.
     * Displays:
     * - 6 individual input cells for a single-digit code.
     * - A "Back to Registration" link (or "Back to Login" for recovery verification).
     */
    const renderVerificationCodeInput = () => {
      // Handler for changing the value in a specific cell.
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
            className="w-10 h-10 border-2 border-default-300 text-center mx-1 rounded-xl select-none"
          />
        );
      }
      return (
        <div className="flex flex-col items-center">
          {/* Input cells for the verification code */}
          <div className="flex justify-center">{inputs}</div>
          {/* "Back" link: conditionally display depending on state */}
          <div className="flex gap-4 mt-4">
            {authState === AuthState.Verify ? (
              <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Register)}>
                Back to Registration
              </Link>
            ) : authState === AuthState.RecoverVerify ? (
              <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Recover)}>
                Back to Recover
              </Link>
            ) : null}
          </div>
        </div>
      );
    };
  
    // Renders the Change Password stage for recovery.
    // Displays two input fields: New Password and Confirm New Password.
    // Contains a button to toggle password visibility and validation indicators.
    const renderChangePasswordInputs = () => (
      <div className="flex flex-col gap-4">
        <Input
          label="New Password"
          placeholder="Enter new password"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          onChange={handleNewPasswordChange}
          variant="bordered"
          errorMessage={newPasswordError}
          endContent={
            <div className="flex items-center gap-1">
              <Button size="sm" isIconOnly onPress={toggleShowPassword} variant="ghost" className="opacity-70">
                {showPassword ? (
                  <HugeiconsIcon
                    icon={ViewOffSlashIcon}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={ViewIcon}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                  />
                )}
              </Button>
              <Tooltip content={getInputProps(newPassword, newPasswordError).tooltip} placement="top">
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                  className={`select-none ${getInputProps(newPassword, newPasswordError).color}`}
                />
              </Tooltip>
            </div>
          }
        />
        <Input
          label="Confirm New Password"
          placeholder="Confirm new password"
          type={showPassword ? "text" : "password"}
          value={confirmNewPassword}
          onChange={handleConfirmNewPasswordChange}
          variant="bordered"
          errorMessage={confirmNewPasswordError}
          endContent={
            <Tooltip content={getInputProps(confirmNewPassword, confirmNewPasswordError).tooltip} placement="top">
              <HugeiconsIcon
                icon={PasswordValidationIcon}
                onMouseDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties & { WebkitUserDrag: string }}
                className={`text-2xl cursor-pointer select-none ${getInputProps(confirmNewPassword, confirmNewPasswordError).color}`}
              />
            </Tooltip>
          }
        />
      </div>
    );
  
    // Determines whether the primary action button should be disabled based on the current state and validation errors.
    const isActionDisabled =
      authState === AuthState.Login
        ? !email || !password || !!emailError
        : authState === AuthState.Register
        ? !nickname || !email || !password || !confirmPassword ||
          !!nicknameError || !!emailError || !!passwordError || !!confirmPasswordError
        : authState === AuthState.Verify
        ? !verificationCode || !!verificationCodeError
        : authState === AuthState.Recover
        ? !email || !!emailError
        : authState === AuthState.RecoverVerify
        ? !verificationCode || !!verificationCodeError
        : authState === AuthState.ChangePassword
        ? !newPassword || !confirmNewPassword || !!newPasswordError || !!confirmNewPasswordError
        : false;
  
    // Returns the header text based on the current authentication state.
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
  
    // Returns the primary action button text based on the current authentication state.
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
     * - For Login: shows "Remember me", "Forgot password?" and "Not registered yet?" links.
     * - For Register: shows "Remember me" and "Already have an account?" links.
     * - For Recover: shows "Back to login".
     * - For Verify: links are rendered within the verification component.
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
          <div className="flex py-2 px-1 justify-between">
            <Checkbox classNames={{ label: "text-small" }}>Remember me</Checkbox>
            <Link color="primary" href="#" size="sm" onPress={() => setAuthState(AuthState.Login)}>
              Back to login
            </Link>
          </div>
        );
      }
    };
  
    // Primary action button handler.
    // Handles actions based on the current auth state:
    // - For Login: sends login request.
    // - For Register: sends registration request (which triggers sending a verification code).
    // - For Verify: verifies the registration code.
    // - For Recover: sends recovery code.
    // - For RecoverVerify: verifies the recovery code.
    // - For ChangePassword: updates the password.
    const handleAction = async () => {
      try {
        if (authState === AuthState.Login) {
          // Login: send login request.
          const res = await fetch(`${apiUrl}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Logged in successfully.", data);
            addToast({ title: "Success", description: "Logged in successfully.", color: "success" });
            onOpenChange(false);
          } else {
            console.error("Login failed:", data);
            addToast({ title: "Error", description: data.message || "Login failed." });
          }
        } else if (authState === AuthState.Register) {
          // Registration: send registration request.
          const res = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, email, password }),
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Registration initiated. Verification code sent.", data);
            addToast({ title: "Success", description: "Verification code sent.", color: "success" });
            setAuthState(AuthState.Verify);
          } else {
            console.error("Registration failed:", data);
            addToast({ title: "Error", description: data.message || "Registration failed." });
          }
        } else if (authState === AuthState.Verify) {
          // Verify registration code.
          const res = await fetch(`${apiUrl}/api/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: verificationCode }),
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Verification successful. Registration completed.", data);
            addToast({ title: "Success", description: "Registration completed successfully.", color: "success" });
            onOpenChange(false);
          } else {
            console.error("Verification failed:", data);
            addToast({ title: "Error", description: data.message || "Invalid verification code." });
          }
        } else if (authState === AuthState.Recover) {
          // Recover: send recovery code.
          const res = await fetch(`${apiUrl}/api/recover`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Recovery code sent.", data);
            addToast({ title: "Success", description: "Recovery code sent.", color: "success" });
            setAuthState(AuthState.RecoverVerify);
          } else {
            console.error("Recovery failed:", data);
            addToast({ title: "Error", description: data.message || "Recovery failed." });
          }
        } else if (authState === AuthState.RecoverVerify) {
          // Verify recovery code.
          const res = await fetch(`${apiUrl}/api/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: verificationCode }),
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Recovery code verified.", data);
            setAuthState(AuthState.ChangePassword);
          } else {
            console.error("Recovery verification failed:", data);
            addToast({ title: "Error", description: data.message || "Invalid recovery code." });
          }
        } else if (authState === AuthState.ChangePassword) {
          // Change password.
          if (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword || !validatePassword(newPassword)) {
            if (!validatePassword(newPassword))
              setNewPasswordError("Password must be 8-64 characters, only Latin letters and digits.");
            if (newPassword !== confirmNewPassword)
              setConfirmNewPasswordError("Passwords do not match.");
          } else {
            const res = await fetch(`${apiUrl}/api/change-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
              console.log("Password changed successfully.", data);
              addToast({ title: "Success", description: "Password changed successfully. Logged in.", color: "success" });
              onOpenChange(false);
            } else {
              console.error("Password change failed:", data);
              addToast({ title: "Error", description: data.message || "Password change failed." });
            }
          }
        }
      } catch (error) {
        console.error("Error in auth flow:", error);
        addToast({ title: "Error", description: "An unexpected error occurred." });
      }
    };
  
    return (
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{getHeaderText()}</ModalHeader>
              <ModalBody>
                {authState === AuthState.Register && renderNicknameInput()}
                {renderEmailInput()}
                {authState === AuthState.Login && renderPasswordInput()}
                {authState === AuthState.Register && renderPasswordInput()}
                {authState === AuthState.Register && renderConfirmPasswordInput()}
                {authState === AuthState.Verify && renderVerificationCodeInput()}
                {authState === AuthState.RecoverVerify && renderVerificationCodeInput()}
                {authState === AuthState.ChangePassword && renderChangePasswordInputs()}
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
