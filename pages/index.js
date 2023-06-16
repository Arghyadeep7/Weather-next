import { useState, useEffect } from "react";

export const getServerSideProps = async() =>{

  const locationKey = process.env.LOCATION_KEY;

  const key = process.env.API_KEY;

  const location = await fetch("https://api.ipregistry.co/?key="+locationKey).then(response => response.json());

  const {latitude, longitude} = location.location;

  const response = await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude
                                + "&appid=" + key + "&units=metric").then(res=>res.json());

  return {
    props: {
      data: response,
      apiKey: key
    }
  }
}


const index = (props) => {

  const key = props.apiKey;

  const [data, setData] = useState(props.data);

  const [place, setPlace] = useState(props.data.name);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [count, setCount] = useState(0);

  const ctof = (temp) => {
    return ((temp * 9/5) + 32).toFixed(2);
  };

  const ftoc = (temp) => {
    return ((temp - 32) * 5/9).toFixed(2);
  }

  const tempHandler = () =>{
    const c = count + 1;
    if(c%2){
      const temp = ctof(data.main.temp);
      const feels_like = ctof(data.main.feels_like);
      const temp_min = ctof(data.main.temp_min);
      const temp_max = ctof(data.main.temp_max);
      
      const newData = data;

      newData.main.temp = temp;
      newData.main.feels_like = feels_like;
      newData.main.temp_min = temp_min;
      newData.main.temp_max = temp_max;

      setData(newData);
    }else{
      const temp = ftoc(data.main.temp);
      const feels_like = ftoc(data.main.feels_like);
      const temp_min = ftoc(data.main.temp_min);
      const temp_max = ftoc(data.main.temp_max);
      
      const newData = data;

      newData.main.temp = temp;
      newData.main.feels_like = feels_like;
      newData.main.temp_min = temp_min;
      newData.main.temp_max = temp_max;

      setData(newData);
    }

    setCount(count + 1);
  }


  const submitHandler = async (event) => {

    event.preventDefault();

    const city = event.target.city.value;

    if(place && place.toUpperCase() === city.toUpperCase()){
      return;
    }
  
    setData(null);
    setError(false);
    setLoading(true);

    const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q=" 
                                  + city + "&appid=" + key + "&units=metric").then(res=>res.json());

    if(response.cod === 200){
      setPlace(city);
      setData(response)
    }else{
      setError(true);
    }

    setLoading(false);

  }

  return (
    
    <div className="container mt-4 mb-5">
      <h1 className="text-center">Weather App</h1>
      <div className="row">
          <div className="col-sm-4 col-md-5 mt-4 text-center">

            <form onSubmit={submitHandler}>
              <label htmlFor="city" className="form-label">
                <h5>Enter Location:</h5>
              </label>
              <input type="text" id="city" 
              className="form-control" placeholder="Enter City/State..." 
              required disabled={loading} style={{border: error?"2px solid red":""}} 
              onChange={(()=>{setError(false)})}/>

              {error &&
                <div style={{color:"red"}} className="mt-3">Please enter a valid/existing location!</div>
              }

              {!error && !loading &&
                <button className="btn btn-outline-primary mt-3" type="submit">
                Check Weather
                </button>
              }
              {loading && 
                <div className="mt-3">
                  <div className="spinner-grow text-primary" role="status" />&nbsp;&nbsp;
                  <div className="spinner-grow text-primary" role="status" />&nbsp;&nbsp;
                  <div className="spinner-grow text-primary" role="status" />
                </div>
              }
            </form>

          </div>
        <div className="col-sm-1" />
        <div className="col-sm-7 col-md-6 mt-4">
          {
            data &&
            <div style={{border: "2px solid black", padding:"15px"}}>

              <div className="d-flex justify-content-between">
                <div><b>Place: </b>{data.name}</div>
                <div><b>Country: </b>{data.sys.country}</div>
              </div>

              <hr />

              <b>Coordinates:</b>
              <div className="d-flex justify-content-between">
                <div>Longitude: {data.coord.lon}</div>
                <div>Latitude: {data.coord.lat}</div>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <b>Weather:</b>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" onClick={tempHandler} />
                  <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Show in <i>{count%2?"C":"F"}</i></label>
                </div>
              </div>

              <div className="text-center">
                <img src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`} style={{width: "70px", height:"70px", marginTop:"0"}}/>
                <b>Temperature: {data.main.temp} <i>{count%2?"F":"C"}</i></b>
              </div>

              <div className="d-flex justify-content-between">
                <div>Feels Like: {data.main.feels_like} <i>{count%2?"F":"C"}</i></div>
                <div>Description: {data.weather[0].main}</div>
              </div>
              
              <div className="d-flex justify-content-between">
                <div>Min Temp: {data.main.temp_min} <i>{count%2?"F":"C"}</i></div>
                <div>Max Temp: {data.main.temp_max} <i>{count%2?"F":"C"}</i></div>
              </div>

              <div className="d-flex justify-content-between">
                <div>Pressure: {data.main.pressure} <i>Pa</i></div>
                <div>Humidity: {data.main.humidity} <i>gm/Kg</i></div>
              </div>
              
              <hr />

              <b>Wind:</b>
              <div className="d-flex justify-content-between">
                <div>Speed: {data.wind.speed} <i>Km/hr</i></div>
                <div>Degrees: {data.wind.deg} </div>
              </div>

            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default index