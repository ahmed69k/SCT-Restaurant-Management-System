import axios from "axios";

const userAPI = axios.create({
    baseURL: import.meta.env.USER_BACKEND_LINK + "api/v1",
    withCredentials: true
})