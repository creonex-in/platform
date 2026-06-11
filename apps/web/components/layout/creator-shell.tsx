import CreatorNavbar from "@/components/layout/creator-navbar";
import Footer from "@/components/layout/footer";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CreatorShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="theme-creator">
      <CreatorNavbar />
      <ThemeToggle />
      {children}
      <Footer />
    </div>
  );
}
