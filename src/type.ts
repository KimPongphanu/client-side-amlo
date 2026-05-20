export interface NewsItem { 
  id: number;
  title: string;
  date: string;
  image_src: string;
  description: string;
  content?: string; 
  views?: number;    // เพิ่มมารองรับ Dashboard
  isShow?: boolean;  // เพิ่มมารองรับ Dashboard
}

export interface GalleryItem {
  type: 'image' | 'video';
  url: string; 
}

export interface DepartmentItem {
  id: number;
  title: string;
  cover_image: string;
  gallery: GalleryItem[]; 
  content?: string; 
}

export interface NewsContextType {
  newsList: NewsItem[];
  prList: NewsItem[]; 
  departmentList: DepartmentItem[]; 
  isLoading: boolean;
  // 🌟 เพิ่ม 2 บรรทัดนี้
  setPrList: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  setNewsList: React.Dispatch<React.SetStateAction<NewsItem[]>>;
}