

"use strict"
import { getData } from "./get-data.js"

const productData = await getData ("products")
console.log(productData);

//render card products
const containercard = document.getElementById("container-card")
pro

