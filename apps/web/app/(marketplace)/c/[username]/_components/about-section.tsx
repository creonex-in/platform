interface AboutSectionProps {
  bio: string | null
  tags: string[]
}

export function AboutSection({ bio, tags }: AboutSectionProps): React.ReactElement | null {
  if (!bio && tags.length === 0) return null

  return (
    <div className="w-full bg-background py-12 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {bio && (
            <div className="w-full lg:col-span-7">
              <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">About</h2>
              <p className="text-[14px] sm:text-[14.5px] text-muted-foreground leading-relaxed font-medium">
                {bio}
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div className={bio ? 'w-full lg:col-span-5' : 'w-full lg:col-span-12'}>
              <div className="bg-muted/30 border border-border rounded-[18px] p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Core Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-border bg-card text-[12.5px] font-semibold text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
