import { useState, useEffect, type ReactNode, useMemo } from 'react'
import type { NewsItem, DepartmentItem } from '../type'

// แก้ ESLint: react-refresh/only-export-components
// NewsContext ถูกย้ายออกไปที่ newsContextDef.ts แล้ว
// import ต่อจากที่นั่นแทนการ createContext ในไฟล์นี้
import { NewsContext } from './NewsContextDef'

// re-export ให้ไฟล์อื่นที่ import จาก NewsContext.tsx ยังใช้งานได้เหมือนเดิม
export { NewsContext }

// ==========================================
// Mock Database - กิจกรรม (prList)
// ==========================================
const MOCK_DB: NewsItem[] = [
  { id: 1, title: 'ประกาศเจตนารมณ์ต่อต้านการทุจริต', date: '23 เมษายน 2026', image_src: '/banner.png', description: 'สำนักงาน ปปง. ประกาศเจตนารมณ์ในการต่อต้านการทุจริตคอร์รัปชัน', content: '<h2>เจตนารมณ์การป้องกันทุจริต</h2><p>เพื่อสร้างความเชื่อมั่นให้กับประชาชน สำนักงานขอประกาศนโยบาย <strong>No Gift Policy</strong></p>' },
  { id: 2, title: 'แถลงผลการดำเนินงานไตรมาสที่ 1 ประจำปี 2569', date: '20 มีนาคม 2026', image_src: '/amlo1.jpg', description: 'สำนักงาน ปปง. เผยผลงานการอายัดทรัพย์สินในรอบ 3 เดือนแรก', content: '<h3>สรุปภาพรวมไตรมาสที่ 1</h3><p>ดำเนินการอายัดทรัพย์สินรวมมูลค่ากว่า 500 ล้านบาท</p>' },
  { id: 3, title: 'สัมมนาให้ความรู้กฎหมายฟอกเงินสำหรับสถาบันการเงิน', date: '15 กุมภาพันธ์ 2026', image_src: '/amlo2.jpg', description: 'โครงการยกระดับความรู้ความเข้าใจเกี่ยวกับการตรวจสอบธุรกรรม', content: '<h3>หัวข้อการสัมมนา</h3><ol><li>หลักการพื้นฐานกฎหมายฟอกเงิน</li></ol>' },
  { id: 4, title: 'MOU ความร่วมมือด้านการปราบปรามอาชญากรรมทางเทคโนโลยี', date: '10 มกราคม 2026', image_src: '/amlo3.jpg', description: 'พิธีลงนามบันทึกความเข้าใจร่วมกับตำรวจไซเบอร์', content: '<h3>ความร่วมมือ 3 ฝ่าย</h3><p>การลงนามครั้งนี้ประกอบด้วยหน่วยงานหลัก...</p>' },
  { id: 5, title: 'เปิดตัวระบบเตือนภัยและตรวจสอบบัญชีม้าแบบเรียลไทม์', date: '5 สิงหาคม 2026', image_src: '/amlo4.jpg', description: 'แพลตฟอร์มตรวจสอบบัญชีความเสี่ยงสูงสำหรับประชาชน', content: '<h3>Check ก่อนโอน!</h3><p>ระบบใหม่นี้ช่วยให้ท่านตรวจสอบรายชื่อบัญชีม้าได้ทันที</p>' },
  { id: 6, title: 'กิจกรรมจิตอาสาบริจาคโลหิตเนื่องในวันสถาปนา', date: '19 พฤศจิกายน 2026', image_src: '/amlo5.jpg', description: 'เชิญชวนเจ้าหน้าที่และประชาชนร่วมบริจาคโลหิต', content: '<h3>รายละเอียดกิจกรรม</h3><p>ร่วมทำความดีบริจาคโลหิต ณ สภากาชาดไทย...</p>' },
  { id: 7, title: 'โครงการปลูกป่าเฉลิมพระเกียรติ', date: '12 สิงหาคม 2026', image_src: '/banner.png', description: 'กิจกรรมปลูกต้นไม้เพื่อเพิ่มพื้นที่สีเขียว', content: '<p>ร่วมกันปลูกป่าชายเลน จำนวน 2,000 ต้น</p>' },
  { id: 8, title: 'กีฬาสีสัมพันธ์ภายในสำนักงานประจำปี 2569', date: '25 ธันวาคม 2026', image_src: '/amlo1.jpg', description: 'เสริมสร้างความสามัคคีและสุขภาพที่ดีของบุคลากร', content: '<p>การแข่งขันฟุตบอล วอลเลย์บอล และกีฬาฮาเฮ</p>' },
  { id: 9, title: 'อบรมการปฐมพยาบาลเบื้องต้นและ CPR', date: '14 กรกฎาคม 2026', image_src: '/amlo2.jpg', description: 'เตรียมความพร้อมรับมือเหตุฉุกเฉินในสถานที่ทำงาน', content: '<p>อบรมโดยวิทยากรจากสภากาชาดไทย</p>' },
  { id: 10, title: 'กิจกรรม 5ส ทำความสะอาดสำนักงาน', date: '5 พฤษภาคม 2026', image_src: '/amlo3.jpg', description: 'Big Cleaning Day ประจำปี', content: '<p>สะสาง สะดวก สะอาด สุขลักษณะ สร้างนิสัย</p>' },
  { id: 11, title: 'งานเลี้ยงปีใหม่ 2569', date: '8 มกราคม 2026', image_src: '/amlo4.jpg', description: 'งานเลี้ยงสังสรรค์และจับฉลากของขวัญ', content: '<p>ธีมงาน: อาชีพในฝัน</p>' },
  { id: 12, title: 'พิธีมอบรางวัลข้าราชการดีเด่น', date: '2 เมษายน 2026', image_src: '/amlo5.jpg', description: 'เชิดชูเกียรติบุคลากรผู้ปฏิบัติงานด้วยความเสียสละ', content: '<p>รางวัลข้าราชการพลเรือนดีเด่นประจำปี</p>' },
  { id: 13, title: 'อบรมเทคนิคการนำเสนออย่างมืออาชีพ', date: '22 มิถุนายน 2026', image_src: '/banner.png', description: 'พัฒนาทักษะการสื่อสารสำหรับผู้บริหารระดับกลาง', content: '<p>Presentation Skills Workshop</p>' },
  { id: 14, title: 'ศึกษาดูงาน ปปง. ประเทศเกาหลีใต้', date: '15 กันยายน 2026', image_src: '/amlo1.jpg', description: 'แลกเปลี่ยนเรียนรู้เทคโนโลยีการติดตามทรัพย์สิน', content: '<p>การประชุมทวิภาคีร่วมกับ KoFIU</p>' },
  { id: 15, title: 'การฝึกซ้อมอพยพหนีไฟประจำปี', date: '10 ตุลาคม 2026', image_src: '/amlo2.jpg', description: 'ซ้อมแผนเผชิญเหตุอัคคีภัย', content: '<p>จำลองสถานการณ์เพลิงไหม้บริเวณชั้น 3</p>' },
  { id: 16, title: 'โครงการรณรงค์ลดการใช้พลาสติก (Zero Waste)', date: '5 มิถุนายน 2026', image_src: '/amlo3.jpg', description: 'แจกแก้วน้ำและถุงผ้าให้พนักงานทุกคน', content: '<p>งดใช้ถุงพลาสติกในโรงอาหารสำนักงาน</p>' },
  { id: 17, title: 'การแข่งขัน E-Sports ภายในสำนักงาน', date: '18 ตุลาคม 2026', image_src: '/amlo4.jpg', description: 'เชื่อมความสัมพันธ์ระหว่างวัยด้วยเกม ROV', content: '<p>ชิงเงินรางวัลรวมกว่า 10,000 บาท</p>' },
  { id: 18, title: 'กิจกรรมบริจาคสิ่งของให้เด็กกำพร้า', date: '14 กุมภาพันธ์ 2026', image_src: '/amlo5.jpg', description: 'ส่งมอบความรักในวันวาเลนไทน์', content: '<p>มอบอุปกรณ์การเรียนและเครื่องนุ่งห่ม</p>' },
  { id: 19, title: 'สัมมนาวิชาการ: อนาคตสกุลเงินดิจิทัล', date: '20 พฤศจิกายน 2026', image_src: '/banner.png', description: 'การรับมือกับอาชญากรรมในโลกคริปโต', content: '<p>วิทยากรพิเศษจากธนาคารแห่งประเทศไทย</p>' },
  { id: 20, title: 'งานทำบุญตักบาตรครบรอบสถาปนาองค์กร', date: '19 สิงหาคม 2026', image_src: '/amlo1.jpg', description: 'นิมนต์พระสงฆ์ 9 รูป เจริญพระพุทธมนต์', content: '<p>เพื่อความเป็นสิริมงคลแก่เจ้าหน้าที่ทุกคน</p>' },
]

