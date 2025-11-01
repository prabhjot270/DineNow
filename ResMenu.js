import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router';
import ReactDOM from 'react-dom/client'
import { useDispatch } from 'react-redux';
import { addItems } from './cartSlice';


const ResMenu=()=>{
    const {resID}= useParams() ;
    const dispatch=useDispatch();
    console.log('resId id ', resID);
    const [resData, setResData]=useState() ;
    const [menuItems,setMenuItems]=useState([]) ;

    useEffect(()=>{
        const fetchResData= async ()=>{
            try{
                const res=await fetch(
                    `http://localhost:5000/api/restaurants/${resID}`
                )
                if (!res.ok) {
                const text = await res.text();
                console.warn("⚠️ Backend returned non-OK:", res.status, text.slice(0, 300));
                return;
                }

                console.log('getting res req in ResMenu:',res)
                const json= await res.json() ;
                 
                if (!json?.data?.cards) {
                console.warn("⚠️ Missing data.cards in response:", json);
                 setError("No restaurant data available.");
                 return;
                  }
                const cards= json?.data?.cards ;

                const restaurantInfoCard=cards.find(
                    (card)=>
                        card.card?.card?.['@type']==="type.googleapis.com/swiggy.presentation.food.v2.Restaurant"
                );
                const menuCard=cards?.find(
                    (card)=>
                card?.groupedCard?.cardGroupMap?.REGULAR?.cards);

                const resInfo=restaurantInfoCard?.card?.card?.info ;
                const menuList= menuCard?.groupedCard?.cardGroupMap?.REGULAR?.cards
                ?.map((item)=>item.card?.card)
                ?.filter((card)=>card['@type']?.includes("ItemCategory") )
                // .flatMap((category)=> category.itemCards || []);

                setResData(resInfo) ;
                setMenuItems(menuList) ;
                // console.log('menuCard',menuCard);
                // console.log('ResInfo',resInfo);
                // console.log('menuList',menuList);
            }
            catch(err){
              console.log('Error Fetching Restauarant Menu:',err);
            }
        };
         fetchResData();
    },[resID] );

     if (!resData) return <h2>Loading menu...</h2>;
     console.log("resData is :",resData);
     console.log('menuItems is : ', menuItems);
     

const handleAddItem =(item)=>{
    //Dispatch an action 
    dispatch(addItems(item))
}
   return (
       <div className="res-menu-details w-6/12 mx-auto my-4 bg-gray-50 shadow-lg p-4 ">
        <div className=' text-black'>
        <h1>{resData.name}</h1>
         <p>{resData.cuisines?.join(',')}</p>
         <p>Rating: {resData.avgRating}⭐ </p>
         <p>Outlet:{resData.areaName}</p>
         <p>Cost For Two : {resData.costForTwoMessage}</p>
         <img className='w-[200px]'
          src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${resData.cloudinaryImageId}`}
         alt='restaurant image'
         width={400}
         />
      </div>
         <h2 className='menu-card'>Menu</h2>

          {menuItems.map((category, idx) => (
          <div key={idx} className="category-block  border border-black bg-gray-100 shadow-lg p-4 px-1.5">
           <h3 className='font-bold bg-gray-300'>{category.title}</h3>
         <ul>
      {category.itemCards?.map(item => (
        <li key={item.card.info.id}>
          <h4>{item.card.info.name}</h4>
          <p className='text-green-600'>₹{(item.card.info.price || item.card.info.defaultPrice) / 100}</p>
          <button className='absolute p-2 mx-16 rounded-lg bg-black text-white shadow-lg' 
           onClick={()=>handleAddItem(item)}>
            ADD+
          </button>
          {item.card.info.imageId&&(
                    <img 
                    // src={`https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_208,h_208,c_fit/${item.card.info.imageId}`}
                     src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${item.card.info.imageId}`}
                    alt={item.card.info.name} 
                    width={150}
                    />
                   )}

             <h3>{item.card.info.description}</h3>
        </li>
      ))}
    </ul>
  </div>
))}
      </div>
   )
}
export default ResMenu ;