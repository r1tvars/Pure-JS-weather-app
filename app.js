function getRealDay(date){
    const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const today = new Date();
    const dataDay = new Date(date * 1000);
    const thisDay = today.getDay();
    if(thisDay === dataDay.getDay()){
        return "Today";
    }
    return weekday[dataDay.getDay()];
}

// Create HMTL with recieved weather data
const dataRetrieved = (data) => {
    let output = '';
    data.forEach(element => {
        output += `<div class="item">
                        <div>
                            <img src="http://openweathermap.org/img/wn/${element.weather[0].icon}@4x.png"/>
                            <p>${element.weather[0].description}</p>
                        </div>
                        <div>
                            <p>${Math.round(element.temp)}°C</p>
                            <p>${getRealDay(element.dt)}</p>
                        </div>
                        <div>
                            <p>${element.info[0]}</p>
                            <p>${element.info[1]}</p>
                        </div>
                    </div>`;
    });
    document.getElementById('wrap').innerHTML += output;
}

// Select what data we need
function dataPick(current, forecast){
    const data = [];
    const allData = current.concat(forecast);
    allData.forEach(element => {
        let info, temp = 0;
        if(typeof element.temp === 'object'){
            info = [`Max: ${Math.round(element.temp.max)}°C`, `Min: ${Math.round(element.temp.min)}°C`];
            temp = element.temp.day;
        }else{
            info = [`Wind: ${element.wind_speed.toFixed(1)}m/s`, `UV: ${Math.round(element.uvi)}`];
            temp = element.temp;
        }
        data.push({
            'dt' : element.dt,
            'temp' : temp,
            'info' : info, 
            'weather' : element.weather
        });
    });
    return data;
}

function getData() {
    const lat = '59.911491';
    const lon = '10.757933';
    const exclude = 'minutely,hourly,alerts';
    const units = 'metric';
    const apiKey = 'API_KEY' // get your key at openweathermap.org, its Free

    // Check if Cookie exists with weather data if not fetch data and set it to Cookie for 30 min
    if(document.cookie.match(/^(.*;)?\s*weatherData\s*=\s*[^;]+(.*)?$/) === null){
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}lon=${lon}&exclude=${exclude}&units=${units}&appid=${apiKey}`)
        .then((result) => result.json()).then((data) => {
            data.daily.shift(); // don't need todays forecast
            data.daily.pop(); // don't need that much forecast
            const pickedData = dataPick([data.current], data.daily);
            let expiry = new Date();
            expiry.setTime(expiry.getTime() + (30 * 60000)); // 30 min
            document.cookie = `weatherData=${JSON.stringify(pickedData)};expires=${expiry.toUTCString()};`; // set cookie
            dataRetrieved(pickedData); // create html
            console.log('api called');
        });
    }else{
        let storedData = (document.cookie.match(/^(?:.*;)?\s*weatherData\s*=\s*([^;]+)(?:.*)?$/) || [,null])[1]; //get cookie
        storedData = JSON.parse(storedData);
        dataRetrieved(storedData); // create html
        console.log('cookie called');
    }
}

getData(); // Call for data