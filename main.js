// Import CSS styles
import './style.css';

// Base URL for the BART API
const API_BASE_URL = 'https://bart.trentwil.es/api/v1';

// Mapping of station names to abbreviations
const stationMap = {
  "12th St. Oakland City Center": "12th",
  "16th St. Mission (SF)": "16th",
  "19th St. Oakland": "19th",
  "24th St. Mission (SF)": "24th",
  "Ashby (Berkeley)": "ashb",
  "Antioch": "antc",
  "Balboa Park (SF)": "balb",
  "Bay Fair (San Leandro)": "bayf",
  "Berryessa / North San Jose": "bery",
  "Castro Valley": "cast",
  "Civic Center (SF)": "civc",
  "Coliseum": "cols",
  "Colma": "colm",
  "Concord": "conc",
  "Daly City": "daly",
  "Downtown Berkeley": "dbrk",
  "Dublin/Pleasanton": "dubl",
  "El Cerrito del Norte": "deln",
  "El Cerrito Plaza": "plza",
  "Embarcadero (SF)": "embr",
  "Fremont": "frmt",
  "Fruitvale (Oakland)": "ftvl",
  "Glen Park (SF)": "glen",
  "Hayward": "hayw",
  "Lafayette": "lafy",
  "Lake Merritt (Oakland)": "lake",
  "MacArthur (Oakland)": "mcar",
  "Millbrae": "mlbr",
  "Milpitas": "mlpt",
  "Montgomery St. (SF)": "mont",
  "North Berkeley": "nbrk",
  "North Concord/Martinez": "ncon",
  "Oakland Int'l Airport": "oakl",
  "Orinda": "orin",
  "Pittsburg/Bay Point": "pitt",
  "Pittsburg Center": "pctr",
  "Pleasant Hill": "phil",
  "Powell St. (SF)": "powl",
  "Richmond": "rich",
  "Rockridge (Oakland)": "rock",
  "San Bruno": "sbrn",
  "San Francisco Int'l Airport": "sfia",
  "San Leandro": "sanl",
  "South Hayward": "shay",
  "South San Francisco": "ssan",
  "Union City": "ucty",
  "Warm Springs/South Fremont": "warm",
  "Walnut Creek": "wcrk",
  "West Dublin": "wdub",
  "West Oakland": "woak"
};

// Reverse mapping from abbreviations to station names
const reverseStationMap = Object.fromEntries(
  Object.entries(stationMap).map(([name, abbr]) => [abbr, name])
);

// Handles user login by switching to the schedule form
window.login = function() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('schedule-form').classList.remove('hidden');
};

