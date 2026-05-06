import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/homePage'
import About from './pages/aboutPage'
import DashboardPage from './pages/DashboardPage'
import ShowImagePage from './pages/ShowImagePage'

function App() {
  return (
    <BrowserRouter>
      {/* ถ้ามี Navbar ที่อยากให้โชว์ทุกหน้า ใส่ไว้ตรงนี้ได้เลย */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/image' element={<ShowImagePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
