import Image from "next/image";
import Link from "next/link";

export type CategoryCardData = {
  id: string;
  label: string;
  experts: number;
  courses: number;
  imageSrc: string;
};

interface Props {
  cat: CategoryCardData;
}

export default function CategoryCard({ cat }: Props): React.ReactElement {
  return (
    <Link
      href={`/top-creators/${cat.id}`}
      aria-label={`${cat.label} — ${cat.experts} experts`}
      className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:aspect-[3/4] lg:aspect-[4/5] shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image */}
      <Image
        src={cat.imageSrc}
        alt={cat.label}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Text inside image */}
      <div className="relative z-10 p-5 md:p-6">
        <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">
          {cat.label}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-white/80 md:text-sm">
          {cat.experts} experts · {cat.courses} courses
        </p>
      </div>
    </Link>
  );
}
