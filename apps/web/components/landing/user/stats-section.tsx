import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faGraduationCap, faUsers, faAward } from "@fortawesome/free-solid-svg-icons";

const stats = [
  {
    icon: faVideo,
    value: "45,000+",
    label: "1:1 Minutes",
    desc: "Personalized mentorship and guidance",
  },
  {
    icon: faGraduationCap,
    value: "180+",
    label: "Live Courses",
    desc: "Hands-on creative and technical skill building",
  },
  {
    icon: faUsers,
    value: "12,000+",
    label: "Active Learners",
    desc: "Upskilling and transitioning roles",
  },
  {
    icon: faAward,
    value: "99.2%",
    label: "Satisfaction Rate",
    desc: "Rated 5 stars by student reviews",
  },
];

export default function StatsSection(): React.ReactElement {

  return (
    <section className="bg-background py-8 border-y border-border/40 relative z-10">
      <div className="page-container">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/20 border border-border/30 hover:border-foreground/20 hover:bg-muted/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                  <FontAwesomeIcon icon={stat.icon} className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-2xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
