import axios from 'axios';

export default ({ req }) => {
    if (typeof window === 'undefined') {

        return axios.create({
            baseURL: 'http://www.andys-microservice-app.space',
            headers: req.headers
        });

    } else {
        return axios.create({
            baseURL: '/'
        });
    }
};