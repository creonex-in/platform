"use client";

import * as React from "react";
import { useMeasure } from "@uidotdev/usehooks";
import { type VariantProps, cva } from "class-variance-authority";
import {
  type HTMLMotionProps,
  type MotionValue,
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

const processCardVariants = cva(
  "absolute left-0 top-1/2 overflow-hidden rounded-2xl border",
  {
    variants: {
      variant: {
        dark: "border-white/10 bg-[#0c0f18] text-white",
        default: "border-border bg-card text-card-foreground",
      },
    },
    defaultVariants: { variant: "dark" },
  }
);

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
}

interface ProcessCardProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof processCardVariants> {
  itemsLength: number;
  index: number;
}

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined);

function useContainerScrollContext(): ContainerScrollContextValue {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error("useContainerScrollContext must be used within ContainerScroll");
  }
  return context;
}

// Mirrors the page-container Tailwind class: px-4 | sm:px-6 | lg:px-10
// max-w-[1480px] mx-auto
function getContainerLayout(iw: number): { left: number; contentWidth: number } {
  const padding = iw >= 1024 ? 40 : iw >= 640 ? 24 : 16;
  const containerW = Math.min(iw, 1480);
  const left = (iw - containerW) / 2 + padding;
  const contentWidth = containerW - 2 * padding;
  return { left, contentWidth };
}

export function ContainerScroll({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-[120vh]", className)}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
}

export const ContainerSticky = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky left-0 top-0 h-screen w-full overflow-hidden",
      className
    )}
    {...props}
  />
));
ContainerSticky.displayName = "ContainerSticky";

export function ProcessCard({
  className,
  style,
  variant,
  itemsLength,
  index,
  ...props
}: ProcessCardProps): React.ReactElement {
  const { scrollYProgress } = useContainerScrollContext();

  // Card 0 always visible. Cards 1–N fill the full 0→1 range evenly (no dead-zone).
  const transitions = itemsLength - 1;
  const start = index === 0 ? 0 : (index - 1) / transitions;
  const end = index === 0 ? 0 : index / transitions;

  const iw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const [ref, { width }] = useMeasure();

  const { left: containerLeft, contentWidth } = getContainerLayout(iw);
  const cardWidth = width ?? 0;

  // Gap so all cards fill the container width when stacked.
  // stackOffset = (containerContentWidth - cardWidth) / (N - 1)
  const stackOffset = cardWidth > 0 ? (contentWidth - cardWidth) / transitions : 0;
  const finalX = containerLeft + stackOffset * index;

  // Raw useTransform — frame-perfect scroll sync. useSpring creates lag that fights scroll inertia.
  const x = useTransform(scrollYProgress, [start, end], [iw, finalX]);

  return (
    <motion.div
      ref={ref}
      style={{ x: index > 0 ? x : finalX, y: "-50%", ...style }}
      className={cn(processCardVariants({ variant }), className)}
      {...props}
    />
  );
}
ProcessCard.displayName = "ProcessCard";
