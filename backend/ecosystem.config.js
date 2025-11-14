module.exports = {
    apps: [
        {
            name: "user-service",
            script: './user-service/user-server.js',
            watch: ['./user-service/']
        }
    ]
}