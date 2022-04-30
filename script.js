// global variables:
const buttonIP = document.querySelector('#Geo-IP');
const target = document.querySelector('.target');
const search = document.querySelector('.srch-btn');
const locationButton = document.querySelector('#location');
const input = document.getElementById('input');
const list = document.getElementById('list');
const ul = document.querySelector('ul');
const theme = document.querySelector('#theme');
const body = document.querySelector('body');
const container = document.querySelector('.container');

// APIs
const weatherURL = `http://api.openweathermap.org/data/2.5/weather?units=metric&`;
const urlGeo = `https://api.ipregistry.co/?${keys.geoKey}`;
const positionURL = `http://api.positionstack.com/v1/reverse?${keys.positionKey}&limit=1&query=`;


// get compass direction
const degToDirection = (num) => {
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

// get user location using geolocation
locationButton.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
})

const showError = (error) => {
    target.classList.add('htmlFalse')
    console.log(error.message);
    switch (error.code) {
        case error.PERMISSION_DENIED:
            target.innerHTML = "<h3>Please allow location access</h3>"
            break;
        case error.POSITION_UNAVAILABLE:
            target.innerHTML = "<h3>Location information is unavailable</h3>"
            break;
        case error.TIMEOUT:
            target.innerHTML = "<h3>The request to get user location timed out</h3>"
            break;
        case error.UNKNOWN_ERROR:
            target.innerHTML = "<h3>An unknown error occurred</h3>"
            break;
    }
}

const showPosition = (position) => {
    target.innerHTML = `<img id="loading" src="Imgs/loading.png">`
    setTimeout(() => {
        console.log(position)
        const url = positionURL + position.coords.latitude + ',' + position.coords.longitude
        fetch(url).then((data) => data.json())
            .then((data) => {
                console.log(data);
                const city = data.data[0].county;
                const country = data.data[0].country;
                passData(position, city, country)
            })
            .catch((error) => reqError(error))
    }, 100)
}

// get user location using IP address
const GetIPData = () => {
    target.innerHTML = `<img id="loading" src="Imgs/loading.png">`
    setTimeout(() => {
        fetch(urlGeo)
            .then((data) => data.json())
            .then((data) => {
                console.log(data);
                const city = data.location.city;
                const country = data.location.country.name;
                passData(data, city, country)
            })
            .catch((error) => reqError(error))
    }, 200)
}
buttonIP.addEventListener('click', GetIPData)

// get user location using user input
search.addEventListener('click', () => {
    target.innerHTML = `<img id="loading" src="Imgs/loading.png">`
    setTimeout(() => {
        const city = input.value;
        const url = weatherURL + 'q=' + city + keys.weatherKey
        fetch(url).then((wethD) => wethD.json())
            .then((wethD) => {
                console.log(wethD);
                const country = wethD.sys.country;
                update(wethD, city, country)
            })
            .catch((error) => {
                console.log(error.message);
                if (error.message === 'Failed to fetch') {
                    target.innerHTML = `<h3>Please check your connection and try again</h3>`
                    target.classList.add('htmlFalse')
                } else {
                    target.innerHTML = `<h3>Please enter a correct city name</h3>`
                    target.classList.add('htmlFalse')
                }
            })
        input.value = ''
        list.classList.add('none')
    }, 100)
});

// use location to get weather data
const passData = (data, city, country) => {
    if (data.location) {
        const url = weatherURL + 'q=' + city + keys.weatherKey
        fetch(url).then((wethD) => wethD.json())
            .then((wethD) => {
                console.log(wethD);
                update(wethD, city, country)
            })
            .catch((error) => reqError(error))
    }
    else {
        const url = weatherURL + 'lat=' + data.coords.latitude + '&lon=' + data.coords.longitude + keys.weatherKey
        fetch(url).then((wethD) => wethD.json())
            .then((wethD) => {
                console.log(wethD);
                update(wethD, city, country)
            })
            .catch((error) => reqError(error))
    }
};

// update UI
const update = (wethD, city, country) => {
    const html = `
    <div class="geo"><h4 class="location">${city}, ${country} <img class="flag" alt="flag" src='https://flagcdn.com/h20/${wethD.sys.country.toLowerCase()}.png'></h4></div>
    <div class="temp"><span class="deg"><h1>${Math.round(wethD.main.temp)}</h1></span><span class="unit"><h2>°c</h2></span></div>
    <img class="wethIcon" alt="weatherIcon" src="http://openweathermap.org/img/wn/${wethD.weather[0].icon}@2x.png">
    <h3 class="descreption">${wethD.weather[0].description}</h3>
    <h4 class="feeling">feels like:${wethD.main.feels_like}°</h4>
    <h4 class="humidity">humidity:${wethD.main.humidity}%</h4>
    <h4 class="visibility">visibility:${(wethD.visibility) / 1000}km</h4>
    <h4 class="wind">wind speed:${Math.round((wethD.wind.speed) * (18 / 5))}km/h ${degToDirection(wethD.wind.deg)}</h4>
    `
    // <h4 class="pressure">pressure:${wethD.main.pressure}mb</h4>
    target.innerHTML = html;
    target.classList.remove('htmlFalse')
};

const reqError = (error) => {
    target.innerHTML = `<h3>Someting went wrong, please check your connection or try again later</h3>`
    target.classList.add('htmlFalse')
    console.log(error);
}

document.addEventListener('DOMContentLoaded', GetIPData)


// check user theme and apply it
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.remove('light')
    body.classList.add('dark')
    container.classList.remove('light')
    container.classList.add('dark')
} else {
    body.classList.add('light')
    body.classList.remove('dark')
    container.classList.add('light')
    container.classList.remove('dark')
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        body.classList.replace('light', 'dark')
        container.classList.replace('light', 'dark')
    } else {
        body.classList.replace('dark', 'light')
        container.classList.replace('dark', 'light')
    }
})

// theme icon
theme.addEventListener('click', () => {
    body.classList.toggle('light')
    body.classList.toggle('dark')
    container.classList.toggle('light')
    container.classList.toggle('dark')
    theme.classList.toggle('rotate')
})
