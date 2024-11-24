import React from "react";
import { TextTag } from "@enums/enums";

interface TextProps {
    tag: TextTag;
    children: React.ReactNode;
    className?: string;
}

const Text = ({ tag, className, children }: TextProps) => {
    return React.createElement(tag, { className: className }, children);
};

export default Text;
