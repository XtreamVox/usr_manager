import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import env from './config/env.js';
import dbConnect from './config/db.js';

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

await dbConnect();

server.listen(env.PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${env.PORT}`);
    console.log(`Entorno: ${env.NODE_ENV}`);
});

let isShuttingDown = false;

const closeSocketIo = () =>
    new Promise((resolve) => {
        io.close(() => {
            console.log('Socket.IO cerrado');
            resolve();
        });
    });

const closeHttpServer = () =>
    new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }
            console.log('Servidor HTTP cerrado');
            resolve();
        });
    });

const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`${signal} recibido. Cerrando servidor...`);

    const forceExit = setTimeout(() => {
        console.error('Forzando cierre');
        process.exit(1);
    }, 10000);

    try {
        await closeSocketIo();
        await closeHttpServer();
        await mongoose.connection.close();
        console.log('MongoDB desconectado');
        clearTimeout(forceExit);
        process.exit(0);
    } catch (error) {
        clearTimeout(forceExit);
        console.error('Error durante el cierre ordenado:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
