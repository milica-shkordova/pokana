import React from "react";
import { TextTag } from "@enums/enums";

interface Props {
    tag: TextTag;
    children: React.ReactNode;
    className?: string;
}

const Text = ({ tag, className, children }: Props) => {
    return React.createElement(tag, { className: className }, children);
};

export default Text;
