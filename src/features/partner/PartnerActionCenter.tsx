import { useAuth } from '@/app/AuthContext'
import { ACTION_ITEMS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeverityPill } from '@/components/shared/StatusBadges'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function PartnerActionCenter() {
  const { partnerName } = useAuth()

  return (
    <div>
      <PageHeader
        title="Partner Action Center"
        description={`Guided remediation for ${partnerName} integration issues`}
      />
      <div className="grid gap-4">
        {ACTION_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">{item.issue}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.api} API · Owner: {item.ownerTeam}
                </p>
              </div>
              <SeverityPill severity={item.severity} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Recommended Fix</p>
                  <p className="mt-1 text-sm">{item.recommendedFix}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Expected Resolution</p>
                  <p className="mt-1 text-sm">{item.expectedResolution}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Support: {item.supportContact}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.message(item.docsLink)}>
                  <ExternalLink className="h-3.5 w-3.5" /> API Documentation
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.message(item.validationGuide)}>
                  Field Validation Guide
                </Button>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Sample Request</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(item.sampleRequest)
                        toast.success('Copied sample request')
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11px]">{item.sampleRequest}</pre>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Sample Response</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(item.sampleResponse)
                        toast.success('Copied sample response')
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11px]">{item.sampleResponse}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
