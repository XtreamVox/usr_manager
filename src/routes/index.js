import { readdirSync} from "fs";
import { join } from "path";
import { Router } from "express";

const __dirname = import.meta.dirname;
const   router = Router();

const ficheros = readdirSync(__dirname).filter((fichero) => {
    return fichero.endsWith(".routes.js");
});

console.log(ficheros);

async function setupRoutes() {
    for (const fichero of ficheros) {
        const routeName = fichero.replace('.routes.js', '');
        const routeModule = (await import(join(__dirname, fichero))).default;
        router.use(`/${routeName}`, routeModule);
        console.log(`Ruta cargada /${routeName}`);
    }
}

await setupRoutes();

export default router;