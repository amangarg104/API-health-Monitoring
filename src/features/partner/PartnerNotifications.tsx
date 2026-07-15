import { NOTIFICATIONS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function PartnerNotifications() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="API changes, version updates, maintenance windows, releases, and breaking changes"
      />
      <div className="space-y-3">
        {NOTIFICATIONS.map((n) => (
          <Card key={n.id} className={cn(!n.read && 'border-l-4 border-l-primary')}>
            <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{n.type}</Badge>
                  {!n.read ? <Badge variant="default">New</Badge> : null}
                </div>
                <p className="mt-2 font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
