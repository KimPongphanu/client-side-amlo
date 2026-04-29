import React from "react";
import {Link} from "react-router-dom";
import {Phone} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 mt-[50px]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* ส่วนซ้าย: ข้อมูล/โลโก้ */}
        <div className="text-center md:text-left">
          <img src="/Logo.png" alt="Logo" className="w-[100px] h-[100px]"/>
          <h3 className="text-white text-2xl font-bold mb-2">สำนักงานกองข่าวกรองทางการเงิน สำนักงาน ปปง.</h3>
          <p className="text-sm text-slate-400">
            Anti-Money Laundering Office (AMLO)
          </p>
          <p> 422 ถนนพญาไท แขวงวังใหม่ เขตประทุมวัน กรุงเทพมหานคร 10330</p>
          <p className="flex items-center gap-2"><Phone size={20} color="white" strokeWidth={1.5}/> โทรศํพท์ 02-219-3600 ต่อ 1022 , 1028</p>
          <p> โทรสาร 02-219-3902</p>
          <p><Link to = "#" className="text-white underline hover:text-red-400">ติดต่อ</Link></p>
        </div>

        {/* ส่วนขวา: ลิงก์หรือลิขสิทธิ์ */}
        <div className="text-center md:text-right text-sm">
          {/* กล่องใส่แผนที่ */}
            <div className="w-full h-56 md:h-64 rounded-2xl overflow-hidden shadow-md border border-slate-200/20">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5088760861113!2d100.52815717538161!3d13.748157697377236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ecd23502191%3A0x6727623006f0914c!2z4Liq4Liz4LiZ4Lix4LiB4LiH4Liy4LiZ4Lib4LmJ4Lit4LiH4LiB4Lix4LiZ4LmB4Lil4Liw4Lib4Lij4Liy4Lia4Lib4Lij4Liy4Lih4LiB4Liy4Lij4Lif4Lit4LiB4LmA4LiH4Li04LiZICjguKrguLPguJnguLHguIHguIfguLLguJkg4Lib4Lib4LiHLik!5e0!3m2!1sth!2sth!4v1777450612263!5m2!1sth!2sth" 

                className="w-full h-full"
                style={{ border: 0 }} 

                // 🌟 3 ค่านี้สำคัญมากสำหรับ Production ขาดไม่ได้!
                allowFullScreen={false} 
                loading="lazy" // ทำให้เว็บโหลดไวขึ้น (รอให้เลื่อนมาถึงแผนที่ก่อนค่อยโหลด)
                referrerPolicy="no-referrer-when-downgrade" // มาตรฐานความปลอดภัย
              ></iframe>
            </div>
          <p>© {new Date().getFullYear()} สำนักงาน ปปง. สงวนลิขสิทธิ์</p>
          <p className="text-slate-500 mt-1">พัฒนาโดยทีมนักศึกษาฝึกงาน</p> 
        </div>

      </div>
    </footer>
  );
};

export default Footer;


// <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5088760861113!2d100.52815717538161!3d13.748157697377236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ecd23502191%3A0x6727623006f0914c!2z4Liq4Liz4LiZ4Lix4LiB4LiH4Liy4LiZ4Lib4LmJ4Lit4LiH4LiB4Lix4LiZ4LmB4Lil4Liw4Lib4Lij4Liy4Lia4Lib4Lij4Liy4Lih4LiB4Liy4Lij4Lif4Lit4LiB4LmA4LiH4Li04LiZICjguKrguLPguJnguLHguIHguIfguLLguJkg4Lib4Lib4LiHLik!5e0!3m2!1sth!2sth!4v1777450612263!5m2!1sth!2sth" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>