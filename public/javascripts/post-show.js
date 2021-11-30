mapboxgl.accessToken =
  'pk.eyJ1IjoibmF0YWxpaWEta29ybmVpa28iLCJhIjoiY2t3a2wyZThjMWEwNzJwcGtnYXhyYmpqcCJ9.e_F2UFAugtWzamc5rPbckg'; // Default Mapbox public token

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: post.coordinates,
  zoom: 5,
});

// Add markers to map
const el = document.createElement('div'); // Create a HTML element for our post location/marker
el.className = 'marker';

// Make a marker for our location and add to the map
new mapboxgl.Marker(el)
  .setLngLat(post.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }) // Add popups
      .setHTML('<h3>' + post.title + '</h3><p>' + post.location + '</p>')
  )
  .addTo(map);
