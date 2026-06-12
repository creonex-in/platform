"use client";

import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";

export default function WhyLearnersChoose(): React.ReactElement {
  const data = [
    {
      title: "01",
      content: (
        <div key="step-1" className="w-full">
          <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Personalized</span>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Personalized Learning</h4>
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            Connect directly with creators and experts who match your learning goals. Skip the generic video repositories and engage in interactive, outcome-driven learning.
          </p>
          
          {/* 2x2 Standard Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border/20">
               <Image 
                 src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80" 
                 alt="1-on-1 virtual call learning" 
                 fill 
                 className="object-cover hover:scale-105 transition-transform duration-500" 
               />
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border/20">
               <Image 
                 src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" 
                 alt="Mentorship and code review discussion" 
                 fill 
                 className="object-cover hover:scale-105 transition-transform duration-500" 
               />
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border/20">
               <Image 
                 src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80" 
                 alt="Interactive student notebook workspace" 
                 fill 
                 className="object-cover hover:scale-105 transition-transform duration-500" 
               />
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border/20">
               <Image 
                 src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&q=80" 
                 alt="Virtual teacher tutorial board" 
                 fill 
                 className="object-cover hover:scale-105 transition-transform duration-500" 
               />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "02",
      content: (
        <div key="step-2" className="w-full">
          <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Verified</span>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Verified Experts</h4>
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            Every creator goes through a quality review process before joining the platform. Learn only from practitioners actively working in the industry.
          </p>
          
          {/* Top Heavy Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
             <div className="col-span-2 relative aspect-[21/9] rounded-xl overflow-hidden shadow-sm border border-border/20">
                <Image 
                  src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80" 
                  alt="Verified designer prototyping at office" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
             </div>
             <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border/20">
                <Image 
                  src="https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80" 
                  alt="Active programmer writing code" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
             </div>
             <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border/20">
                <Image 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" 
                  alt="Active workplace workstation" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
             </div>
          </div>
        </div>
      ),
    },
    {
      title: "03",
      content: (
        <div key="step-3" className="w-full">
          <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Outcomes</span>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Outcome-Focused Learning</h4>
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            Gain practical skills, career guidance, and actionable insights instead of passive content consumption. Walk away with clear outcomes.
          </p>
          
          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-2 gap-4 w-full h-[400px] md:h-[500px]">
             <div className="row-span-2 relative rounded-xl overflow-hidden shadow-sm border border-border/20">
                <Image 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" 
                  alt="Outcome tracking panel and analytics chart" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
             </div>
             <div className="relative rounded-xl overflow-hidden shadow-sm border border-border/20">
                <Image 
                  src="https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80" 
                  alt="Hands-on designer crafting project layout" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
             </div>
             <div className="relative rounded-xl overflow-hidden shadow-sm border border-border/20">
                <Image 
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" 
                  alt="Finished application code outcomes" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
             </div>
          </div>
        </div>
      ),
    },
  ];

  const header = (
    <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
      <p className="text-label text-primary mb-4">Why Learners Choose Creonex</p>
      <h2 className="text-h1 text-balance text-foreground mb-6 leading-tight">
        Designed to help you<br className="hidden md:block" /> actually grow.
      </h2>
      <p className="text-body mx-auto max-w-2xl leading-relaxed text-muted-foreground">
        Skip the generic video repositories. Creonex connects you directly with top-tier practitioners to gain real-world outcomes.
      </p>
    </div>
  );

  return (
    <section className="bg-background pt-0 pb-24 overflow-hidden relative">
      <Timeline data={data} header={header} />
    </section>
  );
}