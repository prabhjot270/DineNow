import React, { useState , useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import {  useNavigate, Link } from "react-router";
import useOnlineStatus from "./useOnlineStatus";
import { useSelector } from "react-redux";


const Header=()=>{
  // let btnName='Login';
  const [btnStatus, setBtnStatus]=useState('Sign in') ;
  const onlineStatus=useOnlineStatus();

  //Subscribing to the store using selector 

  const cartItems =useSelector((store)=> store.cart.items)
  console.log('cartIems are',cartItems);
    return (
        <div className='header flex justify-between bg-pink-200'>
           <div className='logo-container'>
            <img className='logo w-32' src='/logo.3e06ac0f.png'/>
          </div>
          <div className='nav-items'>
                <ul className='flex m-4 p-4 items-start'> 
                    <li className=' px-4 '>Online Status:{onlineStatus ?"🟢":"🔴"}</li>
                    <li className='px-[40px]'>Home</li>
                    <li className='px-4'> 
                       <Link to='/about'>About Us</Link> 
                      </li>
                    <li className='px-4' >
                      <Link to='/contact'>Contact Us</Link> 
                       </li>
                    <li className='px-4 font-bold' > 
                      <Link to='/cart'> Cart 🛒 ({cartItems.length} items)</Link>
                      </li>
                    <button className="login" onClick={()=>{
                    btnStatus==='Sign in'? setBtnStatus('Logout'): setBtnStatus('Sign in')}}>
                      {btnStatus}
                      </button>
                </ul>
          </div>
        </div>
    )
}
export default Header; 