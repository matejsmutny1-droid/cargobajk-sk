import vinext from "vinext";
import {defineConfig} from "vite";
import {cloudflare} from "@cloudflare/vite-plugin";
export default defineConfig({plugins:[vinext(),cloudflare({...(process.env.CARGOBAJK_LOCAL_PREVIEW==='1'?{configPath:'wrangler.local.jsonc'}:{}),viteEnvironment:{name:"rsc",childEnvironments:["ssr"]}})]});
