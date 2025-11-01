 <!-- in the below body code the res-seqarch was not working bcoz improper handing of event  -->

// const Body=()=>{
//    const [searchRes, setSearchRes]= useState("") ; //user input
//    const [allRes, setAllRes]= useState([]); //empty brackets for full list
//    const [filteredRes, setFilteredRes]= useState([]) ; // search res

//    //Fetch once when body mounts
//    useEffect(()=>{
//     fetch("http://localhost:5000/api/restaurants")
//     .then((res)=> res.json())
//     .then((json) => {
//         const restaurants =
//           json?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];

//         setAllRes(restaurants);        // full list
//         setFilteredRes(restaurants);   // initially show all
//         console.log("API Response:", json);
//         console.log("Restaurants:", restaurants);
//       })
      
//       .catch((err) => {
//         console.error("Error fetching restaurants:", err);
//         setAllRes([]);
//         setFilteredRes([]);
//       });
//    },[]); 

//    const handleSearch=()=>{
//     //  if(!searchRes.trim()){
//     //     setFilteredRes(allRes) ;
//     //     return ;
//     //  }

//      const filtered=allRes.filter((res)=>
//         res.info.name.toLowerCase().includes(searchRes.toLowerCase())
//      );
//      setFilteredRes(filtered);
//    }

//    return (
//      <div className="body">
//         {/* Search Bar*/}
//         <div className="search">
//            <input
//            type='text'
//            value={searchRes}
//            placeholder="Search Restaurants Here ..."
//            onChange={(e)=>setSearchRes(e.target.value)}
//            />
//           <button onClick={handleSearch}>Search</button>
//         </div>
//            <div className="restaurant-list">
//             {filteredRes.length > 0 ? (
//             filteredRes.map((restaurant) => (
//             <RestaurantList key={restaurant.info.id} {...restaurant.info} />
//           ))
//         ) : (
//           <p>No restaurants found</p>
//         )}
//         </div>
//      </div>
//    )
// }






<!-- now changed one currently using  -->


 <!-- Explanation — what I changed / why this will work

Robust extraction: instead of assuming cards[1] or cards[2], the code find(...) searches the cards and picks the one with gridElements.infoWithStyle.restaurants. This avoids brittle index assumptions.

Array guard: before .filter() we check Array.isArray(allRes). That prevents allRes.filter is not a function errors.

Search checks both name and cuisine (useful real-world behavior).

Input wired: onChange updates searchRes, Search button calls handleSearch, Enter key also triggers search.

Reset button: clears input and restores full list.

Console logs: helpful console.log lines show raw response and extracted array length — useful for debugging.

Quick debugging checklist (if still not working)

Open DevTools Console and verify raw response and extracted restaurants length logs appear.

If extracted restaurants length is 0, inspect raw response to find where restaurants are stored — adjust the find(...) logic accordingly.

When you type a query and click Search, check search: <query> => found: <n> log. If n is 0 but expected >0, inspect allRes[0] structure: console.log(allRes[0]) and confirm info.name and info.cuisines.

If filtering works in console but UI doesn’t update, confirm RestaurantCard uses the props you pass (resname, cuisine, etc.). If your RestaurantCard expects different prop names, adapt the prop names in the map.

If you want, I can:

show a tiny console.log(allRes[0]) snippet to paste after fetch so you can copy/inspect the exact keys, or

adapt RestaurantCard props if it uses a different prop names.

But with the Body code above (safe extraction + wired input + filter), search should work reliably.

