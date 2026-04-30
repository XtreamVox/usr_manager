import User from "../models/user.models.js";
import { verifyAccessToken } from "../utils/handleJWT.js";

let ioInstance = null;

export const SOCKET_EVENTS = {
  DELIVERYNOTE_NEW: "deliverynote:new",
  DELIVERYNOTE_SIGNED: "deliverynote:signed",
  CLIENT_NEW: "client:new",
  PROJECT_NEW: "project:new",
};

const getCompanyRoom = (company) => {
  if (!company) return null;
  return String(company._id ?? company);
};

const normalizeToken = (token) => {
  if (!token || typeof token !== "string") return null;
  return token.startsWith("Bearer ") ? token.split(" ").pop() : token;
};

const getTokenFromHandshake = (socket) => {
  return normalizeToken(
    socket.handshake.auth?.token ??
      socket.handshake.query?.token ??
      socket.handshake.headers?.authorization,
  );
};

export function configureSocketIo(io) {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      const dataToken = verifyAccessToken(token);

      if (!dataToken?._id) {
        return next(new Error("Authentication error"));
      }

      const user = await User.findById(dataToken._id);
      const companyRoom = getCompanyRoom(user?.company);

      if (!user || !companyRoom) {
        return next(new Error("Authentication error"));
      }

      socket.data.user = user;
      socket.data.companyRoom = companyRoom;

      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const { companyRoom, user } = socket.data;
    socket.join(companyRoom);

    console.log(`[WS] Conectado: ${socket.id} user:${user._id} room:${companyRoom}`);

    socket.on("disconnect", () => {
      console.log(`[WS] Desconectado: ${socket.id} room:${companyRoom}`);
    });
  });

  return io;
}

export function emitToCompany(company, eventName, payload) {
  const companyRoom = getCompanyRoom(company);

  if (!ioInstance || !companyRoom) {
    return false;
  }

  ioInstance.to(companyRoom).emit(eventName, payload);
  return true;
}
