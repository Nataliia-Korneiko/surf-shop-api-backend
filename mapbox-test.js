const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const { MAPBOX_ACCESS_TOKEN } = process.env;
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_ACCESS_TOKEN });

const geocoder = async (location) => {
  try {
    const response = await geocodingClient
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    console.log(response.body.features[0].geometry.coordinates); // [ -153.180996665583, 64.6358675746 ]
  } catch (err) {
    console.log(err.message);
  }
};

geocoder('Alaska, US');
