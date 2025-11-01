import React, { useState , useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import RestaurantCard from "./ResCard";


const RestaurantList =({restaurants})=>{
    console.log(' is RESLIST REndering ??',restaurants)

    const uniqueById = (arr) => {
  const seen = new Set();
  const out = [];
  (arr || []).forEach((it) => {
    const id = it?.info?.id ?? it?.id;
    if (!id) {
      // keep items without id (rare)
      out.push(it);
      return;
    }
    if (!seen.has(id)) {
      seen.add(id);
      out.push(it);
    } else {
      // duplicate — skipped
    }
  });
  return out;
};
  //   const [restaurant,setRestaurant]=useState([]);

  //   useEffect(() =>{
  //        console.log("useEffect running..."); // 👈 debug line
  //       fetch(
  //           "http://localhost:5000/api/restaurants"
  //       )
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log("Fetched data:", data);

  //       // drill down to restaurant array
  //       const restaurants =
  //         data?.data?.cards?.[1]?.card?.card?.gridElements?.infoWithStyle
  //           ?.restaurants || [];

  //       console.log("Restaurants array:", restaurants);

  //       setRestaurant(restaurants);
  //     })
  //     .catch((err) => console.error("Error fetching:", err));
  // }, []);
    
    
    return (
        
    <div className="res-container  flex flex-wrap">
      {restaurants.length > 0 ? (
        restaurants.map((res,index) => {
    //    console.log("full res object:", res);
    //    console.log("res.info:", res.info);
    //    console.log("res.info.sla:", res.info.sla);
        return (
          <RestaurantCard
            key={res.info.id + "-" + index}
            id={res.info.id}
            resname={res.info.name}
            cuisine={res.info.cuisines.join(", ")}
            rating={res.info.avgRating}
            time={res.info.sla.slaString}
            imageId={res.info.cloudinaryImageId}
            lastMileTravel={res.info?.sla?.lastMileTravelString}
            discount={`${res.info.aggregatedDiscountInfoV3?.header || ""} ${
              res.info.aggregatedDiscountInfoV3?.subHeader || ""
            }`}
            location={`${res.info.locality || ""},${res.info.areaName || ""}`}
            availability={res?.info?.availability}
           totalRatingsString={res?.info?.totalRatingsString}
           cost={res?.info?.costForTwo}

          />
        )
})
      ) : (
        <p>Loading restaurants...</p>
      )}
    </div>
  );

};
export default RestaurantList;