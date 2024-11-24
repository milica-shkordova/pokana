import "./LoginPage.scss";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonType, InputType, TextTag } from "@enums/enums";
import Text from "@components/Text/Text";
import { routes } from "@constants/routes.const";
import Image from "@components/Image/Image";
import Logo from "@assets/logo.png";
import LoginImgVertical from "@assets/login-img-vertical.png";
import LoginImgHorizontal from "@assets/login-img-horizontal.png";
import Button from "@components/Button/Button";
import Input from "@components/Input/Input";

const LoginPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        token && navigate(`${routes.ROOT}${routes.HOME}`);
    }, [navigate]);

    const handleLogin = () => {
        localStorage.setItem("token", "1234");
        navigate(`${routes.ROOT}${routes.HOME}`);
    };

    return (
        <div className="login-page">
            <Image
                src={LoginImgHorizontal}
                alt="login-image"
                className="login-image-horizontal"
            />
            <div className="middle-wrapper">
                <div className="login-wrapper">
                    <Image src={Logo} alt="logo" className="logo-image" />
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
                <Image
                    src={LoginImgVertical}
                    alt="login-image"
                    className="login-image-vertical"
                />
            </div>
        </div>
    );
};

export default LoginPage;
