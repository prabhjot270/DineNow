import  React,{ useState , useEffect} from "react"
import ReactDOM from 'react-dom/client'
import Shimmer from "./Shimmer";
import RestaurantCard, { withPromotedLabel } from "./ResCard";
import RestaurantList from "./ResList";
import { useNavigate } from "react-router";
import { createBrowserRouter ,RouterProvider, Outlet, Link } from "react-router";
import useOnlineStatus from "./useOnlineStatus";

const Body = () => {
  const navigate = useNavigate();
  const [searchRes, setSearchRes] = useState("");   // user input
  const [allRes, setAllRes] = useState([]);         // full list (array)
  const [filteredRes, setFilteredRes] = useState([]); // results to render
  const RestaurantCardPromoted=withPromotedLabel(RestaurantCard);
  const PROXY = "http://localhost:5000/api/restaurants"; // your proxy

  useEffect(() => {
    // fetch once and extract restaurants array safely
    async function load() {
      try {
        const raw = await fetch(PROXY);
        const json = await raw.json();
        console.log("raw response", json);

        // safer extraction: try to find the card that contains restaurants
        const cards = json?.data?.cards || [];
        // find the first card that has gridElements.infoWithStyle.restaurants
        const targetCard = cards.find((c) =>
          !!(
            c?.card?.card?.gridElements?.infoWithStyle?.restaurants &&
            Array.isArray(
              c.card.card.gridElements.infoWithStyle.restaurants
            )
          )
        );

        const restaurants =
          targetCard?.card?.card?.gridElements?.infoWithStyle?.restaurants ||
          [];

        console.log("extracted restaurants length:", restaurants.length);
        // ensure array type
        setAllRes(restaurants);
        setFilteredRes(restaurants);
      } catch (err) {
        console.error("fetch/load error:", err);
        setAllRes([]);
        setFilteredRes([]);
      }
    }
    load();
  }, []);

  // Filter function - called by button or Enter
  const handleSearch = () => {
    const q = (searchRes || "").trim().toLowerCase();
    if (!q) {
      // empty query -> restore full list
      setFilteredRes(allRes);
      return;
    }

    // defensive: ensure allRes is an array
    if (!Array.isArray(allRes)) {
      console.warn("allRes is not an array:", allRes);
      setFilteredRes([]);
      return;
    }

    const filtered = allRes.filter((r) => {
      const name = r?.info?.name ?? "";
      const cuisines = Array.isArray(r?.info?.cuisines)
        ? r.info.cuisines.join(" ")
        : "";
      // check name or cuisine matches
      return (
        name.toLowerCase().includes(q) || cuisines.toLowerCase().includes(q)
      );
    });

    console.log("search:", q, "=> found:", filtered.length);
    setFilteredRes(filtered);
  };

  // optional: live search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
   
//   Filter functions
   const filterRating4plus=(restaurants) =>{
      return restaurants.filter((r)=>parseFloat(r?.info?.avgRating)>=4)
   }

   const filterPureVeg=(restaurants)=>{
    return restaurants.filter((r)=>(r?.info.veg===true));
   }

   const filterWithin5km=(restaurants)=>{
    return restaurants.filter((r)=>(r?.info?.sla?.lastMileTravel ?? Infinity) <= 5)
   }
   const filterServesAlcohol=(restaurants)=>{
     return restaurants.filter((r)=>{
       return /alcohol|bar|beer|wine/i.test(JSON.stringify(r?.info ?? {}))
     });
   }
   const sortByRating=(restaurants)=>
   [...restaurants].sort(
    (a,b)=>
    (parseFloat(b?.info?.avgRating)||0)-
    (parseFloat(a?.info?.avgRating )|| 0)
   );
     
   const onlineStatus=useOnlineStatus();
   if(onlineStatus==false){
     return (
        <h1 className="onlineStatus"> No Internet !! 
        Looks like you are offline!!</h1>
     )
   }
   if(allRes.length===0){
     return <Shimmer></Shimmer>
   }
  return (
    <div className="body">
      {/* search box */}
      <div className="search">
        <input
          id="search-input"
          type="text"
          value={searchRes}
          placeholder="Search Restaurants or Cuisines..."
          onChange={(e) => setSearchRes(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className='search-icon' onClick={handleSearch}>🔍 </button>
       
      </div>
        
        <div className="filters">
            <button  className="btn-fourplus" onClick={()=>setFilteredRes(filterRating4plus(allRes))}>
                Top Rated ⭐
            </button>
            <button  className="btn-veg" onClick={()=>setFilteredRes(filterPureVeg(allRes))}>
             Pure Veg 🟢
            </button>
            <button  className="btn-5km" onClick={() => setFilteredRes(filterWithin5km(allRes))}>
             Within 5 km
            </button>
           <button className="btn-alcohol" onClick={() => setFilteredRes(filterServesAlcohol(allRes))}>
             Serves Alcohol
           </button>
            <button className="btn-sort-rating" onClick={() => setFilteredRes(sortByRating(allRes))}>
             Sort by : Ratings
            </button>
             <button
              className="btn-dining" onClick={() => navigate("/about")}>
            About Us</button>
            </div>
      {/* r esults */}
      
      <div className="res-container">
        {Array.isArray(filteredRes)&& filteredRes.length>0 ?(
            <RestaurantList restaurants={filteredRes}></RestaurantList>
            //  <RestaurantCardPromoted res={restaurant} />
        ): (
            <Shimmer></Shimmer>
        )
    }
        {/* {Array.isArray(filteredRes) && filteredRes.length > 0 ? (
          filteredRes.map((res) => {
            // each `res` has shape: { info: { id, name, cuisines, avgRating, sla, cloudinaryImageId, ... } }
            return (
             <RestaurantList res={filteredRes}/>
            );
          })
        ) :  (Array.isArray(filteredRes) ? (
            <p style={{ padding: 20 }}>No restaurants found.</p>
        ) 
        : (
          <Shimmer />   
             )
         )}      */}
      </div>
    </div>
  );
};
export default Body;