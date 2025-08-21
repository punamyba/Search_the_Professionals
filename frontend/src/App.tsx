import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './features/auth/login/login'
import Register from './features/auth/register/register'
import Home from './features/auth/home/home'
import Explore from './features/auth/Explore/explore'
import LoginGuard from './shared/guards/loginGuard'
import NotFound from './features/auth/notfound/notfound'
import AuthGuard from './shared/guards/authGuard'
import RoleGuard from './shared/guards/roleGuard' 
import Profile from './features/auth/profile/profile'
import axiosInstance from './shared/config/axiosinstance'
import ContactUs from './features/auth/Contact/contact'
import EditProfile from './features/auth/EditProfile/edit'
import About from './features/auth/About/about'

function App() {

  return (
    <div style={{ padding: "20px" }}>
    <Routes>
      <Route path='/' element={ <Navigate to = '/login' replace />}/>
      <Route path='/login' element={ 
        <LoginGuard>
          <Login />
        </LoginGuard>
      }/>


      <Route path='/register' element={<Register/>}/>


      <Route path='/home' element={
        <AuthGuard>
          <Home/>
        </AuthGuard>
      }/>
      
      <Route path='/explore' element={
        <AuthGuard>
         <Explore/>
        </AuthGuard>
      }/>
      <Route path='/contact' element={
        <AuthGuard>
         <ContactUs/>
        </AuthGuard>
      }/>

      <Route path="/profile/:userId" element={<Profile />} />

      <Route path='/notfound' element={<NotFound/>}/>
      
      <Route path='/edit-profile' element={<EditProfile/>}/>

      <Route path='/about' element={< About/>}/>
      <Route path='*' element={<NotFound/>}/>
    </Routes>
    </div>
  )
}

export default App


