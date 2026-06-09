import { Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='bg-slate-900 text-slate-300 pt-8 pb-6 mt-[50px]'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* 🌟 โซนบน: แบ่ง 2 คอลัมน์ด้วย Grid (แก้ปัญหา Tablet อึดอัด) */}
        {/* มือถือ: 1 คอลัมน์ (เรียงลงมา) | Tablet/Desktop: 2 คอลัมน์ (แบ่ง 50/50) */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start'>
          {/* 📦 ส่วนซ้าย: ข้อมูล/โลโก้ */}
          {/* เอา text-center ออก บังคับชิดซ้ายเสมอเพื่อความอ่านง่าย */}
          <div className='flex flex-col gap-4 text-left'>
            <img
              src='/Logo.png'
              alt='โลโก้ ปปง.'
              className='w-[90px] h-[90px] object-contain'
            />

            <div>
              {/* ซ่อน <br/> ในมือถือ แต่โชว์ในคอม เพื่อตัดบรรทัดให้สวยงาม */}
              <h3 className='text-white text-xl md:text-2xl font-bold leading-snug'>
                สำนักงานกองข่าวกรองทางการเงิน <br className='hidden lg:block' />{' '}
                สำนักงาน ปปง.
              </h3>
              <p className='text-sm text-slate-400 mt-1'>
                Anti-Money Laundering Office (AMLO)
              </p>
            </div>

            <div className='space-y-2 text-sm md:text-base leading-relaxed'>
              <p>422 ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330</p>
              <p className='flex items-center gap-3'>
                <Phone size={18} className='text-blue-400' strokeWidth={2} />
                <span>โทรศัพท์ 02-219-3600 ต่อ 1022 , 1028</span>
              </p>
              {/* เว้นช่องว่างให้ตรงกับบรรทัดบน (ชดเชยพื้นที่ Icon) */}
              <p className='pl-[30px]'>โทรสาร 02-219-3902</p>
            </div>

            <div className='pt-2'>
              <Link
                to='#'
                className='inline-block px-6 py-2 rounded-full border border-slate-600 text-slate-300 hover:bg-white hover:text-slate-900 transition-colors font-medium text-sm'
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>

          {/* 📦 ส่วนขวา: กล่องใส่แผนที่ */}
          <div className='w-full h-full min-h-[250px] md:min-h-[300px]'>
            <div className='w-full h-full min-h-[250px] md:min-h-[300px] rounded-2xl overflow-hidden shadow-xl border border-slate-700/50 bg-slate-800'>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5088760861113!2d100.52815717538161!3d13.748157697377236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ecd23502191%3A0x6727623006f0914c!2z4Liq4Liz4LiZ4Lix4LiB4LiH4Liy4LiZ4Lib4LmJ4Lit4LiH4LiB4Lix4LiZ4LmB4Lil4Liw4Lib4Lij4Liy4Lia4Lib4Lij4Liy4Lih4LiB4Liy4Lij4Lif4Lit4LiB4LmA4LiH4Li04LiZICjguKrguLPguJnguLHguIHguIfguLLguJkg4Lib4Lib4LiHLik!5e0!3m2!1sth!2sth!4v1777450612263!5m2!1sth!2sth'
                className='w-full h-full min-h-[250px] md:min-h-[300px]'
                style={{ border: 0 }}
                allowFullScreen={false}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              ></iframe>
            </div>
          </div>
        </div>

        {/* 🌟 โซนล่าง: แถบลิขสิทธิ์ (Copyright Bar) */}
        {/* ตีเส้นคั่นบางๆ แล้วดันให้มาอยู่ล่างสุด */}
        <div className='mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-500'>
          <p>© {new Date().getFullYear()} สำนักงาน ปปง. สงวนลิขสิทธิ์</p>
          <p>พัฒนาโดยทีมนักศึกษาฝึกงาน</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
