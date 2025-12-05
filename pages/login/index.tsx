import { useEffect } from "react";
import { useRouter } from "next/router";
import { ButtonType, InputType, TextTag } from "@enums/enums";
import Text from "@components/Text/Text";
import Image from "@components/Image/Image";
import Button from "@components/Button/Button";
import Input from "@components/Input/Input";

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        token && router.push("/home");
    }, [router]);

    const handleLogin = () => {
        localStorage.setItem("token", "1234");
        router.push("/home");
    };

    return (
        <div className="login-page">
            <Image
                src="/login-img-horizontal.png"
                alt="login-image"
                className="login-image-horizontal"
            />
            <div className="middle-wrapper">
                <div className="login-wrapper">
                    <Image src="/logo.png" alt="logo" className="logo-image" />
                    <Text tag={TextTag.P} className="login-label">
                        Login with your e-mail
                    </Text>
                    <Input
                        id="email"
                        type={InputType.EMAIL}
                        placeholder="Enter your e-mail"
                        className="email-input"
                    />
                    <Input
                        id="password"
                        type={InputType.PASSWORD}
                        placeholder="Enter your password"
                        className="password-input"
                    />
                    <Button
                        text={"Log in"}
                        variant={ButtonType.PRIMARY}
                        className="login-button"
                        onClick={handleLogin}
                    />
                </div>
            </div>
        </div>
    );
}
