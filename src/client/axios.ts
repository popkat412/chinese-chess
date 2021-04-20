import axiosStatic from "axios";

export default axiosStatic.create({
  // TODO: Change to use __SERVER_URL__
  baseURL: `http://localhost:3000/api/`,
});
