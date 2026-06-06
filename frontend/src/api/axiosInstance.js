import axios from "axios";

const instance = axios.create({
    baseURL: "https://chat-app-dxnu.onrender.com/",
    // baseURL: "http://localhost:5100",
});

// Add Authorization token to every request
instance.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
