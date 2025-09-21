// @ts-check

const FRAGMENT_SHADER_PREAMBLE = `#version 300 es
#version 300 es
precision mediump float;

// Input from the vertex shader, ranges from -1 to 1.
in vec2 v_position;

// The output color of the fragment.
out vec4 outColor;

vec4 f(in vec4 x) {
  vec4 d = cos(3.14 * 0.707 * x);
  return vec4(d.rgba * d.gbar);
}

vec4 g(in vec4 x) {
  return (x * 7.0);
}
`;

export class Preamble {

  /** @type {HTMLTextAreaElement} */
  #textArea;

  /** @type {HTMLElement} */
  #container;

  /**
   * @param {HTMLElement} container The container element for the preamble.
   */
  constructor(container) {
    if (!container) {
      throw new Error("A container element must be provided.");
    }
    this.#container = container;
    this.#textArea = document.createElement('textarea');
    this.#textArea.value = FRAGMENT_SHADER_PREAMBLE;
    this.#configureTextArea();
    this.#container.appendChild(this.#textArea);

    this.#textArea.addEventListener('input', this.#onInput);
    // Initial resize
    this.#onInput();
  }

  #configureTextArea() {
    const style = this.#textArea.style;
    style.width = '100%';
    style.height = 'auto'; // Start with auto height
    style.resize = 'none'; // Disable manual resizing by the user
    style.overflowY = 'hidden'; // No vertical scrollbar
    style.overflowX = 'auto'; // Horizontal scrollbar if needed
    style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height
  }

  /**
   * Adjusts the textarea's height to fit its content.
   */
  #onInput = () => {
    this.#textArea.style.height = 'auto'; // Reset height to shrink if text is deleted
    this.#textArea.style.height = `${this.#textArea.scrollHeight}px`; // Set to content height
  }

  /**
   * @returns {string} The current text content of the text area.
   */
  getText() {
    return this.#textArea.value;
  }
}