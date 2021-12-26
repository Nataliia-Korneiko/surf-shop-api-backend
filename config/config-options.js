const options = {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'base-uri': ["'self'"],
      'font-src': ["'self'", 'https:', 'data:'],
      'frame-ancestors': ["'self'"],
      'img-src': ["'self'", 'data:', 'http://res.cloudinary.com'],
      'script-src': [
        "'unsafe-inline'",
        'http://localhost:8080/javascripts/post-index.js',
        'http://localhost:8080/javascripts/post-show.js',
        'http://localhost:8080/javascripts/post-edit.js',
        'http://localhost:8080/javascripts/posts-cluster-map.js',
        'http://localhost:8080/javascripts/profile.js',
        'http://localhost:8080/javascripts/use-my-location.js',
        'http://localhost:8080/wrapkit/js/custom.min.js',
        'https://api.tiles.mapbox.com/mapbox-gl-js/v2.6.0/mapbox-gl.js',
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.min.js',
        'https://code.jquery.com/jquery-3.3.1.slim.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
        'https://kit.fontawesome.com/31b7e7d514.js',
        'https://fontawesome.com',
      ],
      'script-src-attr': ["'none'"],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      'worker-src': ['blob:'],
      'connect-src': ['https://api.mapbox.com', 'https://events.mapbox.com'],
    },
  },
};

module.exports = options;
