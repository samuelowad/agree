import axios from "axios";
import config from "config/config";
import { Point } from "geojson";

const KEY = config.GOOGLE_MAPS_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api";

export class GoogleMapHelper {
  public static async getCoordinatesFromAddress(address: string, key: string = KEY): Promise<Point> {
    try {
      const response = await axios.get(`${BASE_URL}/geocode/json`, {
        params: {
          address,
          key,
        },
      });

      const { lng, lat } = await response.data.results[0].geometry.location;

     return  {type:"Point", coordinates:[lng, lat]};
    } catch (error) {
      throw new Error("error getting coordinates:" + error.message);
    }
  }

  public static async distancesMatrix({ origins, destinations }: { [key: string]: string[] }, key: string = KEY): Promise<any> {
    let  response
    try {
       response = await axios.get(`${BASE_URL}/distancematrix/json`, {
        params: {
          key,
          origins: origins.join("|"),
          destinations: destinations.join("|"),
          mode: "driving",
        },
      });
      return response.data.rows[0].elements[0].distance.value;
    } catch (error) {
      console.log(error);
      // @ts-ignore
      throw new Error( response.data);
    }
  }
}
