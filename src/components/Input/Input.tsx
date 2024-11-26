import { InputType } from "@enums/enums";

interface Props {
    id: string;
    type: InputType;
    placeholder?: string;
    className?: string;
    name?: string;
}

const Input = ({ type, id, placeholder, name, className }: Props) => {
    return (
        <input
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            className={className}
        />
    );
};

export default Input;
