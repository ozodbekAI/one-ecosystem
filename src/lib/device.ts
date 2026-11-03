let lite: boolean | undefined;

/**
 * True when the browser has no usable GPU: WebGL is missing or runs on the CPU
 * (Chrome's GPU blocklist on many Linux machines, VMs, remote desktops). Such
 * devices get the light version of the site — no WebGL scene, no stacked 3D
 * layers, no drifting light — because software compositing makes it stutter.
 * Add `?webgl=1` to the address to force the full version.
 */
export function isLiteDevice(): boolean {
  if (lite !== undefined) return lite;
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("webgl") === "1") return (lite = false);
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return (lite = true);
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    lite = /swiftshader|llvmpipe|softpipe|software/i.test(name);
  } catch {
    lite = true;
  }
  return lite;
}
