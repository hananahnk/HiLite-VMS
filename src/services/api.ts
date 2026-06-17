import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Matches your JSON server port
});

export default api;