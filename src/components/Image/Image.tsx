import classNames from "classnames";

interface Props {
    src: string;
    alt: string;
    className?: string;
}

const Image = ({ src, alt, className }: Props) => {
    return (
        <div className={classNames("image-wrapper", className)}>
            <img src={src} alt={alt} />
        </div>
    );
};

export default Image;
