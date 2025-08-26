interface UserAvatarProps {
  imageSrc?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}

const UserAvatar = ({
  imageSrc,
  alt,
  className,
  imageClassName,
}: UserAvatarProps) => {
  return (
    <article className={`group relative ${className}`}>
      <div
        className={`relative w-[2.75rem] aspect-square rounded-full bg-cover bg-center ${imageClassName} transition-all duration-300 ease-in-out`}
        style={{
          backgroundImage: `url(${imageSrc})`,
        }}
        role="img"
        aria-label={alt}
      />
    </article>
  );
};

export default UserAvatar;
