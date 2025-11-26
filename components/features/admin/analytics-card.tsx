import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

type AnalyticsCardProps = {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  } | null
  description?: string
}

export function AnalyticsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: AnalyticsCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-[#50C878]/50 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-[#50C878]/10">
          <Icon className="h-4 w-4 text-[#50C878]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-[#50C878]' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last period
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

