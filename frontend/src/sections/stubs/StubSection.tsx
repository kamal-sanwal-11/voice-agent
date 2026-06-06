interface Props {
  title: string
  description: string
}

export default function StubSection({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      <span className="mt-4 text-xs font-medium border border-border rounded-full px-3 py-1 text-muted-foreground">
        Out of Phase 1 scope
      </span>
    </div>
  )
}