// Fetches and displays schedule and alerts based on user input
window.getSchedule = async function() {
  // Retrieve user input values
  const pickUpStationName = document.getElementById('pickUp').value.trim().toLowerCase();
  const dropOffStationName = document.getElementById('dropOff').value.trim().toLowerCase();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  // Validate input
  if (!pickUpStationName || !dropOffStationName || !date || !time) {
    alert('Please enter pick-up and drop-off stations, date, and time');
    return;
  }

  // Convert full station names to abbreviations
  const pickUpStation = Object.keys(stationMap).find(key => key.toLowerCase() === pickUpStationName);
  const dropOffStation = Object.keys(stationMap).find(key => key.toLowerCase() === dropOffStationName);

  // Get abbreviations from names
  const pickUpStationAbbr = pickUpStation ? stationMap[pickUpStation] : null;
  const dropOffStationAbbr = dropOffStation ? stationMap[dropOffStation] : null;

  // Log the pick-up and drop-off station details
  console.log(`Pick-Up Station: ${pickUpStation} (${pickUpStationAbbr})`);
  console.log(`Drop-Off Station: ${dropOffStation} (${dropOffStationAbbr})`);

  // Validate station abbreviations
  if (!pickUpStationAbbr || !dropOffStationAbbr) {
    alert('Invalid station names');
    return;
  }

  try {
    // Fetch predictions for pick-up station
    console.log(`Fetching predictions for station: ${pickUpStationAbbr}`);
    const predictionsResponse = await fetch(`${API_BASE_URL}/getPredictions/${pickUpStationAbbr}`);

    if (!predictionsResponse.ok) {
      throw new Error(`HTTP error! Status: ${predictionsResponse.status} - ${predictionsResponse.statusText}`);
    }

    const predictionsData = await predictionsResponse.json();
    console.log('Predictions data:', predictionsData);

    if (predictionsData.error) {
      alert(predictionsData.message);
      return;
    }

    // Display predictions
    const predictionsDiv = document.getElementById('predictions');
    predictionsDiv.innerHTML = '';

    predictionsData.estimates.forEach(estimate => {
      const section = document.createElement('div');
      section.innerHTML = `<h2>${estimate.lineTerminus}</h2>`;

      const list = document.createElement('ul');
      estimate.estimates.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.formatted} - ${item.timeFormatted}`;
        list.appendChild(listItem);
      });

      const button = document.createElement('button');
      button.textContent = 'Buy Ticket';
      button.onclick = () => alert('Ticket purchase feature is not implemented yet.');

      section.appendChild(list);
      section.appendChild(button);
      predictionsDiv.appendChild(section);
    });

    // Fetch and display alerts
    console.log('Fetching alerts from API');
    const alertsResponse = await fetch(`${API_BASE_URL}/getAlerts`);

    if (!alertsResponse.ok) {
      throw new Error(`HTTP error! Status: ${alertsResponse.status} - ${alertsResponse.statusText}`);
    }

    const alertsData = await alertsResponse.json();
    console.log('Alerts data:', alertsData);

    const alertsDiv = document.getElementById('alerts');
    alertsDiv.innerHTML = '<h2>Alerts</h2>';

    // Display current alerts
    if (alertsData.currentAlerts.length > 0) {
      alertsData.currentAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.textContent = alert;
        alertsDiv.appendChild(alertItem);
      });
    } else {
      alertsDiv.innerHTML += '<p>No current alerts.</p>';
    }

    // Display planned alerts
    if (alertsData.plannedAlerts.length > 0) {
      const plannedAlertsDiv = document.createElement('div');
      plannedAlertsDiv.innerHTML = '<h2>Planned Alerts</h2>';
      alertsData.plannedAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.innerHTML = `<p>${alert.message} <a href="${alert.url}" target="_blank">More Info</a></p>`;
        plannedAlertsDiv.appendChild(alertItem);
      });
      alertsDiv.appendChild(plannedAlertsDiv);
    } else {
      alertsDiv.innerHTML += '<p>No planned alerts.</p>';
    }

    // Display escalator alerts
    if (alertsData.escalatorAlerts.length > 0) {
      const escalatorAlertsDiv = document.createElement('div');
      escalatorAlertsDiv.innerHTML = '<h2>Escalator Alerts</h2>';
      alertsData.escalatorAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.innerHTML = `<p>Station: ${alert.station}, Location: ${alert.location}, Reason: ${alert.reason}, Return Date: ${alert.returnDate}</p>`;
        escalatorAlertsDiv.appendChild(alertItem);
      });
      alertsDiv.appendChild(escalatorAlertsDiv);
    } else {
      alertsDiv.innerHTML += '<p>No escalator alerts.</p>';
    }

    // Display elevator alerts
    if (alertsData.elevatorAlerts.length > 0) {
      const elevatorAlertsDiv = document.createElement('div');
      elevatorAlertsDiv.innerHTML = '<h2>Elevator Alerts</h2>';
      alertsData.elevatorAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.innerHTML = `<p>Station: ${alert.station}, Location: ${alert.location}, Reason: ${alert.reason}, Return Date: ${alert.returnDate}</p>`;
        elevatorAlertsDiv.appendChild(alertItem);
      });
      alertsDiv.appendChild(elevatorAlertsDiv);
    } else {
      alertsDiv.innerHTML += '<p>No elevator alerts.</p>';
    }

  } catch (error) {
    console.error('Error fetching schedule or alerts:', error);
    alert(`Error fetching schedule or alerts: ${error.message}. Please check your API endpoint and try again.`);
  }
};

// Searches for stations based on user input and displays matching results
window.searchStation = function() {
  const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
  const searchResultsDiv = document.getElementById('searchResults');

  if (!searchInput) {
    alert('Please enter a station name');
    return;
  }

  // Find matching stations
  const matchingStations = Object.keys(stationMap).filter(stationName => 
    stationName.toLowerCase().includes(searchInput)
  );

  // Clear previous results
  searchResultsDiv.innerHTML = '';

  if (matchingStations.length > 0) {
    const resultsList = document.createElement('ul');

    matchingStations.forEach(stationName => {
      const listItem = document.createElement('li');
      listItem.textContent = `${stationName} (${stationMap[stationName]})`;
      resultsList.appendChild(listItem);
    });

    searchResultsDiv.appendChild(resultsList);
  } else {
    searchResultsDiv.innerHTML = '<p>No matching stations found.</p>';
  }
};
