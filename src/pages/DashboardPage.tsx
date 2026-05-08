
const DashboardPage = () => {
  interface ContactFormData {
    firstName: string
    lastName: string
    email: string
    telNumber: string
    preferredContact: string
    message: string
  }

  interface StatData {
    id: number
    label: string
    value: string | number
    icon: string
    trend: string // เช่น '+12%', '-5%'
    isPositive: boolean // เอาไว้เช็คสี เขียว/แดง
  }

  const mockContactData: ContactFormData[] = [
    {
      firstName: 'สมชาย',
      lastName: 'สายลม',
      email: 'somchai@email.com',
      telNumber: '0812345678',
      preferredContact: 'Email',
      message: 'สนใจสอบถามข้อมูลครับ',
    },
    {
      firstName: 'วิภา',
      lastName: 'ใจดี',
      email: 'wipa@email.com',
      telNumber: '0823456789',
      preferredContact: 'Phone',
      message: 'ขอทราบราคาสินค้าค่ะ',
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      telNumber: '0834567890',
      preferredContact: 'Email',
      message: 'Looking for partnership.',
    },
    {
      firstName: 'กมล',
      lastName: 'รุ่งเรือง',
      email: 'kamol@email.com',
      telNumber: '0845678901',
      preferredContact: 'Phone',
      message: 'รบกวนติดต่อกลับช่วงบ่าย',
    },
    {
      firstName: 'นารี',
      lastName: 'รักเรียน',
      email: 'naree@email.com',
      telNumber: '0856789012',
      preferredContact: 'Email',
      message: 'สมัครสมาชิกไม่ได้ค่ะ',
    },
    {
      firstName: 'ธนา',
      lastName: 'มานะ',
      email: 'thana@email.com',
      telNumber: '0867890123',
      preferredContact: 'Email',
      message: 'แจ้งโอนเงินครับ',
    },
    {
      firstName: 'Somsak',
      lastName: 'Strong',
      email: 'somsak@test.com',
      telNumber: '0878901234',
      preferredContact: 'Phone',
      message: 'สอบถามเส้นทางไปร้าน',
    },
    {
      firstName: 'อารี',
      lastName: 'สวยงาม',
      email: 'aree@email.com',
      telNumber: '0889012345',
      preferredContact: 'Email',
      message: 'ได้รับของแล้ว ขอบคุณค่ะ',
    },
    {
      firstName: 'ชัย',
      lastName: 'ชนะ',
      email: 'chai@email.com',
      telNumber: '0890123456',
      preferredContact: 'Phone',
      message: 'ปรึกษาเรื่องโปรโมชั่น',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.s@test.com',
      telNumber: '0901234567',
      preferredContact: 'Email',
      message: 'Forgot my password.',
    },
  ]

  const mockStats: StatData[] = [
    {
      id: 1,
      label: 'จำนวนเข้าชมเว็บ',
      value: '12,840',
      icon: '👁️',
      trend: '+15% จากเดือนที่แล้ว',
      isPositive: true,
    },
    {
      id: 2,
      label: 'ข้อความใหม่',
      value: 24,
      icon: '✉️',
      trend: 'มี 5 ข้อความยังไม่ได้อ่าน',
      isPositive: false, // หรือใช้เป็นสถานะแจ้งเตือน
    },
  ]
  return (
    <main>
      {/* statData*/}
      <div>
        {mockStats.map((item) => {
          return (
            <div>
              <p>{item.id}</p>
              <p>{item.label}</p>
              <p>{item.trend}</p>
              <p>{item.isPositive}</p>
            </div>
          )
        })}
      </div>
      {/* msg lists */}
      <div className='grid grid-flow-row grid-cols-2 gap-2'>
        {mockContactData.map((item, index) => {
          return (
            <div className='p-3 border rounded-2xl'>
              <p>{index + 1}</p>
              <div className='flex gap-x-4'>
                <p>{item.firstName}</p>
                <p>{item.lastName}</p>
              </div>

              <p>{item.email}</p>
              <p>{item.telNumber}</p>
              <p>
                <strong>ช่องทางติดต่อกลับ </strong>
                {item.preferredContact}
              </p>
              <p>
                <strong>ข้อความ :</strong>
                {item.message}
              </p>
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default DashboardPage
