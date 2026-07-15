import { Button } from '@/components/ui/button'
import { exportCsv, exportExcelStub, exportPdfStub } from '@/lib/utils'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function ExportButtons({
  filename,
  rows,
  title,
}: {
  filename: string
  rows: Record<string, unknown>[]
  title: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportCsv(`${filename}.csv`, rows)
          toast.success('CSV downloaded')
        }}
      >
        <Download className="h-3.5 w-3.5" /> CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportExcelStub(`${filename}.xlsx`, rows)
          toast.success('Excel-compatible CSV downloaded')
        }}
      >
        <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportPdfStub(title, rows)
          toast.message('Print dialog opened — Save as PDF')
        }}
      >
        <FileText className="h-3.5 w-3.5" /> PDF
      </Button>
    </div>
  )
}
