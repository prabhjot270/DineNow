import React,{useEffect,useState} from 'react';
import RestaurantCard from './ResCard';
import Shimmer from './Shimmer';
// const PROXY = "http://localhost:5000/api/dineout";
const PROXY = "http://localhost:5000/api/dineout?lat=28.67003492726483&lng=77.11469986756225";


const DineBody=()=>{
    const [allRes,setAllRes]= useState([]);
    const [filteredRes,setFilteredRes]=useState([]);
     
    useEffect(()=>{
        async function load(){
            try{
                const raw = await fetch(PROXY) ;
                if(!raw.ok) throw new Error("Network response is not ok"+raw.status);

               const json = await raw.json() ;
               console.log("raw response", json);

               const cards=json?.data?.cards || [] ;
               const restaurants=cards.flatMap(
                (c)=>( c?.card?.card?.gridElements?.infoWithStyle?.restaurants || [])
            );
               console.log(cards);
               setAllRes(restaurants) ;
               setFilteredRes(restaurants) ;
            }catch(err){
                console.error("DineOut load failed:", err);
                console.error("Full error:", err);
                setAllRes([]);
                setFilteredRes([]);
            }

        }
         load();
    },[]);

    return (
        <div className="body">
      <h2>Dining (Dineout)</h2>
      <div className="res-container">
        {filteredRes === null ? (
          <Shimmer />
        ) : filteredRes.length === 0 ? (
          <p style={{ padding: 20 }}>No dineout restaurants found.</p>
        ) : (
          filteredRes.map((res) => (
            <RestaurantCard
              key={res?.info?.id || Math.random()}
              resname={res?.info?.name}
              cuisine={Array.isArray(res?.info?.cuisines) ? res.info.cuisines.join(", ") : ""}
              rating={res?.info?.value || ""}
              imageId={res?.info?.cloudinaryImageId}
              cost={res?.info?.costForTwo}
              discount={`${res?.info?.aggregatedDiscountInfoV3?.header || ""} ${res?.info?.aggregatedDiscountInfoV3?.subHeader || ""}`}
              location={`${res?.info?.locality || ""} ${res?.info?.areaName || ""}`}
              availability={res?.info?.availability}
            />
          ))
        )}
      </div>
    </div>
  );
}
export default DineBody ;