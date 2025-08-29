import axios from "axios";

const instance = axios.create({
    // baseURL: "https://chat-app-dxnu.onrender.com/", // "http://localhost:5500"
    baseURL: "http://localhost:5500"
});

export default instance;
