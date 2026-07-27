declare module "*.wasm" {
  const module: WebAssembly.Module | string;
  export default module;
}

declare namespace WebAssembly {
  function compile(bytes: BufferSource): Promise<Module>;
}