// ==========================================
// Mock Database - ข่าวประชาสัมพันธ์ (newsList)
// ==========================================
const MOCK_PR_DB: NewsItem[] = [
  { id: 1, title: 'ประกาศรับสมัครบุคคลเพื่อเลือกสรรเป็นพนักงานราชการ', date: '1 พฤษภาคม 2026', image_src: '/amlo2.jpg', description: 'รับสมัครตำแหน่งนักวิเคราะห์นโยบายและแผน', content: '<h3>ตำแหน่งที่เปิดรับ</h3><p><strong>นักวิเคราะห์นโยบายและแผน (1 อัตรา)</strong></p>' },
  { id: 2, title: 'ประกาศผลการจัดซื้อจัดจ้าง (ไตรมาสที่ 2)', date: '28 เมษายน 2026', image_src: '/amlo1.jpg', description: 'สรุปผลการดำเนินการจัดซื้อจัดจ้างประจำปีงบประมาณ 2569', content: '<h3>รายงานสรุปการจัดซื้อจัดจ้าง</h3>' },
  { id: 3, title: 'เตือนภัย! ระวังมิจฉาชีพแอบอ้างเป็นเจ้าหน้าที่', date: '25 กรกฎาคม 2026', image_src: '/banner.png', description: 'อย่าหลงเชื่อบุคคลที่แอบอ้างโทรศัพท์ไปข่มขู่หรือหลอกให้โอนเงิน', content: '<h2 style="color:red">⚠️ โปรดระวัง!</h2><p>ไม่มีนโยบายโทรศัพท์ไปหาประชาชนเพื่อขอรหัส OTP</p>' },
  { id: 4, title: 'เชิญชวนร่วมตอบแบบสอบถามความพึงพอใจประจำปี', date: '20 ตุลาคม 2026', image_src: '/amlo4.jpg', description: 'ร่วมประเมินเพื่อพัฒนาคุณภาพการให้บริการ', content: '<h3>ช่วยเราพัฒนา!</h3>' },
  { id: 5, title: 'ปฏิทินการจัดงานขายทอดตลาดทรัพย์สิน ประจำปี 2569', date: '15 ธันวาคม 2026', image_src: '/amlo5.jpg', description: 'อัปเดตกำหนดการและสถานที่จัดงานตลอดทั้งปี', content: '<h3>ตารางประมูลปี 2569</h3>' },
  { id: 6, title: 'คู่มือการใช้งานระบบรายงานธุรกรรม (ฉบับปรับปรุง)', date: '10 มีนาคม 2026', image_src: '/amlo3.jpg', description: 'อัปเดตคู่มือสำหรับผู้ประกอบวิชาชีพและสถาบันการเงิน', content: '<h3>ดาวน์โหลดคู่มือ</h3>' },
  { id: 7, title: 'รายงานประจำปี (Annual Report) 2568', date: '5 กุมภาพันธ์ 2026', image_src: '/amlo1.jpg', description: 'เผยแพร่ผลการดำเนินงานและสถิติการยึดอายัดทรัพย์สิน', content: '<h3>รายงานประจำปี</h3>' },
  { id: 8, title: 'ประกาศรายชื่อผู้มีสิทธิสอบสัมภาษณ์', date: '12 พฤษภาคม 2026', image_src: '/amlo2.jpg', description: 'ตรวจสอบรายชื่อและสถานที่สอบสัมภาษณ์', content: '<p>โปรดนำบัตรประชาชนตัวจริงมาแสดงในวันสอบ</p>' },
  { id: 9, title: 'แจ้งเปลี่ยนหมายเลข Call Center ใหม่', date: '1 สิงหาคม 2026', image_src: '/banner.png', description: 'เพื่อการให้บริการที่รวดเร็วยิ่งขึ้น ติดต่อ 1710', content: '<p>เปิดให้บริการทุกวันจันทร์ - ศุกร์ เวลา 08.30 - 16.30 น.</p>' },
  { id: 10, title: 'ประกาศรับฟังความคิดเห็นร่างกฎกระทรวง', date: '20 กันยายน 2026', image_src: '/amlo4.jpg', description: 'ขอเชิญประชาชนร่วมแสดงความคิดเห็นผ่านระบบกลาง', content: '<p>ตั้งแต่วันนี้ ถึง 15 ตุลาคม 2569</p>' },
  { id: 11, title: 'ขยายเวลาการยื่นแบบรายงานธุรกรรม', date: '28 กุมภาพันธ์ 2026', image_src: '/amlo5.jpg', description: 'เนื่องจากระบบอิเล็กทรอนิกส์ขัดข้องชั่วคราว', content: '<p>ขยายเวลาให้ถึงวันที่ 5 มีนาคม 2569</p>' },
  { id: 12, title: 'ประกาศผู้ชนะการเสนอราคาเช่ารถยนต์ส่วนกลาง', date: '10 พฤศจิกายน 2026', image_src: '/amlo3.jpg', description: 'วิธีประกวดราคาอิเล็กทรอนิกส์ (e-bidding)', content: '<p>บริษัทที่ชนะการเสนอราคาคือ...</p>' },
  { id: 13, title: 'แนวทางการปฏิบัติงาน Work From Home', date: '15 มกราคม 2026', image_src: '/amlo1.jpg', description: 'มาตรการป้องกันและควบคุมโรคติดต่อ', content: '<p>กำหนดให้สลับวันมาปฏิบัติงาน 50:50</p>' },
  { id: 14, title: 'ประกาศวันหยุดทำการช่วงเทศกาลสงกรานต์', date: '5 เมษายน 2026', image_src: '/amlo2.jpg', description: 'สำนักงานจะปิดทำการระหว่างวันที่ 13-16 เมษายน', content: '<p>งดให้บริการรับส่งเอกสารทุกประเภท</p>' },
  { id: 15, title: 'แจ้งปิดปรับปรุงระบบเครือข่ายชั่วคราว', date: '18 มิถุนายน 2026', image_src: '/banner.png', description: 'ส่งผลให้เว็บไซต์ไม่สามารถใช้งานได้ในวันอาทิตย์นี้', content: '<p>เวลา 01.00 - 05.00 น.</p>' },
  { id: 16, title: 'ประกาศนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)', date: '1 กรกฎาคม 2026', image_src: '/amlo4.jpg', description: 'ฉบับปรับปรุงใหม่ พ.ศ. 2569', content: '<p>เพิ่มมาตรการการรักษาความปลอดภัยขั้นสูงสุด</p>' },
  { id: 17, title: 'สรุปผลการขายทอดตลาดทรัพย์สิน ครั้งที่ 2/2569', date: '10 สิงหาคม 2026', image_src: '/amlo5.jpg', description: 'นำเงินส่งคลังเป็นรายได้แผ่นดินกว่า 50 ล้านบาท', content: '<p>ทรัพย์สินที่ประมูลออกมากที่สุดคือ ทองรูปพรรณ</p>' },
  { id: 18, title: 'คู่มือการติดต่อราชการผ่านช่องทาง e-Service', date: '5 ตุลาคม 2026', image_src: '/amlo3.jpg', description: 'สะดวกรวดเร็ว ลดการเดินทาง ลดการใช้กระดาษ', content: '<p>สามารถยื่นคำร้องผ่านระบบออนไลน์ได้ 24 ชั่วโมง</p>' },
  { id: 19, title: 'แจ้งเตือนการแอบอ้างสร้าง Line Official ปลอม', date: '12 ธันวาคม 2026', image_src: '/amlo1.jpg', description: 'ย้ำ! บัญชีทางการต้องมีโล่สีเขียวเท่านั้น', content: '<p>ห้ามกดลิงก์แอดไลน์จาก SMS เด็ดขาด</p>' },
  { id: 20, title: 'ประกาศเจตจำนงการบริหารงานด้วยความสุจริต', date: '4 มกราคม 2026', image_src: '/amlo2.jpg', description: 'คำประกาศจากเลขาธิการประจำปี 2569', content: '<p>มุ่งมั่นยกระดับคะแนน ITA ของหน่วยงาน</p>' },
]

