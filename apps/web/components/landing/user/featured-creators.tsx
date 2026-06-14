import Image from "next/image";
import Link from "next/link";

const FEATURED_CREATORS = [
  {
    id: "ravi-prakash",
    name: "Ravi Prakash",
    role: "MBA Educator",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sagar-sinha",
    name: "Sagar Sinha",
    role: "Financial Educator",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "subodh-chaturvedi",
    name: "Dr. Subodh Chaturvedi",
    role: "Medical Educator",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ankit-awasthi",
    name: "Ankit Awasthi",
    role: "Finance Educator",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ankur-warikoo",
    name: "Ankur Warikoo",
    role: "Personal & Financial Coach",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "atish-mathur",
    name: "Atish Mathur",
    role: "UPSC Educator",
    image: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "damini-tripathi",
    name: "Damini Tripathi",
    role: "Marketing Strategist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  },
];

export default function FeaturedCreators(): React.ReactElement {
  // Duplicate the list so it can scroll seamlessly
  const marqueeItems = [...FEATURED_CREATORS, ...FEATURED_CREATORS];

  return (
    <section className="relative z-10 w-full overflow-hidden py-12">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Infinite Horizontal Marquee */}
      <div className="flex w-max animate-marquee gap-4 sm:gap-6 px-4">
        {marqueeItems.map((creator, index) => (
          <Link
            key={`${creator.id}-${index}`}
            href={`/${creator.id}`}
            className="group relative flex aspect-[4/5] w-[280px] sm:w-[340px] md:w-[380px] shrink-0 flex-col justify-end overflow-hidden rounded-[24px] bg-muted shadow-lg transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl"
          >
            <Image
              src={creator.image}
              alt={creator.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 380px"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10 p-6 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{creator.name}</h3>
              <p className="mt-1.5 text-sm font-medium text-white/80 sm:text-base">{creator.role}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
