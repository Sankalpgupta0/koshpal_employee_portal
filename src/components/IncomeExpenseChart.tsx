import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface ChartDataPoint {
  month: string
  income: number
  expenses: number
}

interface IncomeExpenseChartProps {
  data: ChartDataPoint[]
}

const IncomeExpenseChart = ({ data }: IncomeExpenseChartProps) => {
  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg shadow-lg border"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <p className="text-label mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {payload[0].payload.month}
          </p>
          <div className="space-y-1">
            <p className="text-body-sm flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#80b597' }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>Income:</span>
              <span className="text-mono-numeric font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                ₹{payload[0].value.toLocaleString()}
              </span>
            </p>
            <p className="text-body-sm flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#f5a038' }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>Expenses:</span>
              <span className="text-mono-numeric font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                ₹{payload[1].value.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="p-6 rounded-lg outline-none focus:outline-none"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-primary)',
        outline: 'none',
      }}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-h3 mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Income vs Expenses
        </h2>
        <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
          Last 6 months overview
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: '#80b597' }}
          />
          <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Income
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: '#f5a038' }}
          />
          <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Expenses
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350} className="border-none outline-none focus:outline-none">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#80b597" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#80b597" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f5a038" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f5a038" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-primary)"
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
            axisLine={{ stroke: 'var(--color-border-primary)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
            axisLine={{ stroke: 'var(--color-border-primary)' }}
            tickLine={false}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border-primary)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#80b597"
            strokeWidth={3}
            fill="url(#colorIncome)"
            activeDot={{ r: 6, fill: '#80b597', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#f5a038"
            strokeWidth={3}
            fill="url(#colorExpenses)"
            activeDot={{ r: 6, fill: '#f5a038', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default IncomeExpenseChart
