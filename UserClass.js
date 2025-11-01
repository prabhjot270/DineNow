import React from "react"
class UserClass extends React.Component{

    constructor(props){
        super(props);

        // console.log(props);
        this.state={
            userInfo:{
                name:'Username',
                location:'default',
               
            }
        }
    }

    async componentDidMount(){
        //github api call 

        const data= await fetch('https://api.github.com/users/prabhjot270')
        const json= await data.json();

        console.log(json);

        this.setState({
            userInfo: json
        })
    }
    render(){
        const {name,location,avatar_url}=this.state.userInfo;
      
         return (
       <div className="user-card"> 
       <img src={avatar_url}></img>
         <h2>Name:{name}</h2>
         <h3>Location:{location }</h3>
         <h4>Contact : 9999999999</h4>
       </div>
    )
    }
}
export default UserClass
