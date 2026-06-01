import { ApiResponse } from "../utils/api-response.js"

const healthcheck= (req, res) => {
    try{
        res.status(200).json(new ApiResponse(200, "Server is healthy", null))//this json will sent all the repsonse method as json
    } catch (error) {}
}

export { healthcheck }
