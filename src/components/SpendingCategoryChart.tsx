import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryData {
  name: string
  value: number
  color: string
}

interface SpendingCategoryChartProps {
  data: CategoryData[]
}

const SpendingCategoryChart = ({ data }: SpendingCategoryChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Get top 5 categories by value for the legend
  const top5Categories = [...data].sort((a, b) => b.value - a.value).slice(0, 5)

  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(0)
      return (
        <div
          className="p-3 rounded-lg shadow-lg border"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <p className="text-subtitle mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {payload[0].name}
          </p>
          <p className="text-mono-numeric font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ₹{payload[0].value.toLocaleString()}
          </p>
          <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="p-6 rounded-lg h-full outline-none focus:outline-none"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-primary)',
        outline: 'none',
      }}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-h3 mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Spending by Category
        </h2>
        <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
          This month's breakdown
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Donut Chart */}
        <div className="w-full lg:w-1/2 flex justify-center items-center min-h-[280px]">
          <div className="w-full max-w-[280px] aspect-square">
            <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
              <PieChart>
                <Pie
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={data as any}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend - Top 5 Categories */}
        <div className="w-full lg:w-1/2 space-y-3">
          {top5Categories.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(0)
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-body-md font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-mono-numeric font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    ₹{item.value.toLocaleString()}
                  </p>
                  <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                    ({percentage}%)
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SpendingCategoryChart