const MOCK_DEPARTMENTS_DB: DepartmentItem[] = [
  {
    id: 1,
    title: 'ส่วนบริหารหน่วยงานข่าวกรองทางการเงิน',
    cover_image: '/amlo1.jpg',
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: '<h3>หน้าที่และอำนาจ</h3><p>รับผิดชอบงานธุรการและอำนวยความสะดวกให้ฝ่ายวิเคราะห์ข้อมูลข่าวกรอง</p>',
  },
  {
    id: 2,
    title: 'ส่วนวิเคราะห์ข่าวกรองทางการเงิน',
    cover_image: '/amlo3.jpg',
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: '<h3>ภารกิจหลัก</h3><p>วิเคราะห์ข้อมูลรายงานธุรกรรมที่ต้องสงสัย (STR)</p>',
  },
  {
    id: 3,
    title: 'ส่วนวิเคราะห์ธุรกรรมทางการเงิน',
    cover_image: '/amlo2.jpg',
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: '<h3>ระบบงานวิเคราะห์</h3><p>วิเคราะห์ข้อมูลรายงานเงินสด (CTR)</p>',
  },
  {
    id: 4,
    title: 'ส่วนสืบสวนทางการเงิน',
    cover_image: '/amlo4.jpg',
    gallery: [
      { type: 'image', url: '/amlo1.jpg' },
      { type: 'video', url: 'https://youtu.be/-Wrv-l3bk8A?si=DyX5oG_E3m0c9oRt' },
      { type: 'image', url: '/amlo2.jpg' },
    ],
    content: '<h3>งานสืบสวน</h3><p>ลงพื้นที่รวบรวมพยานหลักฐานทางการเงิน</p>',
  },
]

