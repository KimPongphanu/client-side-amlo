import { createContext, useState, useEffect, type ReactNode } from 'react';

// ==========================================
// 1. กำหนดโครงสร้างข้อมูล (Type)
// ==========================================
interface NewsItem {
  id: number;
  title: string;
  date: string;
  image_src: string;
  description: string;
}

interface GalleryItem {
  type: 'image' | 'video';
  url: string; // ถ้าเป็นวิดีโอ ให้ใส่ลิงก์ YouTube (แบบ embed)
}

interface DepartmentItem {
  id: number;
  title: string;
  cover_image: string;
  gallery: GalleryItem[]; // 🌟 เปลี่ยนเป็น Array ของ Object
}

// 🌟 เพิ่มใหม่: อัปเดต Context ให้รองรับทั้งข่าวและหน่วยงาน
interface NewsContextType {
  newsList: NewsItem[];
  departmentList: DepartmentItem[]; // เพิ่มบรรทัดนี้
  isLoading: boolean;
}

// ==========================================
// 2. ข้อมูลจำลอง (Mock Database)
// ==========================================
const MOCK_DB: NewsItem[] = [
  // ... (ข้อมูลข่าวของคุณเหมือนเดิมเป๊ะ ขอละไว้เพื่อให้โค้ดสั้นลงนะครับ) ...
  { 
    id: 1, 
    title: "ประกาศเจตนารมณ์ต่อต้านการทุจริต", 
    date: "23 เมษายน 2026", 
    image_src: "/banner.png",
    description: "สำนักงาน ปปง. ประกาศเจตนารมณ์ในการต่อต้านการทุจริตคอร์รัปชัน เพื่อสร้างความโปร่งใสในการปฏิบัติงานของเจ้าหน้าที่รัฐ\n\nพร้อมยกระดับมาตรฐานจริยธรรมในการให้บริการประชาชน และสร้างความเชื่อมั่นให้กับระบบการเงินของประเทศอย่างยั่งยืน"
  },
  { 
    id: 2, 
    title: "แถลงผลการดำเนินงานไตรมาสที่ 1 ประจำปี 2569", 
    date: "20 เมษายน 2026", 
    image_src: "/amlo1.jpg",
    description: `
      \nสำนักงาน ปปง. ประกาศเจตนารมณ์ในการต่อต้านการทุจริตคอร์รัปชัน เพื่อสร้างความโปร่งใสในการปฏิบัติงานของเจ้าหน้าที่รัฐ
      \nพร้อมยกระดับมาตรฐานจริยธรรมในการให้บริการประชาชน และสร้างความเชื่อมั่นให้กับระบบการเงินของประเทศอย่างยั่งยืน
    `
  },
  { 
    id: 3, 
    title: "สัมมนาให้ความรู้กฎหมายฟอกเงินสำหรับสถาบันการเงิน", 
    date: "15 เมษายน 2026", 
    image_src: "/amlo2.jpg",
    description: "สำนักงาน ปปง. จัดโครงการสัมมนาเชิงปฏิบัติการเพื่อยกระดับความรู้ความเข้าใจเกี่ยวกับการตรวจสอบธุรกรรมทางการเงิน (Transaction Monitoring) ให้กับกลุ่มผู้ประกอบวิชาชีพและสถาบันการเงิน เพื่อให้สามารถประเมินความเสี่ยงและรายงานธุรกรรมที่มีเหตุอันควรสงสัยได้อย่างมีประสิทธิภาพและถูกต้องตามมาตรฐานสากล"
  },
  { 
    id: 4, 
    title: "MOU ความร่วมมือด้านการปราบปรามอาชญากรรมทางเทคโนโลยี", 
    date: "10 เมษายน 2026", 
    image_src: "/amlo3.jpg",
    description: "พิธีลงนามบันทึกความเข้าใจ (MOU) ระหว่างสำนักงาน ปปง. กองบัญชาการตำรวจไซเบอร์ และสมาคมธนาคารไทย เพื่อยกระดับมาตรการป้องกันและปราบปรามการหลอกลวงผ่านระบบออนไลน์ ซึ่งจะช่วยให้การอายัดเส้นทางการเงินเป็นไปอย่างรวดเร็วระดับนาที เพื่อลดความสูญเสียของประชาชนให้ได้มากที่สุด"
  },
  { 
    id: 5, 
    title: "เปิดตัวระบบเตือนภัยและตรวจสอบบัญชีม้าแบบเรียลไทม์", 
    date: "5 เมษายน 2026", 
    image_src: "/amlo4.jpg",
    description: "เปิดตัวแพลตฟอร์มตรวจสอบบัญชีความเสี่ยงสูง ประชาชนสามารถนำเลขที่บัญชีหรือเบอร์โทรศัพท์มาตรวจสอบในระบบฐานข้อมูลของ ปปง. ก่อนทำการโอนเงินได้ทันที เพื่อป้องกันการตกเป็นเหยื่อของมิจฉาชีพ พร้อมเปิดช่องทางด่วนสายด่วน 1710 สำหรับแจ้งเบาะแสการกระทำความผิดตลอด 24 ชั่วโมง"
  },
  { 
    id: 6, 
    title: "ปปง. ขายทอดตลาดทรัพย์สินที่ตกเป็นของแผ่นดิน ครั้งที่ 3/2569", 
    date: "1 เมษายน 2026", 
    image_src: "/amlo5.jpg",
    description: "คณะกรรมการธุรกรรมมีมติให้จัดงานขายทอดตลาดทรัพย์สินที่ศาลมีคำสั่งให้ตกเป็นของแผ่นดิน ประกอบด้วย ยานพาหนะหรู อัญมณี นาฬิกาแบรนด์เนม และอสังหาริมทรัพย์ รวมกว่า 150 รายการ มูลค่าเริ่มต้นประมูลรวมกว่า 200 ล้านบาท โดยรายได้ทั้งหมดจะนำส่งเข้ากระทรวงการคลังเพื่อนำไปพัฒนาประเทศต่อไป"
  }
];

