import React, { useState, useEffect } from 'react';
import { Ellipsis, Gem } from 'lucide-react';
import user from '../assets/user.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { LogOut, BadgeCheck } from 'lucide-react';

export default function Navbar({ foods }) {
  const [nav, setNav] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userModal, setUserModal] = useState(false);
  const { logout, userData, loggedIn, isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    loggedIn();
  }, [])
  useEffect(() => {
    if (userData && userData.username) {
      setUsername(userData.username);
      setEmail(userData.email);
      console.log(isLoggedIn, userData.username);
    }
  }, [userData]);

  const handleLogOut = () => {
    logout();
    setUsername("");
    setEmail("");
    setUserModal(false)
  }

  return (
    <div className='sticky top-0 z-50'>
      <div className='md:flex hidden items-center justify-between px-20 py-5 bg-linear-to-r from-blue-200 to-white shadow-2xl'>
        <div>
          <p className='font-bold text-2xl'><Link to={'/'}>FlavorFinds</Link></p>
        </div>
        <div>
          <ul className='flex gap-20 items-center'>
            <li className=' transition-all duration-500 hover:text-blue-200'><select className="cursor-pointer appearance-none border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:border-blue-500">
              <option>Categories</option>
              <option>Course</option>
              <option>Cuisine</option>
              <option>Dietary Preferences</option>
            </select></li>
            <li className='cursor-pointer hover:border-b-2 hover:border-blue-200 transition duration-500 hover:text-blue-200'><Link to={'/meal-plan'}>Meal Plans</Link></li>
            <li className='cursor-pointer hover:border-b-2 hover:border-blue-200 transition duration-500 hover:text-blue-200'><Link to={'/favourites'}>My Favourites</Link></li>
          </ul>
        </div>
        <div className='flex gap-3 items-center'>
          <img src={user} className='w-8 h-8 rounded-full cursor-pointer' onClick={() => setUserModal(!userModal)} />
          {
            isLoggedIn && username !== "" ?
              <p className='font-mono font-semibold'>{username}</p>
              :
              <button className='bg-blue-200 py-2 px-5 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-500 hover:scale-105'><Link to={'/Auth'}>Login/Sign Up</Link></button>
          }
        </div>
      </div>

      <div style={{ backgroundImage: "linear-gradient(to right, #bfdbfe, white)" }} className='md:hidden relative w-full z-50'>

        <div className='flex items-center justify-between px-5 py-4 bg-linear-to-r from-blue-200 to-white shadow-lg'>

          <Ellipsis
            color='black'
            size={30}
            className='cursor-pointer'
            onClick={() => {
              setNav(!nav);
              setUserModal(false);
            }}
          />

          <div>
            {
              isLoggedIn && username !== "" ?
                <img
                  src={user}
                  alt="User Avatar"
                  className='w-8 h-8 rounded-full cursor-pointer'
                  onClick={() => {
                    setNav(false);
                    setUserModal(!userModal);
                  }}
                />
                :
                <button
                  style={{ backgroundColor: '#BFDBFE' }}
                  className='py-2 px-5 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-500 hover:scale-105'
                >
                  <Link to={'/Auth'}>Login/Sign Up</Link>
                </button>
            }
          </div>
        </div>

        <div
          style={{ backgroundImage: 'linear-gradient(to right, #bfdbfe, white)' }}
          className={`absolute top-30 left-0 right-0 mx-auto w-[90%] text-center flex flex-col gap-5 rounded-2xl transition-all duration-500 shadow-xl
      ${nav ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'} z-40
    `}
        >
          <div>
            <p className='font-bold text-2xl mt-5'><Link to={'/'}>FlavorFinds</Link></p>
          </div>

          <div>
            <ul className='flex flex-col gap-5'>
              <li className=' transition-all duration-500 hover:text-blue-200'>
                <select className=" text-center cursor-pointer appearance-none border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:border-blue-500">
                  <option>Categories</option>
                  <option>Course</option>
                  <option>Cuisine</option>
                  <option>Dietary Preferences</option>
                </select>
              </li>
              <li className='cursor-pointer hover:border-b-2 hover:border-blue-200 transition duration-500 hover:text-blue-200'><Link to={'/meal-plan'}>Meal Plans</Link></li>
              <li className='cursor-pointer hover:border-b-2 hover:border-blue-200 transition duration-500 hover:text-blue-200 pb-5'><Link to={'/favourites'}>My Favourites</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          style={{ backgroundColor: "#DBEAFE" }}
          className={`
      absolute top-15 right-5 
      h-110 w-70 shadow-md rounded-xl
      flex flex-col justify-between

      transition-all duration-500 origin-top-right
      ${isLoggedIn && userModal ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"}
    `}
        >
          
          <div className="relative pl-22 mt-5 border-b border-gray-400">
            <img src={user} className="w-15 h-15 rounded-full" />
            <p className="ml-2 font-mono font-semibold my-2">{username}</p>
          </div>

          <div className="px-5 flex flex-col gap-10">
            <p className="font-mono">{email}</p>

            <p className="text-gray-600">
              Welcome to Our FlavorFinds Web Page where you can find your type meals Recipe.
            </p>

            <Link to={"/payment"} className="flex items-center gap-5">
              <Gem size={25} color="black" />
              <p
                style={{ backgroundColor: "#60A5FA" }}
                className="font-mono px-5 py-1 rounded-xl w-[65%] cursor-pointer
          hover:scale-110 transition-all duration-500 text-white"
              >
                Buy Premium Subscription
              </p>
            </Link>
          </div>

          {/* Logout */}
          <div className="flex my-5 gap-5 px-5 pt-3 border-t border-gray-500">
            <LogOut size={25} color="gray" onClick={handleLogOut} className="cursor-pointer" />
            <p className="text-gray-500">Log Out</p>
          </div>
        </div>
      </div>

    </div>
  )
}

