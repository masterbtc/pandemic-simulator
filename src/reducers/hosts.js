import { default as Hosts } from './../data/hosts';


import {
  hosts,
} from '../actions/action-types';


const sphereKnn = require("sphere-knn");
const lookup = sphereKnn(Hosts.map(host => [host.lat, host.lng]));


function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}


const coordinatesIndex = {};
Hosts.map(({ lat, lng }, index) => {
  coordinatesIndex[lat] = coordinatesIndex[lat] === undefined ? {} : coordinatesIndex[lat];
  coordinatesIndex[lat][lng] = index;
});


console.log(coordinatesIndex);


const initializeHostsState = () => {
  return Hosts.map(host => ({ ...host, status: 0 }));
};


const hostsReducer = (state = [], action) => {
  let newState;
  
  switch (action.type) {
    case (hosts.INITIALIZE):
      return initializeHostsState();
    case (hosts.EXPOSE):
      newState = [...state];
      
      action.ids.map(id => newState[id].status = 1);
      
      return newState;
    case (hosts.EXPOSE_INFECT_SUSCEPTIBLE):
      newState = [...state];

      // Choose all exposed
      const exposed = state.filter(({ status }) => status === 1);
      
      // Draw circle around exposed and
      exposed.forEach(e => {
        const contacts = getRandomArbitrary(1, action.averageHostContacts);
        const neighbours = lookup(e.lat, e.lng, contacts);
        const neighbooursIds = neighbours.map(([ lat, lng ]) => coordinatesIndex[lat][lng]);
        
        neighbooursIds.map(id => newState[id].status = 1);
      });

      
      return newState;
    default:
      return state;
  }
};


export default hostsReducer;
