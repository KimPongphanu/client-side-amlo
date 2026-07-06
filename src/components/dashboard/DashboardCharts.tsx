// src/components/dashboard/DashboardCharts.tsx
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

interface DashboardChartsProps {
  stats: {
    newsCount: number
    prCount: number
    departmentCount: number
    commentCount: number
    contactCount: number
  }
  isLoading?: boolean
}

export default function DashboardCharts({
  stats,
  isLoading = false,
}: DashboardChartsProps) {
  // ─── Bar Chart Option ──────────────────────────────────────────────────────
  // useMemo ป้องกันการ re-calculate ทุกครั้งที่ re-render โดยไม่จำเป็น
  const barOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0]
          return `<b>${p.name}</b><br/>จำนวน: <b>${p.value}</b> รายการ`
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['ข่าว/กิจกรรม', 'ประชาสัมพันธ์', 'หน่วยงาน', 'รีวิว', 'ติดต่อ'],
        axisLabel: { color: '#64748b', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        // ป้องกัน Bug: ถ้าข้อมูลทุกตัวเป็น 0 กราฟจะดูแปลก ใส่ minInterval: 1 ไว้
        minInterval: 1,
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      },
      series: [
        {
          name: 'จำนวน',
          type: 'bar',
          barMaxWidth: 52,
          // ป้องกัน Bug: บังคับ parse เป็น Number เผื่อ API ส่งมาเป็น String
          data: [
            {
              value: Number(stats.newsCount),
              itemStyle: { color: '#3b82f6', borderRadius: [6, 6, 0, 0] },
            },
            {
              value: Number(stats.prCount),
              itemStyle: { color: '#8b5cf6', borderRadius: [6, 6, 0, 0] },
            },
            {
              value: Number(stats.departmentCount),
              itemStyle: { color: '#6366f1', borderRadius: [6, 6, 0, 0] },
            },
            {
              value: Number(stats.commentCount),
              itemStyle: { color: '#f59e0b', borderRadius: [6, 6, 0, 0] },
            },
            {
              value: Number(stats.contactCount),
              itemStyle: { color: '#10b981', borderRadius: [6, 6, 0, 0] },
            },
          ],
          label: {
            show: true,
            position: 'top',
            color: '#475569',
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
      ],
    }),
    [stats],
  )

  // ─── Pie Chart Option ──────────────────────────────────────────────────────
  const pieOption = useMemo(() => {
    const newsVal = Number(stats.newsCount)
    const prVal = Number(stats.prCount)
    const total = newsVal + prVal

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: '{b}: {c} รายการ ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: { color: '#64748b', fontSize: 12 },
      },
      series: [
        {
          name: 'สัดส่วนเนื้อหา',
          type: 'pie',
          // ป้องกัน Bug: ถ้า total = 0 (ยังไม่มีข้อมูล) ให้แสดงสถานะว่างแทน
          ...(total === 0
            ? {
                data: [{ value: 1, name: 'ยังไม่มีข้อมูล', itemStyle: { color: '#e2e8f0' } }],
                label: {
                  show: true,
                  formatter: 'ยังไม่มีข้อมูล',
                  color: '#94a3b8',
                },
              }
            : {
                data: [
                  {
                    value: newsVal,
                    name: 'ข่าว/กิจกรรม',
                    itemStyle: { color: '#3b82f6' },
                  },
                  {
                    value: prVal,
                    name: 'ประชาสัมพันธ์',
                    itemStyle: { color: '#8b5cf6' },
                  },
                ],
                label: {
                  show: true,
                  formatter: '{b}\n{d}%',
                  color: '#475569',
                  fontSize: 12,
                },
              }),
          radius: ['35%', '65%'],
          center: ['50%', '45%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.15)',
            },
          },
        },
      ],
    }
  }, [stats])

  // ─── Loading Guard ─────────────────────────────────────────────────────────
  // ป้องกัน Bug: ไม่ให้ echarts พยายาม render ก่อนข้อมูลพร้อม
  if (isLoading) {
    return (
      <section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {[0, 1].map((i) => (
          <div
            key={i}
            className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-72 animate-pulse flex items-center justify-center'
          >
            <div className='w-8 h-8 rounded-full bg-gray-200' />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* ─── Bar Chart ─── */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='px-5 pt-4 pb-2 border-b border-gray-50'>
          <p className='text-sm font-bold text-gray-800'>จำนวนเนื้อหาในระบบ</p>
          <p className='text-xs text-gray-400 mt-0.5'>ภาพรวมทุกหมวดหมู่</p>
        </div>
        {/* notMerge=true ป้องกัน Bug: option เก่ารวมกับ option ใหม่ */}
        <ReactECharts
          option={barOption}
          style={{ height: 260 }}
          notMerge={true}
          lazyUpdate={true}
          opts={{ renderer: 'svg' }}  // svg renderer เบากว่า canvas สำหรับกราฟแบบนี้
        />
      </div>

      {/* ─── Pie Chart ─── */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='px-5 pt-4 pb-2 border-b border-gray-50'>
          <p className='text-sm font-bold text-gray-800'>สัดส่วน ข่าว vs ประชาสัมพันธ์</p>
          <p className='text-xs text-gray-400 mt-0.5'>เปรียบเทียบสัดส่วนเนื้อหาหลัก</p>
        </div>
        <ReactECharts
          option={pieOption}
          style={{ height: 260 }}
          notMerge={true}
          lazyUpdate={true}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </section>
  )
}
