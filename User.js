import {useState} from 'react' 

const User = ({name}) => {
    const [count]=useState(0) ;
    return (
       <div className="user-card"> 
       <h1>Count={count}</h1>
         <h2>{name}</h2>
         <h3>Location: Delhi</h3>
         <h4>Contact : 9999999999</h4>
       </div>
    )
}
export default User ;