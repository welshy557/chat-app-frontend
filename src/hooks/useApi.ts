import useAuth from "./useAuth";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Socket } from "socket.io-client";

/*
  Hook to access project's backend api. Auto handles authorization via useAuth hook. 

    Available Methods: 
      get - get an item
      post - create an item
      put - update an item
      delete - delete an item
    
    Examples:
      import api from "hooks/useApi"
      const api = useApi()

      Get Item
      const item = api.get("items") 

      Delete Item
      api.delete(`items/${item.id}`)

      Update Item
      api.put(`items/${item.id}`, {itemName: "new item name"})

      Create Item
      api.post("items", {itemName: "new item name", quantity: 5})
*/

const useApi = () => {
  const { storedToken } = useAuth(); // Returns null if user is not authenticated
  const postOrPut = async <DataType, ResponseType>(
    method: "post" | "put",
    endpoint: string,
    data: DataType
  ) => {
    const options: AxiosRequestConfig<DataType> = {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        authorization: storedToken as string,
      },
      url: `http://localhost:3001/${endpoint}`,
      data: data,
    };
    try {
      const response: AxiosResponse<ResponseType> = await axios(options);
      return response;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const getOrDelete = async <ReponseType>(
    method: "get" | "delete",
    endpoint: string
  ) => {
    const options: AxiosRequestConfig = {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        authorization: storedToken as string,
      },
      url: `http://localhost:3001/${endpoint}`,
    };
    try {
      const response: AxiosResponse<ReponseType> = await axios(options);
      return response;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const api = {
    get: async <ResponseType>(endpoint: string) =>
      await getOrDelete<ResponseType>("get", endpoint),
    delete: async (endpoint: string) =>
      await getOrDelete<string>("delete", endpoint),
    post: async <DataType, ResponseType>(endpoint: string, data: any) =>
      await postOrPut<DataType, ResponseType>("post", endpoint, data),
    put: async <DataType>(endpoint: string, data: any) =>
      await postOrPut<DataType, string>("put", endpoint, data),
  };

  return api;
};

export default useApi;
