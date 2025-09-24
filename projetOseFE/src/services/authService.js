import axios from 'axios'


export const authService = {
    async requestPasswordChange(email) {
        return await axios.post(`http://localhost:8080/user/password-reset/request?email=${email}`, email)
    },

    async resetPasswordChange (token, newPassword) {
        return await axios.post(`http://localhost:8080/user/password-reset/confirm`, {
            token,
            newPassword,
        });
    },

    async getMe(token) {
        const res = await axios.get(`http://localhost:8080/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    },
}