const Body = () => {
  const [searchRes, setSearchRes] = useState("");   // user input
  const [allRes, setAllRes] = useState([]);         // full list (array)
  const [filteredRes, setFilteredRes] = useState([]); // results to render
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

  return (
    <div className="body">
      {/* search box */}
      <div className="search">
        <input
          type="text"
          value={searchRes}
          placeholder="Search restaurants or cuisines..."
          onChange={(e) => setSearchRes(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch}>Search</button>
        <button
          onClick={() => {
            setSearchRes("");
            setFilteredRes(allRes);
          }}
        >
          Reset
        </button>
      </div>

      {/* results */}
      <div className="res-container">
        {Array.isArray(filteredRes) && filteredRes.length > 0 ? (
          filteredRes.map((res) => {
            // each `res` has shape: { info: { id, name, cuisines, avgRating, sla, cloudinaryImageId, ... } }
            return (
              
              <RestaurantCard
                key={res.info.id}
                resname={res.info.name}
                cuisine={res.info.cuisines.join(", ")}
                time={res.info.sla?.deliveryTime ?? res.info.sla?.slaString ?? ""}
                rating={res.info.avgRating}
                // img={`https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/${res.info.cloudinaryImageId}`}
                imageId={res.info.cloudinaryImageId}
              />
            );
          })
        ) : (
          <p style={{ padding: 20 }}>
            {Array.isArray(filteredRes)
              ? "No restaurants found."
              : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
};
instead directly accessing the img url we are passing the imgId


add 
filters should work properly 

1st Cost for 2 
2nd Discount on the image 
3 rd on hover res-card should enlarge 
4 on click it open res link 

Full css 
body{
    background-color:  black;
     color: #333;
}
.header{
    display: flex;
    background-color: rgb(255, 82, 0);
    justify-content: space-between;
    border: 2px solid rosybrown ;
}

.logo{
    width:100px ;
    border-radius: 50% ;

}

.nav-items>ul{
    font-size: 22px;
    display:flex ;
    list-style-type: none;
     cursor: pointer;
}
.nav-items >ul > li{
    padding: 10px;
    margin: 10px ;
}
/* .res-card-wrapper {
  flex: 1 1 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;   /* keeps hover area stable */

.res-card{
    width: 250px;
    height:fit-content ;
    background-color: lightgoldenrodyellow;
    padding: 5px 10px ;
    /* margin-left: 10px; */
    margin: 20px 20px ;
    box-shadow: 0 4px 10px pink;

    /* transform: scale(1);
  transition: transform 2s ease-in, transform 3s ease-out; */
  
 
   
}
.res-card:hover{
    /* width:20% ; */
    border: 2px solid rgb(130, 50, 205) ;
   transform: scale(1.02); /* slightly larger */
  transition: transform 2s ease-in-out;
  transition: transform 2s ease-in, transform 26s ease-out;
  
}

.search{
    display:flex ;
    margin: 20px;
    padding:10px  14px;
     border: 2px solid #bc8f8f;
     border-radius: 20px;
     width: 400px;
     background-color:white;
    color:white ;
    justify-content: space-between;
    
    
} 
.res-logo{
    padding:5px 7px ;
    width: 95% ;
    border: 1px solid black ;
    object-fit: cover;
}
.res-card h3{
  /* color:#bc8f8f */
  color: green;
}
.res-card h3,
.res-card h4 {
  margin: 4px 0;  /* 👈 fixes the spacing issue */
}
.res-details {
  display: block;
  justify-content: space-between;
  align-items: center;
}
/* .ratings{
    display:flex ;
    color: #267E3E;
    justify-content: right;
}
.time {
    display:flex ;
    color: #267E3E;
    justify-content: left;
} */
.ratings {
  display: flex;
  justify-content: space-between;    /*pushes time left & rating right */
  align-items: center;
  font-size: 14px;
  margin-top: 6px;
}

.time {
  /* color: #555; gray for time */
   color:  #267E3E;
}

.rating {
  font-weight: bold;
  color:  #267E3E; /* star + rating in black */
  border: 1px solid black
}
.totalRatings{
   font-weight: normal;
  color:  #267E3E;
}
.ratingBlock {
  display: flex;
  gap: 4px;
  align-items: center;
}
.res-container{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 32px; /* space so scaled cards don't overlap */
}
.filters{
     display: flex;
    -webkit-box-align: center;
    align-items: center;
    height: 44px;
    width: 80%;
    cursor: pointer;
    background-color: black;
    overflow: auto;
    scrollbar-width: none;
    padding-left: 20px;
    margin: 10px 10px ;
    border-radius: 20px ;
    justify-content: space-evenly;
   
}
.btn-fourplus,.btn-veg,.btn-5km,.btn-alcohol,.btn-sort-rating{
  background-color: #fafad2;;
   border-radius: 15px;
   height: 35px; 
    width:110px ;
    cursor: pointer;
}
.btn-alcohol{
    color: rgb(239, 79, 95);
}
.btn-fourplus{
    /* color:  rgb(239, 79, 95); */
    color: goldenrod;
}

.btn-veg{
    color:#267E3E;
}
.search-bar{
    width:70% ;
    border-radius:20px ;
}
#search-input{
    height:25px ;
    width: 90%;
    border-radius:10px ;
}
.search-icon{
    border-color: white;
    background-color: white;
     cursor: pointer;
}
.cost{
    margin: 0%;
    color:#267E3E; 
    justify-content: right;
    display: flex
;
}
.res-img-wrapper {
  position: relative;   /* ensures badge is placed on top of img */
  display: inline-block; /* keeps wrapper tight around the image */
}
.discount-badge {
  position: absolute;
  bottom: 8px;   /* distance from bottom */
  left: 8px;     /* distance from left */
  background: rgba(0, 128, 0, 0.9);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 5px 8px;
  border-radius: 4px;
  z-index: 2; /* makes sure it's above the image */
}
/* .status{
    margin: 0px 0px;
    top: 5px;
    left: 8px;
    position: absolute;
    color: rgba(0, 128, 0, 0.9);
    font-weight: 600;
} */
 .status {
  font-weight: 600;
  margin: 0px 0px;
}

.status-open {
  color: green;
}

.status-closed {
  color: red;
}

.status-soon {
  color: orange;
}
.shimmer-container{
    display:flex;
    flex-wrap:wrap ;
    gap:46px ;
}
.shimmer-card{
  width: 250px ;
  height:280px ;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  justify-content: space-evenly;
}
@keyframes shimmer{
    0%{
     background-position: -200% 0 ;
    }
    100%{
         background-position: 200% 0;
    }
}
.shimmer-image {
  width: 100%;
  height: 150px;
  background: #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.shimmer-line {
  height: 14px;
  background: #e0e0e0;
  margin: 8px 0;
  border-radius: 4px;
}

.shimmer-line.short {
  width: 60%;
}
.login{
  padding: 0px 10px;
 cursor: pointer;
 background-color: black;
 color: #e0e0e0;
 height: 30px;
 margin-top: 20px;
 border : 1px solid white;
 font-size: 20px;
}
.res-menu-details{
  color: antiquewhite;
}
.distance{
  margin:0;
}
.user-card{
  padding: 10px;
  border: 1px solid antiquewhite;
  color:white
}
.onlineStatus{
  color:#bc8f8f;
  font-size: 32px;
  justify-content: center;
  align-items: center;
  display: flex;
} 

     ResMenu 
{/* <ul>
            {menuItems.map((item,index)=>(
                <li key={`${item.card.info.id}-${index}`}>
                   <h4>{item.card.info.name}</h4>
                   <h3>{item.card.info.category}</h3>
                   <p>{item.card.info.description}</p>
                   <p>Price: ₹{(item.card.info.price || item.card.info.defaultPrice) /100}</p>
                   {item.card.info.imageId&&(
                    <img 
                    // src={`https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_208,h_208,c_fit/${item.card.info.imageId}`}
                     src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${item.card.info.imageId}`}
                    alt={item.card.info.name} 
                    width={150}
                    />
                   )}
                </li>
            ))}
         </ul> */}


         //fetch requests for Res Menu that are being getting rejected 

         // app.get("/api/restaurants/:resID", async (req, res) => {
//   const { resID } = req.params;

//   const swiggyUrl =
//     "https://www.swiggy.com/dapi/menu/pl" +
//     "?page-type=REGULAR_MENU&complete-menu=true" +
//     "&lat=28.6139&lng=77.2090" +
//     `&restaurantId=${encodeURIComponent(resID)}` +
//     "&submitAction=ENTER";

//   try {
//     const headers = {
//       // Look like a real browser
//       "User-Agent":
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
//       "Accept": "application/json, text/plain, */*",
//       "Accept-Language": "en-US,en;q=0.9",
//       // these help some CDNs decide it's a legit CORS/XHR
//       "Referer": "https://www.swiggy.com/",
//       "Origin": "https://www.swiggy.com",
//       // Optional: compression is fine; Node will decompress
//       "Accept-Encoding": "gzip, deflate, br",
//       // Do NOT send a body; this is a GET
//     };

//     const resp = await fetch(swiggyUrl, { method: "GET", headers });

//     const ctype = resp.headers.get("content-type") || "";
//     const text = await resp.text(); // read once

//     // Helpful debug output so you can see what's happening
//     console.log("[Swiggy] status:", resp.status, resp.statusText);
//     console.log("[Swiggy] content-type:", ctype);
//     console.log("[Swiggy] first 200 chars:", text.slice(0, 200));

//     if (!resp.ok) {
//       // If Swiggy responded with HTML (error page), forward a clean JSON error
//       return res
//         .status(resp.status)
//         .json({ error: "Upstream error", status: resp.status, hint: text.slice(0, 200) });
//     }

//     // If it’s JSON, parse from the text we already read
//     if (ctype.includes("application/json")) {
//       return res.json(JSON.parse(text));
//     }

//     // Some CDNs return JSON but forget the header — try to parse anyway
//     try {
//       return res.json(JSON.parse(text));
//     } catch {
//       // It was HTML or something else
//       return res.status(502).json({ error: "Unexpected upstream format", hint: text.slice(0, 200) });
//     }
//   } catch (err) {
//     console.error("Proxy error:", err);
//     return res.status(500).json({ error: "Proxy failed", details: String(err) });
//   }
// });

// app.get("/api/restaurants/:resID", async(req,res)=>{
//     const {resID}=req.params ;
//      console.log("Received request for restaurant ID in server.js :", resID);
//     const url=`https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=28.6139&lng=77.2090&restaurantId=${resID}&submitAction=ENTER`
//     // const url=`https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=28.6139&lng=77.2090&restaurantId=16865&submitAction=ENTER`
     
//     try{
//        console.log("Fetching Swiggy data for ID:", resID);
//   console.log("Request URL:", url);
//       const response= await fetch(url,{
//         headers: {
//   "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
//   "Accept": "application/json, text/plain, */*",
//   "Accept-Language": "en-US,en;q=0.9",
//   "Referer": "https://www.swiggy.com/",
//   "Origin": "https://www.swiggy.com",
//   "Cookie": "_device_id=abc123; _session_id=xyz456; _ga=GA1.2.123456789.987654321;",
//   "sec-ch-ua": '"Chromium";v="123", "Not:A-Brand";v="8"',
//   "sec-ch-ua-platform": '"macOS"',
//   "sec-fetch-mode": "cors",
//   "sec-fetch-site": "same-site"
//       },
//     }) ;
//      console.log("Swiggy response status:", response.status);
//      if (!response.ok) {
//       const text = await response.text(); // ✅ define `text` first
//       console.error("Swiggy API failed:", response.status, response.statusText);
//       console.log("Response body:", text.slice(0, 200)); // just first 200 chars for debugging
//       return res.status(response.status).json({ error: "Swiggy API error" });
//     }
//       const data=await response.json() ;
//       res.json(data) ;
//     }
//     catch(err){
//        console.error('Error fetching Restaurant Menu',err) ;
//        res.status(500).json({ error: "Failed to fetch restaurant data"}) ;
//     }
// });