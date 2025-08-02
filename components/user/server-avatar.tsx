interface ServerAvatarProps {
  imageSrc?: string;
  alt: string;
  active: boolean;
  className?: string;
  imageClassName?: string;
  innerElement?: React.ReactNode;
}

const ServerAvatar = ({
  imageSrc,
  alt,
  active,
  className,
  imageClassName,
  innerElement,
}: ServerAvatarProps) => {
  return (
    <article className={`group relative inline-block ${className}`}>
      {/* Outer hexagon */}
      <div
        className={` 
          relative w-[3.5rem] transition-all duration-300 ease-in-out
        `}
        style={{
          clipPath:
            "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          aspectRatio: "1/0.82",
        }}
      >
        {/* Inner hexagon with avatar */}
        <div
          className={`absolute inset-1 grid place-content-center bg-cover bg-center ${
            active ? "bg-kafuffle" : "bg-foreground/50"
          } ${imageClassName} transition-all duration-300 ease-in-out`}
          style={{
            clipPath:
              "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            backgroundImage: `url(${imageSrc})`,
          }}
        >
          {innerElement}
        </div>

        {/* Active indicator */}

        <div className={`absolute -left-2 top-1/2 transform -translate-y-1/2`}>
          <div
            className={`${
              active ? "w-[1.4rem] group-hover:w-[1.5rem]" : "w-0"
            } aspect-square bg-foreground rounded-full border-[3.5px] border-background shadow-sm transition-all duration-300 ease-in-out`}
          />
        </div>
      </div>
    </article>
  );
};

export default ServerAvatar;
