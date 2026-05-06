export interface NewsItem { 
  id: number;
  title: string;
  date: string;
  image_src: string;
  description: string;
  content?: string; 
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
}

// export ตัวนี้ด้วย เพราะ Context ต้องใช้
export interface NewsContextType {
  newsList: NewsItem[];
  prList: NewsItem[]; 
  departmentList: DepartmentItem[]; 
  isLoading: boolean;
}