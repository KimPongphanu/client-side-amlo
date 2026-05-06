import { Outlet, useLocation } from 'react-router-dom'; // 1. Import useLocation เพิ่มเข้ามา
import Nav from '../pages/Nav';
import Slider from '../pages/Slider';
import Footer from './Footer';
import CommentForm from '../components/CommentForm';

const slides = [
  { id: 1, image: '/banner.png', title: 'Slide 1' },
  { id: 2, image: '/amlo1.jpg', title: 'Slide 2' },
  { id: 3, image: '/amlo2.jpg', title: 'Slide 3' },
  { id: 4, image: '/amlo3.jpg', title: 'Slide 4' },
  { id: 5, image: '/amlo4.jpg', title: 'Slide 5' },
  { id: 6, image: '/amlo5.jpg', title: 'Slide 6' },
];

const MainLayout = () => {
  const location = useLocation(); 

  // แนะนำให้พิมพ์ตัวเล็กทั้งหมดใน Array นี้เลยครับ
  const hideOnPaths = ['/newsdetailepage', '/agency1', '/news', '/department' , '/advertise'];

  // จับ URL ปัจจุบันมาแปลงเป็นตัวเล็กก่อน (ป้องกันบั๊ก /News กับ /news)
  const currentPath = location.pathname.toLowerCase();

  const shouldHideSlider = hideOnPaths.some(path => currentPath.startsWith(path));
  const showSlider = !shouldHideSlider;
  
  // 🌟 พิมพ์เช็คใน Console ว่าคอมพิวเตอร์เห็นค่าเป็นอะไร
  console.log("ตอนนี้อยู่หน้า:", currentPath, " | ต้องโชว์ Slider ไหม?:", showSlider);

  return (
    <div className="min-h-screen ​w-full relative flex flex-col">
      <Nav />
      
      {showSlider && (
      // 🌟 เปลี่ยนจาก md:pt-0 เป็น lg:pt-0 ครับ
      <div className="pt-16 lg:pt-0 pb-10 bg-slate-50">
        <Slider slides={slides} />
      </div>
      )}
      
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer />

      <CommentForm />
    </div>
  );
};

export default MainLayout;