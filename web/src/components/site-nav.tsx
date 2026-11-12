import { HomeHeader } from "@/components/home-header";
import { OptionWheel } from "@/components/option-wheel";

/** The site header plus the mobile menu, shared by every page. */
export function SiteNav() {
  return (
    <>
      <HomeHeader />
      <OptionWheel />
    </>
  );
}
