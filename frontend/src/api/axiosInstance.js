import axios from "axios";

const instance = axios.create({
    baseURL: "https://chat-app-dxnu.onrender.com/", // or hardcode if needed
});

export default instance;
