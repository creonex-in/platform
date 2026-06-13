"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen, faUsers, faVideo, faDownload, faMobileScreen, faCreditCard,
  faBullhorn, faShieldHalved, faGlobe, faRobot, faBrain, faComment,
} from "@fortawesome/free-solid-svg-icons";

export default function CreatorNavbar() {
  return (
    <div className="fixed left-1/2 top-6 z-50 w-full max-w-[700px] -translate-x-1/2 px-4">
      <nav className="mx-auto flex h-14 items-center justify-between rounded-[2rem] border border-border/50 bg-background/60 px-5 shadow-sm backdrop-blur-xl">
        
        {/* Left: Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={24}
            height={24}
            className="size-6 object-contain dark:invert"
            priority
          />
          <span className="text-base font-bold tracking-tight text-foreground">
            Creonex
          </span>
        </Link>

        {/* Middle: Links */}
        <div className="hidden items-center text-sm font-medium md:flex">
          <NavigationMenu align="center">
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent font-medium text-muted-foreground hover:text-foreground hover:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent">Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 p-6 lg:p-8 w-[calc(100vw-2rem)] md:w-[700px] lg:w-[900px]">
                    
                    {/* Column 1: Products */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">Products You Can Sell</h4>
                      
                      <Link href="#courses" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faBookOpen} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Courses</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Create and sell live or recorded courses.</p>
                        </div>
                      </Link>
                      
                      <Link href="#communities" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faUsers} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Communities</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Create and manage your free and paid communities.</p>
                        </div>
                      </Link>

                      <Link href="#webinars" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faVideo} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Webinars</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Launch and host free or paid webinars.</p>
                        </div>
                      </Link>

                      <Link href="#digital-products" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faDownload} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Digital Products</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Host and sell documents, links, text, images, and more.</p>
                        </div>
                      </Link>
                    </div>

                    {/* Column 2: Features */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">Feature Highlights</h4>
                      
                      <Link href="#app" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faMobileScreen} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Branded Mobile App</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Your own fully branded iOS & Android apps.</p>
                        </div>
                      </Link>

                      <Link href="#payments" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faCreditCard} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Integrated Payments</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Accept local and global payments with country specific pricing.</p>
                        </div>
                      </Link>

                      <Link href="#marketing" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faBullhorn} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">Marketing Tools</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Conversion-optimized pages, funnels, campaigns and more.</p>
                        </div>
                      </Link>

                      <Link href="#security" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faShieldHalved} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base text-foreground">DRM Security</h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">DRM-protected content with enterprise-grade security.</p>
                        </div>
                      </Link>
                    </div>

                    {/* Column 3: AI & New */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">AI Features</h4>
                      
                      <Link href="#ai-website" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faGlobe} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base flex items-center gap-3 text-foreground">
                            AI Website Builder
                            <span className="text-[10px] font-bold bg-[#cdff4b] text-[#2e4000] px-2 py-0.5 rounded-sm leading-none">NEW</span>
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Build a high-converting website using AI.</p>
                        </div>
                      </Link>

                      <Link href="#ai-agents" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faRobot} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base flex items-center gap-3 text-foreground">
                            AI Agents
                            <span className="text-[10px] font-bold bg-[#cdff4b] text-[#2e4000] px-2 py-0.5 rounded-sm leading-none">NEW</span>
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Automate sales, support, and marketing.</p>
                        </div>
                      </Link>
                      
                      <Link href="#ai-brain" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faBrain} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base flex items-center gap-3 text-foreground">
                            AI Brain
                            <span className="text-[10px] font-bold bg-[#cdff4b] text-[#2e4000] px-2 py-0.5 rounded-sm leading-none">NEW</span>
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Train your AI brain to power all AI features.</p>
                        </div>
                      </Link>
                      
                      <Link href="#coaching" className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted/60 transition-colors">
                        <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors"><FontAwesomeIcon icon={faComment} className="size-6" /></div>
                        <div>
                          <h5 className="font-semibold text-base flex items-center gap-3 text-foreground">
                            Coaching
                            <span className="text-[10px] font-bold bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-sm leading-none">COMING SOON</span>
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Offer 1:1 or group coaching.</p>
                        </div>
                      </Link>
                    </div>

                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="#pricing" />} className="bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="#resources" />} className="bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden h-4 w-px bg-border md:block"></div>
          <Link href="/login" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block">
            Login
          </Link>
          <Button nativeButton={false} render={<Link href="/signup" />} className="h-9 rounded-full bg-foreground px-5 text-xs font-bold text-background transition-colors duration-300 hover:bg-primary hover:text-white">
            Get Started <span className="ml-1">→</span>
          </Button>
        </div>

      </nav>
    </div>
  );
}
