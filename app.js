
import React, { useState , useEffect} from 'react'
import ReactDOM from 'react-dom/client'

import icecream from '/images/ice_cream.avif'
import logo from '/images/logo.png'
import thali from '/images/thali.avif'

import Header from "./Header";
import RestaurantCard from "./ResCard";
import RestaurantList from "./ResList";
import Shimmer from "./Shimmer";
import Body from "./Body";

import { createBrowserRouter ,RouterProvider, Outlet, Link } from "react-router";
import About from "./About";
import Contact from "./ContactUs";
import Error from "./Error";
import ResMenu from './ResMenu'
import './style.css'
import { Provider } from 'react-redux'
import appStore from './appStore'
import Cart from './Cart'

const AppLayout=()=>{
    return (
      <Provider store={appStore}>
        <div className='app'> 
              <Header />
              <Outlet />
             
        </div>
        </Provider>
    )
}
const appRouter=createBrowserRouter([
  {
    path:"/",
    element:<AppLayout/>,

    children:[
      {
      path:"/restaurants/:resID",
      element:<ResMenu/>
      },
    {
      path:'/',
      element:<Body/>
    },
    {
    path:"/about",
     element:<About/>
   },
   {
    path:'/contact',
    element:<Contact/>
   },
   {
    path:'/cart',
    element: <Cart></Cart>
   }
   
    ],

    errorElement:<Error></Error>
  }
])
const root=ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <RouterProvider router={appRouter}></RouterProvider>
 
)
