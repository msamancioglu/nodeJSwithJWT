var express = require('express')
var router = express.Router()



// swagger api doc
router.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerJsdoc({
        definition: {
            openapi: "3.0.0",
            info: {
                title: "ExpressJS API documentation with Swagger",
                version: "0.1.0",
                description: "This is a simple CRUD API application made with Express and documented with Swagger",
                license: {
                    name: "MIT",
                    url: "https://spdx.org/licenses/MIT.html",
                },
                contact: {
                    name: "LogRocket",
                    url: "https://logrocket.com",
                    email: "info@email.com",
                },
            },
            servers: [{
                url: "http://localhost:3000/blogs",
            }, ],
        },
        apis: ["./blogsRouter.js"],
    }))
);

router.get('/', function (req, res) {
  res.send('Blogs list')
})

module.exports = router