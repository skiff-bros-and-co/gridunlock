import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import copyStaticFiles from "esbuild-copy-static-files";

const IS_PROD = process.env.NODE_ENV === "production";

/** @type esbuild.BuildOptions  */
const options = {
  entryPoints: ["src/index.tsx", "src/service-worker.ts"],
  bundle: true,
  outdir: "dist",
  minify: IS_PROD,
  sourcemap: true,
  target: ["chrome105", "firefox105", "safari16"],
  loader: {
    ".png": "dataurl",
    ".woff": "dataurl",
    ".woff2": "dataurl",
    ".eot": "dataurl",
    ".ttf": "dataurl",
    ".svg": "dataurl",
  },
  plugins: [
    sassPlugin({
      cssImports: true,
    }),
    copyStaticFiles({
      src: "./static",
      dest: "./dist",
      dereference: true,
      errorOnExist: true,
      preserveTimestamps: true,
      recursive: true,
    }),
  ],
};

if (IS_PROD) {
  esbuild
    .build(options)
    .then((result) => console.info("Build Completed:", result))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  esbuild
    .serve({ port: 5001, servedir: "dist" }, options)
    .then((result) => {
      console.info("Hosted successfully at http://" + result.host + ":" + result.port);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
