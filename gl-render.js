// @ts-check

const VERTEX_SHADER_SOURCE = `#version 300 es
  // An attribute is an input to a vertex shader.
  // It will receive data from a buffer.
  in vec2 a_position;

  // A varying to pass the position to the fragment shader.
  out vec2 v_position;

  void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting.
    gl_Position = vec4(a_position, 0.0, 1.0);

    // Pass the position to the fragment shader.
    v_position = a_position;
  }
`;

export class GLRender {
  /** @type {WebGL2RenderingContext} */
  #gl;
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {WebGLProgram | null} */
  #program = null;

  /**
   * @param {HTMLCanvasElement} canvas The canvas element to render to.
   */
  constructor(canvas) {
    if (!canvas) {
      throw new Error("A canvas element must be provided.");
    }
    this.#canvas = canvas;
    const gl = this.#canvas.getContext('webgl2');
    if (!gl) {
      throw new Error("WebGL2 not supported.");
    }
    this.#gl = gl;

    this.#setupQuad();

    this.#gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
  }

  #setupQuad() {
    const gl = this.#gl;
    // A square that covers the clip space from -1 to 1 in both x and y.
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  /**
   * Compiles a shader.
   * @param {number} type The shader type (VERTEX_SHADER or FRAGMENT_SHADER).
   * @param {string} source The shader source code.
   * @returns {WebGLShader | null} The compiled shader, or null on failure.
   */
  #compileShader(type, source) {
    const gl = this.#gl;
    const shader = gl.createShader(type);
    if (!shader) {
      console.error("Failed to create shader.");
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const friendlySource = source.split('\n').map((line, index) => {
        return `${index + 1}: ${line}`;
      }).join('\n');
      console.error("Source:\n" + friendlySource);

      console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Sets the WebGL program with a new fragment shader.
   * @param {string} fragmentShaderSource The source code for the fragment shader.
   */
  setProgram(fragmentShaderSource) {
    const gl = this.#gl;

    const vertexShader = this.#compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = this.#compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      return; // Compilation failed
    }

    const program = gl.createProgram();
    if (!program) {
      console.error("Failed to create program.");
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}`);
      gl.deleteProgram(program);
      return;
    }

    if (this.#program) {
      gl.deleteProgram(this.#program);
    }

    this.#program = program;
    this.#render();
  }

  #render() {
    const gl = this.#gl;
    if (!this.#program) {
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.#program);

    const positionAttributeLocation = gl.getAttribLocation(this.#program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    // The position buffer is already bound from #setupQuad, but we could re-bind here if needed.
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}