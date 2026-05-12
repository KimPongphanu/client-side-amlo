import { createContext, useState, useEffect, type ReactNode , useMemo} from 'react';
import type { NewsItem, DepartmentItem, NewsContextType } from '../type';

// ==========================================
// ข้อมูลจำลอง (Mock Database) - อัปเดต HTML ทุกรายการ
// ==========================================

const MOCK_DB: NewsItem[] = [
  { 
    id: 1, 
    title: "ประกาศเจตนารมณ์ต่อต้านการทุจริต", 
    date: "23 เมษายน 2026", 
    image_src: "/banner.png",
    description: "สำนักงาน ปปง. ประกาศเจตนารมณ์ในการต่อต้านการทุจริตคอร์รัปชัน",
    content: "<h2>เจตนารมณ์การป้องกันทุจริต</h2><p>เพื่อสร้างความเชื่อมั่นให้กับประชาชน สำนักงานขอประกาศนโยบาย <strong>No Gift Policy</strong> ดังนี้:</p><ul><li>ไม่รับของขวัญและของกำนัลทุกชนิด</li><li>ปฏิบัติหน้าที่ด้วยความโปร่งใส</li><li>ตรวจสอบได้ทุกขั้นตอน</li></ul>"
  },
  { 
    id: 2, 
    title: "แถลงผลการดำเนินงานไตรมาสที่ 1 ประจำปี 2569", 
    date: "20 เมษายน 2026", 
    image_src: "/amlo1.jpg",
    description: "สำนักงาน ปปง. เผยผลงานการอายัดทรัพย์สินในรอบ 3 เดือนแรก",
    content: "<h3>สรุปภาพรวมไตรมาสที่ 1</h3><p>ในไตรมาสที่ผ่านมา เราได้ดำเนินการอายัดทรัพย์สินรวมมูลค่ากว่า <span style='color: green; font-weight: bold;'>500 ล้านบาท</span></p><table border='1' style='width:100%; border-collapse: collapse;'><tr><th style='padding: 8px; background: #f2f2f2;'>ประเภทคดี</th><th style='padding: 8px; background: #f2f2f2;'>มูลค่า (ล้าน)</th></tr><tr><td style='padding: 8px;'>ยาเสพติด</td><td style='padding: 8px;'>300</td></tr><tr><td style='padding: 8px;'>ฉ้อโกงประชาชน</td><td style='padding: 8px;'>200</td></tr></table>"
  },
  { 
    id: 3, 
    title: "สัมมนาให้ความรู้กฎหมายฟอกเงินสำหรับสถาบันการเงิน", 
    date: "15 เมษายน 2026", 
    image_src: "/amlo2.jpg",
    description: "โครงการยกระดับความรู้ความเข้าใจเกี่ยวกับการตรวจสอบธุรกรรม",
    content: "<h3>หัวข้อการสัมมนา</h3><ol><li>หลักการพื้นฐานกฎหมายฟอกเงิน</li><li>วิธีการสังเกตธุรกรรมต้องสงสัย</li><li>การรายงานผ่านระบบอิเล็กทรอนิกส์</li></ol><p><em>*สงวนสิทธิ์สำหรับเจ้าหน้าที่ธนาคารเท่านั้น</em></p>"
  },
  { 
    id: 4, 
    title: "MOU ความร่วมมือด้านการปราบปรามอาชญากรรมทางเทคโนโลยี", 
    date: "10 เมษายน 2026", 
    image_src: "/amlo3.jpg",
    description: "พิธีลงนามบันทึกความเข้าใจร่วมกับตำรวจไซเบอร์",
    content: "<h3>ความร่วมมือ 3 ฝ่าย</h3><p>การลงนามครั้งนี้ประกอบด้วยหน่วยงานหลัก:</p><ul><li>สำนักงาน ปปง.</li><li>กองบัญชาการตำรวจไซเบอร์</li><li>สมาคมธนาคารไทย</li></ul><p>มุ่งเน้นการตัดวงจรทางการเงินของแก๊งคอลเซ็นเตอร์แบบ<strong>ทันทีทันใด</strong></p>"
  },
  { 
    id: 5, 
    title: "เปิดตัวระบบเตือนภัยและตรวจสอบบัญชีม้าแบบเรียลไทม์", 
    date: "5 เมษายน 2026", 
    image_src: "/amlo4.jpg",
    description: "แพลตฟอร์มตรวจสอบบัญชีความเสี่ยงสูงสำหรับประชาชน",
    content: "<h3>Check ก่อนโอน!</h3><p>ระบบใหม่นี้ช่วยให้ท่านตรวจสอบ:</p><ul><li>รายชื่อบัญชีม้าที่ถูกอายัด</li><li>เบอร์โทรศัพท์เสี่ยงสูง</li></ul><p style='background: #fff3cd; padding: 10px; border-radius: 5px;'>คำเตือน: หากพบเลขบัญชีในระบบ โปรดงดทำธุรกรรมและแจ้งเจ้าหน้าที่ทันที</p>"
  },
  { 
    id: 6, 
    title: "ปปง. ขายทอดตลาดทรัพย์สิน ครั้งที่ 3/2569", 
    date: "1 เมษายน 2026", 
    image_src: "/amlo5.jpg",
    description: "เตรียมพบกับการประมูลทรัพย์สินตกเป็นของแผ่นดินกว่า 150 รายการ",
    content: "<h3>รายการทรัพย์สินเด่น</h3><p>ทรัพย์สินที่จะนำมาประมูลในครั้งนี้ ได้แก่:</p><ul><li>รถยนต์หรู (Porsche, BMW)</li><li>นาฬิกาแบรนด์เนม</li><li>กระเป๋าหรูและอัญมณี</li></ul><p>ลงทะเบียนเข้าร่วมได้ที่ <a href='#'>คลิกลิงก์ลงทะเบียน</a></p>"
  }
];