// ==========================================
// NewsProvider
// ==========================================
export const NewsProvider = ({ children }: { children: ReactNode }) => {

  // prList (ข่าวประชาสัมพันธ์) — sync กับ localStorage
  // Dashboard toggle isShow → บันทึกลง localStorage → หน้าเว็บอ่านจากที่นี่
  const [prList, setPrList] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('amlo_prList')
      if (saved) return JSON.parse(saved)
    } catch {
      // localStorage อาจถูก block (Private mode บางเบราว์เซอร์)
    }
    return MOCK_PR_DB.map((item) => ({
      ...item,
      views: Math.floor(Math.random() * 500),
      isShow: true,
    }))
  })

  // newsList (กิจกรรม) — sync กับ localStorage เช่นกัน
  const [newsList, setNewsList] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('amlo_newsList')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return MOCK_DB.map((item) => ({
      ...item,
      views: Math.floor(Math.random() * 500),
      isShow: true,
    }))
  })

  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ทุกครั้งที่ prList เปลี่ยน → บันทึกลง localStorage อัตโนมัติ
  useEffect(() => {
    try {
      localStorage.setItem('amlo_prList', JSON.stringify(prList))
    } catch {
      // ignore
    }
  }, [prList])

  // ทุกครั้งที่ newsList เปลี่ยน → บันทึกลง localStorage อัตโนมัติ
  useEffect(() => {
    try {
      localStorage.setItem('amlo_newsList', JSON.stringify(newsList))
    } catch {
      // ignore
    }
  }, [newsList])

  // โหลด departmentList ครั้งแรก (ยังไม่มี toggle isShow สำหรับ department)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDepartmentList(MOCK_DEPARTMENTS_DB)
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const contextValue = useMemo(
    () => ({
      newsList,
      prList,
      departmentList,
      isLoading,
      setPrList,
      setNewsList,
    }),
    [newsList, prList, departmentList, isLoading],
  )

  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  )
}