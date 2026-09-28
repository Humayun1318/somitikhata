import { cache } from "react";
import { makeQueryClient } from "./makeQueryClient";



// Server only: one client per request (React cache dedupes inside a request).
const getQueryClient = cache(() => makeQueryClient());

export default getQueryClient;