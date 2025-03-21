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
} from "@heroui/react";
import { useState } from "react";

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
    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {currentState == 1 ? "Register" : currentState == 0 ? "Register" : "Recover password"}
                        </ModalHeader>
                        <ModalBody>
                            {currentState == 1 && (
                                <Input
                                    label="Nickname"
                                    placeholder="Enter your nickname"
                                    type="nickname"
                                    variant="bordered"
                                />
                            )}
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                variant="bordered"
                            />
                            {!(currentState == 2) && (
                                <Input
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                    variant="bordered"
                                />
                            )}
                            {currentState == 1 && (
                                <Input
                                    label="Confirm Password"
                                    placeholder="Confirm your password"
                                    type="password"
                                    variant="bordered"
                                />
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
                            <Button color="primary" onPress={onClose}>
                                {(currentState == 1) ? "Sign up" : currentState == 0 ? "Sign in" : "Recover"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
