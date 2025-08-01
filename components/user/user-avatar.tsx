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
        className={`relative w-[2.75rem] bg-cover bg-center ${imageClassName} transition-all duration-300 ease-in-out`}
        style={{
          clipPath:
            "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          backgroundImage: `url(${imageSrc})`,
          aspectRatio: "1/0.82",
        }}
      />
    </article>
  );
};

export default UserAvatar;
