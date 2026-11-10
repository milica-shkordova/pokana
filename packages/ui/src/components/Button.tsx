import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../cx";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Square icon-only button (pass an aria-label). */
  icon?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonLinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Button classes for other link components, e.g. <Link className={buttonClassName({ variant: "secondary" })}>. */
export function buttonClassName(
  { variant = "primary", size = "md", block, icon }: Pick<CommonProps, "variant" | "size" | "block" | "icon"> = {},
  extra?: string,
) {
  return cx(
    "ui-button",
    `ui-button--${variant}`,
    size !== "md" && `ui-button--${size}`,
    block && "ui-button--block",
    icon && "ui-button--icon",
    extra,
  );
}

function Content({ loading, iconLeft, iconRight, children }: CommonProps) {
  return (
    <>
      {loading ? <Spinner /> : iconLeft && <span className="ui-button__icon">{iconLeft}</span>}
      {children !== undefined && children !== null && <span>{children}</span>}
      {iconRight && (
        <span className="ui-button__icon ui-button__icon--right" aria-hidden>
          {iconRight}
        </span>
      )}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, icon, loading, iconLeft, iconRight, children, className, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, block, icon }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </button>
  );
});

/** Same look as <Button>, rendered as an <a>. For client-side navigation use Next's <Link className={buttonClassName()}>. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, block, icon, loading, iconLeft, iconRight, children, className, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={buttonClassName({ variant, size, block, icon }, className)} {...rest}>
      <Content loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </a>
  );
});
