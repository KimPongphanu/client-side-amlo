import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../type';

interface RecommendedSidebarProps {
  currentId: number;
  items: NewsItem[];
  basePath: string;
  title: string;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const parseThaiDateToTimestamp = (dateStr: string) => {
  if (!dateStr) return 0;
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = THAI_MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month, day).getTime();
  }
  return new Date(dateStr).getTime();
};

export default function RecommendedSidebar({ currentId, items, basePath, title }: RecommendedSidebarProps) {
  const recommendedItems = useMemo(() => {
    if (!items) return [];
    return [...items]
      .filter(item => item.id !== currentId)
      .sort((a, b) => parseThaiDateToTimestamp(b.date) - parseThaiDateToTimestamp(a.date))
      .slice(0, 5);
  }, [items, currentId]);

  if (recommendedItems.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
      <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-600 pl-3 mb-6">
        {title}
      </h3>
      <div className="flex flex-col gap-5">
        {recommendedItems.map((item) => (
          <Link to={`/${basePath}/${item.id}`} key={item.id} className="group border-b border-slate-100 pb-4 last:border-0 last:pb-0 block">
            <h4 className="text-sm md:text-base font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
              {item.title}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {item.date}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link to={`/${basePath}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center w-full transition-colors">
          ดูทั้งหมด ➔
        </Link>
      </div>
    </div>
  );
}