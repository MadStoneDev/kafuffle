interface ServerAvatarProps {
  imageSrc?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  innerElement?: React.ReactNode;
}

const ServerAvatar = ({
  imageSrc,
  alt,
  className,
  imageClassName,
  innerElement,
}: ServerAvatarProps) => {
  return (
    <article className={`group relative inline-block ${className}`}>
      <div
        className={`grid place-content-center w-[3.6rem] aspect-square bg-cover bg-center rounded-full ${imageClassName} transition-all duration-300 ease-in-out`}
        style={{
          backgroundImage: `url(${imageSrc})`,
        }}
      >
        {innerElement}
      </div>
    </article>
  );
};

export default ServerAvatar;
