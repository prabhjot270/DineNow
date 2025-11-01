import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "./cartSlice";



const Cart=()=>{
    const cartItems= useSelector((store)=> store.cart.items)
    const dispatch=useDispatch() ;
    const handleClearCart=()=>{
    dispatch(clearCart())
}
    return (
        <div className='flex justify-center items-center m-auto'>
        <div className='summary card w-[660px] h-auto text-center m-4 p-4 border border-black'>
           <h1 className='text-center font-bold text-pink-400'>Your order</h1>
            {/* clear cart */} 
                       <button className='m-2 p-2 bg-black text-white rounded-lg cursor-pointer'
                       onClick={handleClearCart}>Clear Cart</button>
           {/* if cart is empty */}
           {cartItems.length==0 ?(
               <p className='text-gray-500 text-lg mt-10'>Your Cart is empty</p>
           ):(
            <ul className='space-y-6'>
               {cartItems.map((item,index)=>{
                const info=item.card?.info ;
                if(!info) return null ;
                
                return(
                  
                    
                    <li key={`${info.id}-${index}`}
                    className='border border-gray-200 rounded-md p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition'>
                      
                       {/* item image */}
                       <img
                       src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_200/${info.imageId}`}
                       alt={info.name}
                       className='w-34 h-34 object-cover rounded-md'
                       />
                    
                    <div className='menu-details flex-1 text-left'>
                         <h2 className='itemname text-bold'>
                          {info.name}
                         </h2>
                         <p className='category text-sm text-gray-500 italic mb-1'>
                           {info.category}
                         </p>
                         <p className='description text-gray-600 text-sm'>
                             {info.description || "NO Description Available"}
                         </p>
                         <p className='price font-medium text-green-700 mt-2'>
                            ₹{(info.price || info.defaultPrice)/100}
                         </p>
                    </div>

                    </li>
                   
                )
               })}
            </ul>
           )
           }
        </div>
        </div>
    )
}
export default Cart ;