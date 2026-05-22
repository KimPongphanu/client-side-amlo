import { useState, useEffect, type ReactNode, useMemo } from 'react'
import type { NewsItem, DepartmentItem, CommentItem } from '../type'

// แยก NewsContext Object ออกไปที่ newsContextDef.ts เพื่อแก้ ESLint Fast Refresh
import { NewsContext } from './NewsContextDef'

// re-export เพื่อให้ Component อื่นๆ ที่เรียกจาก Path นี้ยังคงทำงานได้ตามปกติ
export { NewsContext }

// ==========================================
// 1. Mock Database - กิจกรรม (newsList)
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
// 2. Mock Database - ข่าวประชาสัมพันธ์ (prList)
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

// ==========================================
// 3. Mock Database - โครงสร้างหน่วยงาน (departmentList)
// ==========================================
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
// 4. Mock Database - ความคิดเห็น (commentList)
// ==========================================
const MOCK_COMMENTS: CommentItem[] = [
  {
    id: 'CMT-1020',
    msg: 'ระบบใช้งานง่ายและรวดเร็วมากครับ ลดขั้นตอนการทำงานไปได้เยอะเลย ชอบ UI ที่ดูสะอาดตา',
    star: 5,
    createdAt: new Date().toISOString(), // วันนี้
    isShow: true,
  },
  {
    id: 'CMT-1019',
    msg: 'ฟังก์ชันการค้นหาทำงานได้ดีเยี่ยม หาข้อมูลที่ต้องการเจอในเวลาไม่กี่วินาที',
    star: 5,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // วันนี้ (1 ชม. ที่แล้ว)
    isShow: true,
  },
  {
    id: 'CMT-1018',
    msg: 'ยังมีบางจุดที่โหลดช้าเมื่อดึงข้อมูลเยอะๆ อยากให้ปรับปรุงส่วนนี้ครับ',
    star: 3,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // วันนี้ (2 ชม. ที่แล้ว)
    isShow: false,
  },
  {
    id: 'CMT-1017',
    msg: 'ยอดเยี่ยมมากครับ เป็นกำลังใจให้ทีมพัฒนาสร้างสรรค์ผลงานดีๆ ต่อไป',
    star: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // เมื่อวาน
    isShow: true,
  },
  {
    id: 'CMT-1016',
    msg: 'การแสดงผลบนมือถือยังดูเบียดๆ กันอยู่บ้างในบางหน้าจอครับ',
    star: 3,
    createdAt: new Date(Date.now() - 90000000).toISOString(), // เมื่อวาน
    isShow: false,
  },
  {
    id: 'CMT-1015',
    msg: 'คู่มือการใช้งานละเอียดดีมาก ช่วยให้เข้าใจระบบได้ไวขึ้นเยอะเลย',
    star: 4,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1014',
    msg: 'อยากให้เพิ่มช่องทางการติดต่อรับเรื่องที่สะดวกและครอบคลุมมากกว่านี้ครับ',
    star: 4,
    createdAt: new Date(Date.now() - 180000000).toISOString(), // 2 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1013',
    msg: 'เข้าสู่ระบบยากมากครับ บางครั้งรหัส OTP ส่งมาช้าเกินไป',
    star: 2,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 วันที่แล้ว
    isShow: false,
  },
  {
    id: 'CMT-1012',
    msg: 'ชอบระบบ Dashboard มากครับ สรุปข้อมูลให้เห็นภาพรวมได้ชัดเจนดี',
    star: 5,
    createdAt: new Date(Date.now() - 265000000).toISOString(), // 3 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1011',
    msg: 'สีของปุ่มบางจุดยังกลืนกับพื้นหลังไปหน่อย คนสายตาไม่ดีอาจจะมองยากครับ',
    star: 3,
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 วันที่แล้ว
    isShow: false,
  },
  {
    id: 'CMT-1010',
    msg: 'เสถียรขึ้นกว่าเวอร์ชันก่อนหน้าเยอะมาก ไม่มีอาการค้างหลุดเวลาทำงานแล้ว',
    star: 5,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1009',
    msg: 'อยากให้ระบบสามารถ Export ข้อมูลออกมาเป็นไฟล์ PDF ได้ด้วยครับ',
    star: 4,
    createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1008',
    msg: 'การตอบกลับของเจ้าหน้าที่ผ่านระบบข้อความไวมาก ประทับใจในการบริการครับ',
    star: 5,
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1007',
    msg: 'ระบบอัปโหลดเอกสารยังมีบั๊กอยู่บ้าง บางทีอัปแล้วไฟล์ไม่ขึ้น ต้องกดรีเฟรชใหม่',
    star: 2,
    createdAt: new Date(Date.now() - 691200000).toISOString(), // 8 วันที่แล้ว
    isShow: false,
  },
  {
    id: 'CMT-1006',
    msg: 'ดีมากเลยครับที่มีระบบแจ้งเตือนผ่านอีเมล ทำให้ไม่พลาดข่าวสารสำคัญ',
    star: 5,
    createdAt: new Date(Date.now() - 777600000).toISOString(), // 9 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1005',
    msg: 'อยากให้มีโหมด Dark Mode สำหรับคนทำงานดึกๆ ครับ แสงหน้าจอสว่างเกินไป',
    star: 4,
    createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1004',
    msg: 'ภาพรวมทำออกมาได้ตอบโจทย์การใช้งานของประชาชนทั่วไปครับ ขอบคุณครับ',
    star: 5,
    createdAt: new Date(Date.now() - 1296000000).toISOString(), // 15 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1003',
    msg: 'แบบฟอร์มให้กรอกข้อมูลเยอะเกินไปในบางจุด น่าจะลดทอนลงได้บ้างครับ',
    star: 3,
    createdAt: new Date(Date.now() - 1728000000).toISOString(), // 20 วันที่แล้ว
    isShow: false,
  },
  {
    id: 'CMT-1002',
    msg: 'เพิ่งเคยเข้ามาใช้งานครั้งแรก รู้สึกว่าเมนูจัดวางเป็นระเบียบหาของง่ายดีครับ',
    star: 5,
    createdAt: new Date(Date.now() - 2160000000).toISOString(), // 25 วันที่แล้ว
    isShow: true,
  },
  {
    id: 'CMT-1001',
    msg: 'ขอเสนอแนะให้มีวิดีโอสอนการใช้งานระบบแบบ Step-by-step แทรกไว้ในหน้าเว็บเลยครับ',
    star: 4,
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 วันที่แล้ว
    isShow: true,
  }
];

