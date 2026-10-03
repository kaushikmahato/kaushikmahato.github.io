// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

// Provide default Cloudinary cloud name fallback so sample posts render without error
process.env.PUBLIC_CLOUDINARY_CLOUD_NAME =
  process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "dellp9a4z";

// https://astro.build/config
export default defineConfig({
  site: "https://kaushikmahato.github.io",

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--font-inter",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Inter.woff2"],
            weight: "normal",
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "JetBrainsMono",
      cssVariable: "--font-jet-brains-mono",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/JetBrainsMono.woff2"],
            weight: "normal",
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
  ],

  integrations: [
    sitemap(),
    pagefind(),
    icon(),
    expressiveCode({
      plugins: [pluginLineNumbers()],
      themes: ["aurora-x"],
      styleOverrides: {
        codeFontFamily:
          "var(--font-jet-brains-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
        uiFontFamily:
          "var(--font-inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      },
    }),
  ],

  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["anchor"] },
        },
      ],
    ],
  },

  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "object-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com",
        "base-uri 'self'",
        "img-src 'self' https://res.cloudinary.com https://images.unsplash.com data:",
        "media-src 'self' https://res.cloudinary.com",
        "font-src 'self' data:",
        "frame-src 'self' https://challenges.cloudflare.com",
        "worker-src 'self' blob: https://challenges.cloudflare.com",
        "child-src 'self' https://challenges.cloudflare.com blob:",
        "manifest-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://challenges.cloudflare.com", "blob:"],
        hashes: [
          "sha256-+D181lN2Iw1b9lkNhIL2BSfLXvTnxTpdqxKE5OjSgk0=",
          "sha256-UnpvhDyF7OXferJXLLEvpK6eSVKujiCxuakCMAAfX0k=",
          "sha256-1uLA37rSE279Z3LD4V5UesnNrJXsLL3WlqRDPbR0SiQ=",
          "sha256-XOWpFOzUtq3WTcITdHEbeGIbvByWMkUYHPLkeNqUnrg=",
          "sha256-O/cT6xyqpBVZwWGYzXVpX7QJEsLa8cqTX0G7ptzRry8=",
          "sha256-y8GXDJSth6TkGGn3PesTxxuEoiMEn+PMMT3VzFcGcc8=",
          "sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw=",
          "sha256-QzWFZi+FLIx23tnm9SBU4aEgx4x8DsuASP07mfqol/c=",
          "sha256-0chmwFk0zaA528yFfGV7J9ppIpdfTPPULncDF3WG7Zs=",
          "sha256-eIXWvAmxkr251LJZkjniEK5LcPF3NkapbJepohwYRIc=",
          "sha256-Q2BPg90ZMplYY+FSdApNErhpWafg2hcRRbndmvxuL/Q=",
          "sha256-YvmHN+RLoaKyj0Wvr1lawwJSU85HX9VU+XMIN2yJTdI=",
        ],
      },
      styleDirective: {
        resources: ["'self'", "'unsafe-hashes'"],
        hashes: [
          "sha256-67q59S31acjGWb3psqbKYDT5xwNRYlSm9O048QblK5E=",
          "sha256-es7QWgmF/ubMUaU3QoJeeuEuzS19NCiBZBSUk30rChg=",
          "sha256-JEIRlf20kkwP2Xx1I6C4gFcTpGl7lfjN60HV9R/+mGw=",
          "sha256-JwvoxOu1z7Edr38rj6X5LqLUpWdDUNxMxxG6D2H9u8c=",
          "sha256-7VYXd2pXfwpYh3Wc8UouX6DF7Va/cOUbABgFszCDk+s=",
          "sha256-PjBkwE8xcYZAp+HsnzzOVNqa/Ra+/v1Fnx6f0PW6ic4=",
          "sha256-zYHi7M2Ne0jhy0UWoKbV7YnzK1UB3km/Pa1Ax0Pys+8=",
          "sha256-H5WGa810hS/xbsgRrHr3Sf2itSZRR0wUYDBZe5CdCKA=",
          "sha256-Zj7sV3OXaoMQcuQ0W05HjRhdguLYdNaD7wU0wihN31g=",
          "sha256-fH1akGPdRx9NC8AcH5uPnDbEqtXVDZ6ViI8Pc/aHrts=",
          "sha256-7B7LxK1KtekaXHE6TY0kFs9M0sBkSl/ESEA/WHD2+Dk=",
          "sha256-pAbChXer4zdj3JoDHcqjNdEJosgfnzege3qQDNZyLxg=",
          "sha256-O7z5/Zr4CyasHH0BaxOJONPqtRBb4LoM489l4rVkJJw=",
          "sha256-h7COyDNvRjegU+1dDIktwT44N7FNSJeZ3CUJfJeBNSE=",
          "sha256-y2JW07Q0/vstgbPj/xxtTnjG70DPkHRftv4fFS7r5sk=",
          "sha256-9G4h3Bt2rC8Ty15cZ/qd2TP2iSP3TULSYvKnTPWzbyE=",
          "sha256-nBuQodxHbMFGFDc+709UWrh0nGQICZuQQlLQkhPrmW4=",
          "sha256-TqO3OLUG4Ila2f/GgYSKdMkr8Eu3FF5u9vV/7qCKYlA=",
          "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
          "sha256-Z1HxjJ2kQ5UaOV2Ds31+5xdy+WTAWc3c9W2P8ISEtoM=",
          "sha256-OHHJt3V7bbGQVFFoSS8ClWV1uXy19wbP3kJTdWrvtd4=",
          "sha256-T9sUEzjkQ3SOy0NCXhmKIAUloPgSGMCsqFmQgcrgWkE=",
          "sha256-Zys6qhZqZHbNK8WL50GZmgMNy/sw2Xrrhc/s1xYuUCM=",
        ],
      },
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
