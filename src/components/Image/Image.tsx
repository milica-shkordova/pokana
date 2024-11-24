import classNames from "classnames";

interface ImageProps {
    src: string;
    alt: string;
    className?: string;
}

const Image = ({ src, alt, className }: ImageProps) => {
    return (
        <div className={classNames("image-wrapper", className)}>
            <img src={src} alt={alt} />
        </div>
    );
};

export default Image;
