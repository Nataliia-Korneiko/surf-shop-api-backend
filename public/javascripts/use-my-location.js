function geoFindMe(e) {
  e.preventDefault();

  const status = document.querySelector('#status');
  const locationInput = document.querySelector('#location');

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // status.textContent = '';
    status.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
    locationInput.value = `[${latitude}, ${longitude}]`;
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported in your browser';
  } else {
    status.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

document.querySelector('#find-me').addEventListener('click', geoFindMe);
