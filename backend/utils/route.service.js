const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const ORS_KEY = process.env.ORS_KEY;

async function getRoute(from, to) {
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const body = {
    coordinates: [
      [from.lng, from.lat],
      [to.lng, to.lat]
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": ORS_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return data.features[0].geometry.coordinates;
}

module.exports = getRoute;
