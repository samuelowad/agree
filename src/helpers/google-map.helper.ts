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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const { lng, lat } = await response.data.results[0].geometry.location as { lng: number; lat: number };

     return  {type:"Point", coordinates:[lng, lat]};
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`error getting coordinates: ${error.message}`);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return response.data.rows[0]?.elements[0].distance.value as number;
    } catch (error) {
      console.log(error);
      throw new Error( `${response?.data}`);
    }
  }
}
