import axios from "axios";

const setAuthToken=(token)=>{
    if(token){
        console.log("Storing token:", token);
        axios.defaults.headers.common['Authorization']=`Bearer ${token}`;
        localStorage.setItem('adminToken',token);
    }
    else{
        console.log("Removing token");
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('adminToken');
    }
};

export default setAuthToken;