import { Link } from "react-router";

const RestaurantCard=(props)=>{
     const { resname, cuisine, time, rating, imageId,discount,location,availability,id,lastMileTravel,totalRatingsString} = props;

     console.log("Distance:", lastMileTravel);
     let statusText="" ;
     let statusClass="" ;

     if(availability){
        const isOpen=availability.opened ;
        const nextCloseTime=availability.nextCloseTime;
     

     if(!isOpen){
        statusText="Closed" ;
        statusClass="status-closed";
     }
     else{
        //if opened 
        const closeDate= new Date(nextCloseTime);
        const now= new Date(); 
        
        if(closeDate-now<=30*60*1000){
            statusText="Closes Soon";
            statusClass="status-soon" ;
        }
        else{
            statusText="Open Now" ;
            statusClass="status-open" ;
        }
     }
    }
     return (
        console.log("Restaurant id in card:", id),
  <Link  to={`/restaurants/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <div className="res-card m-4 p-4 bg-amber-100 w-[350px]">
        <div  className="res-img-wrapper">
            
      <img
        className="res-logo"
        alt={props.resname}
        src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${props.imageId}`}
      />
      
      {props.discount && <span className="discount-badge">{props.discount}</span>}
      
        </div>
      <div className="res-details">
        <h3>{props.resname}</h3>
        <h4>{props.cuisine}</h4>
        <div className="ratings">
          <span className="time">Delivers in {props.time} </span>
          <span className="ratingBlock">
             <span className="rating">{props.rating} ★</span>
             <span className="totalRatings"> ({totalRatingsString})</span>
          </span>
        </div>
        {/* Location */}
        <p className="location">{props.location}</p>
        {lastMileTravel && <p className="distance">{lastMileTravel} 🛵</p>}
         {/* Cost for Two */}
        <p className="cost">{props.cost}</p>
        <p className={`status ${statusClass}`}>{statusText}</p>
      </div>
    </div>
    </Link>
  );
}
//Higher Order Component for Res With Promoted Label 
export const withPromotedLabel=(RestaurantCard)=>{
      return (props)=>{
        const isPromoted=props.resData?.info?.adTrackingId ||
        props.resData?.info?.differentiatedUi?.displayType?.includes('ADS');
        return (
          <div>
          { isPromoted && <span>Promoted</span>}
            <RestaurantCard {...props}/>
          </div>
        )
      }
}
export default RestaurantCard;