// ==========================================
// 5. NewsProvider Component
// ==========================================
export const NewsProvider = ({ children }: { children: ReactNode }) => {

  // ข่าวประชาสัมพันธ์ (prList) — เชื่อมต่อกับ localStorage
  const [prList, setPrList] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('amlo_prList')
      if (saved) return JSON.parse(saved)
    } catch {
      // ป้องกันการแครชกรณีเบราว์เซอร์บล็อก localStorage
    }
    return MOCK_PR_DB.map((item) => ({
      ...item,
      views: Math.floor(Math.random() * 500),
      isShow: true,
    }))
  })

  // กิจกรรมและประกาศ (newsList) — เชื่อมต่อกับ localStorage
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

  // ความคิดเห็น/รีวิว (commentList) — เชื่อมต่อกับ localStorage
  const [commentList, setCommentList] = useState<CommentItem[]>(() => {
    try {
      const saved = localStorage.getItem('amlo_commentList')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return MOCK_COMMENTS
  })

  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // บันทึก prList ลงใน localStorage เสมอเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      localStorage.setItem('amlo_prList', JSON.stringify(prList))
    } catch {
      // ignore
    }
  }, [prList])

  // บันทึก newsList ลงใน localStorage เสมอเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      localStorage.setItem('amlo_newsList', JSON.stringify(newsList))
    } catch {
      // ignore
    }
  }, [newsList])

  // บันทึก commentList ลงใน localStorage เสมอเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      localStorage.setItem('amlo_commentList', JSON.stringify(commentList))
    } catch {
      // ignore
    }
  }, [commentList])

  // โหลดข้อมูลหน่วยงานโครงสร้างหลักแบบดีเลย์จำลอง
  useEffect(() => {
    const timer = setTimeout(() => {
      setDepartmentList(MOCK_DEPARTMENTS_DB)
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // สรุปข้อมูลทั้งหมดส่งผ่าน Context Provider ไปยัง Component ลูกๆ
  const contextValue = useMemo(
    () => ({
      newsList,
      prList,
      departmentList,
      commentList,
      isLoading,
      setPrList,
      setNewsList,
      setCommentList,
    }),
    [newsList, prList, departmentList, commentList, isLoading],
  )

  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  )
}