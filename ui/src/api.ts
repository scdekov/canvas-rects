import axios from "axios";
import { API_URL } from "./constants";
import { BoundingBox } from "./types";

export const saveBox = (box: BoundingBox) => {
  return axios.post(`${API_URL}/save-box/`, {
    start_x: box.startX,
    start_y: box.startY,
    width: box.width,
    height: box.height
  });
};

export const getBox = async () => {
  try {
    const resp = await axios.get(`${API_URL}/get-box`);
    return resp.data;
  } catch {
    // only 404 is expected here so no additional behaviour needed
  }
}