const MOCK_PR_DB: NewsItem[] = [
  {
    id: 1,
    title: "ประกาศรับสมัครบุคคลเพื่อเลือกสรรเป็นพนักงานราชการทั่วไป",
    date: "1 พฤษภาคม 2026",
    image_src: "/amlo2.jpg", 
    description: "รับสมัครตำแหน่งนักวิเคราะห์นโยบายและแผน",
    content: "<h3>ตำแหน่งที่เปิดรับ</h3><p><strong>นักวิเคราะห์นโยบายและแผน (1 อัตรา)</strong></p><h4>คุณสมบัติ</h4><ul><li>วุฒิปริญญาตรีทุกสาขา</li><li>มีความสามารถด้านการวิเคราะห์ข้อมูล</li></ul><p>สมัครได้ทาง: <span style='text-decoration: underline;'>amlo.go.th/jobs</span></p>"
  },
  {
    id: 2,
    title: "ประกาศผลการจัดซื้อจัดจ้าง (ไตรมาสที่ 2)",
    date: "28 เมษายน 2026",
    image_src: "/amlo1.jpg",
    description: "สรุปผลการดำเนินการจัดซื้อจัดจ้างประจำปีงบประมาณ 2569",
    content: "<h3>รายงานสรุปการจัดซื้อจัดจ้าง</h3><p>รายการที่สำคัญประจำเดือนเมษายน:</p><ol><li>ระบบฐานข้อมูลความเสี่ยง (5 ล้านบาท)</li><li>ครุภัณฑ์สำนักงาน (1.2 ล้านบาท)</li></ol><p>สถานะ: <strong>ดำเนินการเสร็จสิ้น</strong></p>"
  },
  {
    id: 3,
    title: "เตือนภัย! ระวังมิจฉาชีพแอบอ้างเป็นเจ้าหน้าที่ ปปง.",
    date: "25 เมษายน 2026",
    image_src: "/banner.png",
    description: "อย่าหลงเชื่อบุคคลที่แอบอ้างโทรศัพท์ไปข่มขู่หรือหลอกให้โอนเงิน",
    content: "<h2 style='color: red;'>⚠️ โปรดระวัง!</h2><p>ปปง. <strong>ไม่มีนโยบาย</strong> โทรศัพท์ไปหาประชาชนเพื่อ:</p><ul><li>ขอรหัส OTP</li><li>ให้โอนเงินเพื่อตรวจสอบความบริสุทธิ์</li><li>ให้อายัดบัญชีผ่าน Link</li></ul><p>พบเห็นแจ้งสายด่วน <strong>1710</strong></p>"
  },
  {
    id: 4,
    title: "เชิญชวนร่วมตอบแบบสอบถามความพึงพอใจ",
    date: "20 เมษายน 2026",
    image_src: "/amlo4.jpg",
    description: "ร่วมประเมินเพื่อพัฒนาคุณภาพการให้บริการ",
    content: "<h3>ช่วยเราพัฒนา!</h3><p>ความเห็นของท่านมีค่าต่อเราอย่างยิ่ง:</p><p><button style='background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;'>คลิกทำแบบสอบถาม</button></p><p><em>ใช้เวลาเพียง 3 นาทีเท่านั้น</em></p>"
  },
  {
    id: 5,
    title: "ปฏิทินการจัดงานขายทอดตลาดทรัพย์สิน ประจำปี 2569",
    date: "15 เมษายน 2026",
    image_src: "/amlo5.jpg",
    description: "อัปเดตกำหนดการและสถานที่จัดงานตลอดทั้งปี",
    content: "<h3>ตารางประมูลปี 2569</h3><ul><li><strong>ครั้งที่ 1:</strong> มกราคม (สำนักงานใหญ่)</li><li><strong>ครั้งที่ 2:</strong> เมษายน (ออนไลน์)</li><li><strong>ครั้งที่ 3:</strong> สิงหาคม (ต่างจังหวัด)</li></ul>"
  },
  {
    id: 6,
    title: "คู่มือการใช้งานระบบรายงานธุรกรรม (ฉบับปรับปรุง)",
    date: "10 เมษายน 2026",
    image_src: "/amlo3.jpg",
    description: "อัปเดตคู่มือสำหรับผู้ประกอบวิชาชีพและสถาบันการเงิน",
    content: "<h3>ดาวน์โหลดคู่มือ</h3><p>โปรดคลิกดาวน์โหลดตามหัวข้อ:</p><ul><li><a href='#'>คู่มือสำหรับธนาคาร (PDF)</a></li><li><a href='#'>คู่มือสำหรับผู้ค้าอัญมณี (PDF)</a></li><li><a href='#'>คู่มือสำหรับธุรกิจอสังหาฯ (PDF)</a></li></ul>"
  }
];

