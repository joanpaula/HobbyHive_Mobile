import axios from "axios";

type DataType = "form-data" | "json";

const createApiClient = (dataType: DataType = "form-data") => {
  const instance = axios.create({
    // home
    baseURL: "http://10.178.12.65:5000",

    timeout: 1000,
    headers: {
      "Content-Type": `${
        dataType === "json" ? "application/json" : "multipart/form-data"
      }`,
      Accept: "application/json",
      //   Authorization: `Bearer ${token}`,
    },
  });

  return {
    get: async (url: string) => {
      try {
        const res = await instance.get(url);
        console.log(res);
        if (res.status) {
          return successResponse(res.data);
        } else {
          console.log(res);
          return errorResponse(res.data);
        }
      } catch (error) {
        console.log("error: ", error);
        return errorResponse(error || null);
      }
    },
    post: async (url: string, data: any) => {
      try {
        const res = await instance.post(url, data);
        console.log(res);
        if (res.status) {
          return successResponse(res.data);
        } else {
          console.log(res);
          return errorResponse(res.data);
        }
      } catch (error) {
        console.log("error", error);
        return errorResponse(error || null);
      }
    },
    put: async (url: string, data: any) => {
      try {
        const res = await instance.put(url, data);
        console.log(res);
        if (res.status) {
          return successResponse(res.data);
        } else {
          console.log(res);
          return errorResponse(res.data);
        }
      } catch (error) {
        console.log(error);
          return errorResponse(error || null);
      }
    },
    delete: async (url: string) => {
      const res = await instance.delete(url);
      console.log(res);
      try {if (res.status) {
        return successResponse(res.data);
      } else {
        console.log(res);
        return errorResponse(res.data);
      } } catch (error) {
        console.log(error);
        return errorResponse(error || null);
      }
    },
  };
};

const successResponse = (data: any) => {
  return { status: true, data: data };
};

const errorResponse = (data: any) => {
  return { status: false, data: data };
};

export { createApiClient };
