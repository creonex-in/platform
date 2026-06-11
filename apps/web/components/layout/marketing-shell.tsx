import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
