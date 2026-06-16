import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export default function CreatorRoutingBanner(): React.ReactElement {
  return (
    <div className="w-full border-b border-primary/15 bg-primary/5">
      <div className="page-container flex items-center justify-between gap-4 py-2.5">

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/10">
            <FontAwesomeIcon icon={faChalkboardUser} className="size-3.5 text-foreground" />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Want to share your expertise and grow your audience.</span>
          </p>
        </div>

        <Link
          href="/become-a-creator"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background transition-colors duration-200 hover:bg-foreground/75"
        >
          Grow on Creonex
          <FontAwesomeIcon icon={faArrowRight} className="size-3" />
        </Link>

      </div>
    </div>
  );
}
