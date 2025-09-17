import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.REACT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // log, toast, ou redirect login
        return Promise.reject(error)
    }
)