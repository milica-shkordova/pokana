import classNames from "classnames";
import "./Button.scss";
import { ButtonType } from "@enums/enums";

interface ButtonProps {
    text: string | number;
    variant: ButtonType;
    onClick?: () => void;
    className?: string;
}

const Button = ({ text, variant, className, onClick }: ButtonProps) => {
    return (
        <button className={classNames(variant, className)} onClick={onClick}>
            {text}
        </button>
    );
};

export default Button;