const MOCK_DEPARTMENTS_DB: DepartmentItem[] = [
  { 
    id: 1, 
    title: "ส่วนบริหารหน่วยงานข่าวกรองทางการเงิน", 
    cover_image: "/amlo1.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, // ตัวอย่าง YouTube
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
  { 
    id: 2, 
    title: "ส่วนวิเคราะห์ข่าวกรองทางการเงิน", 
    cover_image: "/amlo3.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/SYHR25vQicU?si=7vlRnIE_vGYRc_3M' }, // ตัวอย่าง YouTube
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
  { 
    id: 3, 
    title: "ส่วนวิเคราะห์ธุรกรรมทางการเงิน", 
    cover_image: "/amlo2.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, // ตัวอย่าง YouTube
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
  { 
    id: 4, 
    title: "ส่วนสืบสวนทางการเงิน", 
    cover_image: "/amlo4.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, // ตัวอย่าง YouTube
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
];

// ==========================================
// 3. สร้าง Context และ Provider
// ==========================================
// eslint-disable-next-line react-refresh/only-export-components
export const NewsContext = createContext<NewsContextType | null>(null);

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  // State สำหรับเก็บข่าว
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  
  // 🌟 เพิ่มใหม่: State สำหรับเก็บหน่วยงาน
  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true); 

  const fetchMockData = () => {
    // จำลองการโหลดข้อมูล 1.5 วินาที
    setTimeout(() => {
      setNewsList(MOCK_DB); 
      setDepartmentList(MOCK_DEPARTMENTS_DB); // 🌟 เพิ่มใหม่: ยัดข้อมูลหน่วยงานใส่ State
      setIsLoading(false);  
    }, 1500); 
  };

  useEffect(() => {
    fetchMockData();
  }, []);

  return (
    // 🌟 เพิ่มใหม่: ส่ง departmentList ออกไปให้หน้าอื่นใช้ด้วย
    <NewsContext.Provider value={{ newsList, departmentList, isLoading }}>
      {children}
    </NewsContext.Provider>
  );
};
