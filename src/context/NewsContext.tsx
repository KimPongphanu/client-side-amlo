import { createContext, useState, useEffect, type ReactNode } from 'react';

// ==========================================
// 1. กำหนดโครงสร้างข้อมูล (Type)
// ==========================================
export interface NewsItem { // export ออกไปด้วย เผื่อหน้า Detail ต้องใช้
  id: number;
  title: string;
  date: string;
  image_src: string;
  description: string;
  content?: string; // เพิ่ม content เข้ามา เผื่อหน้า Detail อยากอ่านแบบยาวๆ
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

interface NewsContextType {
  newsList: NewsItem[];
  prList: NewsItem[]; // 🌟 เพิ่ม Type สำหรับโฆษณา/ประกาศ (ใช้ Type เดียวกับ News ได้เลย)
  departmentList: DepartmentItem[]; 
  isLoading: boolean;
}

// ==========================================
// 2. ข้อมูลจำลอง (Mock Database)
// ==========================================

// --- ข้อมูลข่าว (News) ---
const MOCK_DB: NewsItem[] = [
  { 
    id: 1, 
    title: "ประกาศเจตนารมณ์ต่อต้านการทุจริต", 
    date: "23 เมษายน 2026", 
    image_src: "/banner.png",
    description: "สำนักงาน ปปง. ประกาศเจตนารมณ์ในการต่อต้านการทุจริตคอร์รัปชัน เพื่อสร้างความโปร่งใสในการปฏิบัติงานของเจ้าหน้าที่รัฐ"
  },
  { 
    id: 2, 
    title: "แถลงผลการดำเนินงานไตรมาสที่ 1 ประจำปี 2569", 
    date: "20 เมษายน 2026", 
    image_src: "/amlo1.jpg",
    description: "สำนักงาน ปปง. ประกาศเจตนารมณ์ในการต่อต้านการทุจริตคอร์รัปชัน เพื่อสร้างความโปร่งใสในการปฏิบัติงานของเจ้าหน้าที่รัฐ"
  },
  { 
    id: 3, 
    title: "สัมมนาให้ความรู้กฎหมายฟอกเงินสำหรับสถาบันการเงิน", 
    date: "15 เมษายน 2026", 
    image_src: "/amlo2.jpg",
    description: "สำนักงาน ปปง. จัดโครงการสัมมนาเชิงปฏิบัติการเพื่อยกระดับความรู้ความเข้าใจเกี่ยวกับการตรวจสอบธุรกรรมทางการเงิน"
  },
  { 
    id: 4, 
    title: "MOU ความร่วมมือด้านการปราบปรามอาชญากรรมทางเทคโนโลยี", 
    date: "10 เมษายน 2026", 
    image_src: "/amlo3.jpg",
    description: "พิธีลงนามบันทึกความเข้าใจ (MOU) ระหว่างสำนักงาน ปปง. กองบัญชาการตำรวจไซเบอร์ และสมาคมธนาคารไทย"
  },
  { 
    id: 5, 
    title: "เปิดตัวระบบเตือนภัยและตรวจสอบบัญชีม้าแบบเรียลไทม์", 
    date: "5 เมษายน 2026", 
    image_src: "/amlo4.jpg",
    description: "เปิดตัวแพลตฟอร์มตรวจสอบบัญชีความเสี่ยงสูง ประชาชนสามารถนำเลขที่บัญชีหรือเบอร์โทรศัพท์มาตรวจสอบในระบบฐานข้อมูลได้ทันที"
  },
  { 
    id: 6, 
    title: "ปปง. ขายทอดตลาดทรัพย์สินที่ตกเป็นของแผ่นดิน ครั้งที่ 3/2569", 
    date: "1 เมษายน 2026", 
    image_src: "/amlo5.jpg",
    description: "คณะกรรมการธุรกรรมมีมติให้จัดงานขายทอดตลาดทรัพย์สินที่ศาลมีคำสั่งให้ตกเป็นของแผ่นดิน รวมกว่า 150 รายการ"
  }
];

// 🌟 --- ข้อมูลประกาศ/โฆษณา (Advertise / PR) ---
const MOCK_PR_DB: NewsItem[] = [
  {
    id: 1,
    title: "ประกาศรับสมัครบุคคลเพื่อเลือกสรรเป็นพนักงานราชการทั่วไป",
    date: "1 พฤษภาคม 2026",
    image_src: "/amlo2.jpg", // ใช้รูปที่มีอยู่แล้วทดสอบไปก่อน
    description: "สำนักงาน ปปง. มีความประสงค์จะรับสมัครบุคคลเพื่อจัดจ้างเป็นพนักงานราชการประเภททั่วไป ในตำแหน่งนักวิเคราะห์นโยบายและแผน",
    content: "รายละเอียดฉบับเต็มของการรับสมัคร... (เนื้อหาจำลองสำหรับหน้า Detail)\nผู้ที่สนใจสามารถยื่นใบสมัครได้ตั้งแต่วันที่ 1-15 พฤษภาคม 2026"
  },
  {
    id: 2,
    title: "ประกาศผลการจัดซื้อจัดจ้าง (ไตรมาสที่ 2)",
    date: "28 เมษายน 2026",
    image_src: "/amlo1.jpg",
    description: "สรุปผลการดำเนินการจัดซื้อจัดจ้างในรอบเดือน เมษายน - มิถุนายน ประจำปีงบประมาณ 2569",
    content: "รายละเอียดโครงการที่ได้รับการอนุมัติ และรายชื่อผู้ชนะการเสนอราคา..."
  },
  {
    id: 3,
    title: "เตือนภัย! ระวังมิจฉาชีพแอบอ้างเป็นเจ้าหน้าที่ ปปง.",
    date: "25 เมษายน 2026",
    image_src: "/banner.png",
    description: "สำนักงาน ปปง. ขอย้ำเตือนประชาชน อย่าหลงเชื่อบุคคลที่แอบอ้างเป็นเจ้าหน้าที่โทรศัพท์ไปข่มขู่หรือหลอกให้โอนเงิน",
    content: "ปปง. ไม่มีนโยบายโทรศัพท์ไปหาประชาชนเพื่อให้อายัดหรือโอนเงินเพื่อตรวจสอบใดๆ ทั้งสิ้น หากพบเห็นพฤติกรรมดังกล่าว โปรดแจ้ง 1710"
  },
  {
    id: 4,
    title: "เชิญชวนร่วมตอบแบบสอบถามความพึงพอใจการให้บริการ",
    date: "20 เมษายน 2026",
    image_src: "/amlo4.jpg",
    description: "ขอเชิญชวนประชาชนและผู้มารับบริการ ร่วมตอบแบบประเมินความพึงพอใจ เพื่อนำข้อมูลไปพัฒนาคุณภาพการให้บริการต่อไป",
    content: "แบบสอบถามนี้ใช้เวลาเพียง 3 นาที ข้อมูลของท่านจะเป็นประโยชน์อย่างยิ่งในการปรับปรุงกระบวนการทำงานของเรา"
  },
  {
    id: 5,
    title: "ปฏิทินการจัดงานขายทอดตลาดทรัพย์สิน ประจำปี 2569",
    date: "15 เมษายน 2026",
    image_src: "/amlo5.jpg",
    description: "อัปเดตกำหนดการและสถานที่จัดงานขายทอดตลาดทรัพย์สินที่ตกเป็นของแผ่นดินตลอดทั้งปี พร้อมเงื่อนไขการเข้าร่วมประมูล",
    content: "ผู้ที่สนใจสามารถตรวจสอบรายการทรัพย์สินล่วงหน้าได้ที่เว็บไซต์ก่อนวันประมูล 1 สัปดาห์..."
  },
  {
    id: 6,
    title: "คู่มือการใช้งานระบบรายงานธุรกรรมทางอิเล็กทรอนิกส์ (ฉบับปรับปรุง)",
    date: "10 เมษายน 2026",
    image_src: "/amlo3.jpg",
    description: "อัปเดตคู่มือการใช้งานระบบสำหรับผู้ประกอบวิชาชีพและสถาบันการเงิน เพื่อให้การรายงานธุรกรรมมีความถูกต้องและรวดเร็วยิ่งขึ้น",
    content: "ดาวน์โหลดคู่มือฉบับเต็มได้ที่ลิงก์ด้านล่าง..."
  }
];

// --- ข้อมูลหน่วยงาน (Departments) ---
const MOCK_DEPARTMENTS_DB: DepartmentItem[] = [
  { 
    id: 1, 
    title: "ส่วนบริหารหน่วยงานข่าวกรองทางการเงิน", 
    cover_image: "/amlo1.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
  { 
    id: 2, 
    title: "ส่วนวิเคราะห์ข่าวกรองทางการเงิน", 
    cover_image: "/amlo3.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/SYHR25vQicU?si=7vlRnIE_vGYRc_3M' }, 
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
  { 
    id: 3, 
    title: "ส่วนวิเคราะห์ธุรกรรมทางการเงิน", 
    cover_image: "/amlo2.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'image', url: '/amlo2.jpg' },
    ] 
  },
  { 
    id: 4, 
    title: "ส่วนสืบสวนทางการเงิน", 
    cover_image: "/amlo4.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
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
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [prList, setPrList] = useState<NewsItem[]>([]); // 🌟 เก็บ State ของประกาศ
  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true); 

  const fetchMockData = () => {
    // จำลองการโหลดข้อมูล 1.5 วินาที
    setTimeout(() => {
      setNewsList(MOCK_DB); 
      setPrList(MOCK_PR_DB); // 🌟 โหลดข้อมูลประกาศ
      setDepartmentList(MOCK_DEPARTMENTS_DB); 
      setIsLoading(false);  
    }, 1500); 
  };

  useEffect(() => {
    fetchMockData();
  }, []);

  return (
    // 🌟 ส่ง prList ออกไปให้ component อื่นๆ ใช้งานได้เลย
    <NewsContext.Provider value={{ newsList, prList, departmentList, isLoading }}>
      {children}
    </NewsContext.Provider>
  );
};