const MOCK_DEPARTMENTS_DB: DepartmentItem[] = [
  { 
    id: 1, 
    title: "ส่วนบริหารหน่วยงานข่าวกรองทางการเงิน", 
    cover_image: "/amlo1.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: "<h3>หน้าที่และอำนาจ</h3><p>รับผิดชอบงานธุรการและอำนวยความสะดวกให้ฝ่ายวิเคราะห์ข้อมูลข่าวกรอง</p><ul><li>จัดการงบประมาณและพัสดุ</li><li>ประสานงานต่างประเทศ</li></ul>"
  },
  { 
    id: 2, 
    title: "ส่วนวิเคราะห์ข่าวกรองทางการเงิน", 
    cover_image: "/amlo3.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' }, 
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: "<h3>ภารกิจหลัก</h3><p>วิเคราะห์ข้อมูลรายงานธุรกรรมที่ต้องสงสัย (STR) เพื่อหาเบาะแสอาชญากรรม</p><h4>ผลงานเด่น</h4><p>วิเคราะห์เส้นทางการเงินเครือข่ายยาเสพติดมูลค่า 1,000 ล้านบาทในปีที่ผ่านมา</p>"
  },
  { 
    id: 3, 
    title: "ส่วนวิเคราะห์ธุรกรรมทางการเงิน", 
    cover_image: "/amlo2.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: "<h3>ระบบงานวิเคราะห์</h3><p>วิเคราะห์ข้อมูลรายงานเงินสด (CTR) และรายงานธุรกรรมอื่นๆ</p><p><strong>เครื่องมือที่ใช้:</strong> i2 Analyst's Notebook และระบบ AI วิเคราะห์ความเสี่ยง</p>"
  },
  { 
    id: 4, 
    title: "ส่วนสืบสวนทางการเงิน", 
    cover_image: "/amlo4.jpg", 
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: "<h3>งานสืบสวน</h3><p>ลงพื้นที่รวบรวมพยานหลักฐานทางการเงินเพื่อประกอบการทำคดีอายัดทรัพย์สิน</p><p style='color: blue;'>เป้าหมาย: ติดตามทรัพย์สินกลับคืนสู่แผ่นดิน</p>"
  },
];

// ==========================================
// สร้าง Context และ Provider
// ==========================================
// eslint-disable-next-line react-refresh/only-export-components
export const NewsContext = createContext<NewsContextType | null>(null);

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [prList, setPrList] = useState<NewsItem[]>([]); 
  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true); 

  const fetchMockData = () => {
    setTimeout(() => {
      setNewsList(MOCK_DB); 
      setPrList(MOCK_PR_DB); 
      setDepartmentList(MOCK_DEPARTMENTS_DB); 
      setIsLoading(false);  
    }, 1500); 
  };

  useEffect(() => {
      fetchMockData();
  }, []);

  const contextValue = useMemo(() => ({
    newsList, 
    prList, 
    departmentList, 
    isLoading
  }), [newsList, prList, departmentList, isLoading]);
  
  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  );
};