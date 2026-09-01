import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OmniRoute",
    short_name: "OmniRoute",
    description: "Universal AI gateway: 352+ providers through one endpoint.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#7c3aed",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
