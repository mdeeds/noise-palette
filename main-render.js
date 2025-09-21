// @ts-check

import { GLRender as GLRenderer } from './gl-render.js';
import { Preamble } from './preamble.js';

export class MainRender {
  /** @type {HTMLElement} */
  #container;
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {Preamble} */
  #preamble;
  /** @type {GLRenderer} */
  #renderer;
  /** @type {HTMLButtonElement} */
  #runButton;
  /** @type {HTMLTextAreaElement} */
  #textArea;

  /**
   * @param {HTMLElement} container The container element for the component.
   * @param {Preamble} preamble The preamble instance with user functions.
   */
  constructor(container, preamble) {
    if (!container) {
      throw new Error("A container element must be provided.");
    }
    if (!preamble) {
      throw new Error("A Preamble instance must be provided.");
    }
    this.#container = container;
    this.#preamble = preamble;

    // Create and configure canvas
    this.#canvas = document.createElement('canvas');
    this.#canvas.width = 256;
    this.#canvas.height = 256;
    this.#container.appendChild(this.#canvas);

    // Create the renderer for the canvas
    this.#renderer = new GLRenderer(this.#canvas);

    // Create and configure the text area for the main function
    this.#textArea = document.createElement('textarea');
    this.#configureTextArea();
    this.#textArea.value = `
void main() {
  vec4 fourVec = vec4(v_position.xy, v_position.xy);

  outColor = f(g(fourVec)) * 0.5 + 0.5;
  outColor = vec4(outColor.rgb, 1.0);
}
  `;
    this.#container.appendChild(this.#textArea);
    this.#textArea.addEventListener('input', this.#onInput);

    // Create and configure the run button
    this.#runButton = document.createElement('button');
    this.#runButton.textContent = 'Run';
    this.#runButton.addEventListener('click', this.#runProgram);
    this.#container.appendChild(this.#runButton);

    // Initial run
    this.#onInput(); // Set initial height
    this.#runProgram();
  }

  #configureTextArea() {
    const style = this.#textArea.style;
    style.width = '100%';
    style.height = 'auto';
    style.resize = 'none';
    style.overflowY = 'hidden';
    style.overflowX = 'auto';
    style.boxSizing = 'border-box';
    style.marginTop = '8px';
    style.marginBottom = '8px';
  }

  /**
   * Adjusts the textarea's height to fit its content.
   */
  #onInput = () => {
    this.#textArea.style.height = 'auto'; // Reset height to shrink if text is deleted
    this.#textArea.style.height = `${this.#textArea.scrollHeight}px`; // Set to content height
  }

  #runProgram = () => {
    const mainCode = this.#textArea.value;
    const fullFragmentShader = `${this.#preamble.getText()}\n${mainCode}`;
    this.#renderer.setProgram(fullFragmentShader);
  }
}