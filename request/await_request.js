const request = require('request')

export default async (value) => 
    new Promise((resolve, reject) => {
        request(value, (error, response, data) => {
            if(error) reject(error)
            else resolve(data)
        })
})