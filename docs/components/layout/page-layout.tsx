import { cn } from "@/lib/utils";

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
};
export const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <div className={cn("mx-auto max-w-4xl px-4 py-8 md:px-8", className)}>
      {children}
    </div>
  );
};

type PageTitleProps = {
  children: React.ReactNode;
  className?: string;
};
export const PageTitle = ({ children, className }: PageTitleProps) => {
  return <h1 className={cn("text-xl font-medium", className)}>{children}</h1>;
};

type PageSectionProps = {
  children: React.ReactNode;
  className?: string;
};
export const PageSection = ({ children, className }: PageSectionProps) => {
  return (
    <section className={cn("mt-8 space-y-3", className)}>{children}</section>
  );
};

type PageHeadingProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
};
export const PageHeading = ({ children, className, as }: PageHeadingProps) => {
  const Tag = as || "h2";
  return (
    <Tag className={cn("text-lg font-medium mt-4 mb-0", className)}>
      {children}
    </Tag>
  );
};

export const PageText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <p className={cn("text-muted-foreground", className)}>{children}</p>;
};
