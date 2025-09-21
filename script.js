// @ts-check

import { Preamble } from "./preamble.js";
import { MainRender } from "./main-render.js";

function initialize() {
  const body = document.body;

  // Create and append the preamble container
  const preambleDiv = document.createElement('div');
  preambleDiv.classList.add('preamble');
  body.appendChild(preambleDiv);
  const preamble = new Preamble(preambleDiv);

  // Create and append the fragment container
  const fragmentContainer = document.createElement('div');
  fragmentContainer.classList.add('fragment-container');
  body.appendChild(fragmentContainer);

  // Create and append four fragment divs into the container
  for (let i = 0; i < 4; i++) {
    const fragmentDiv = document.createElement('div');
    fragmentDiv.classList.add('fragment');
    fragmentContainer.appendChild(fragmentDiv);
    new MainRender(fragmentDiv, preamble);
  }
}

window.addEventListener('DOMContentLoaded', initialize);
