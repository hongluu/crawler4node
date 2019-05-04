const first = new Promise((resolve, reject) => {
    resolve("1")
    
})
const second = new Promise((resolve, reject) => {
    resolve("test")
})

Promise.race([first, second]).then(result => {
    console.log(result) // second
})