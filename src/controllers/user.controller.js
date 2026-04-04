//import { ApiError } from "../middleware/error-handler.middleware.js";
import User from "../models/user.models.js";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshTokens,
} from "../utils/handleJWT.js";
import { compare, encrypt } from "../utils/handlePassword.js";
import Company from "../models/company.models.js";
import Storage from "../models/storage.models.js";
import { once, EventEmitter } from "node:events";
import RefreshToken from "../models/refreshToken.models.js";

const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3000";

export async function getUser(req, res) {
  const user_id = req.user._id;

  const user = await User.findById(user_id).populate("company");

  res.status(200).json(user);
}


export async function registerUser(req, res) {
  const { password } = req.body;

  // cifrar la contraseña con bcrypt
  req.body.password = await encrypt(password);
  // crear el usuario (ya checkea duplicados)
  const user = await User.create(req.body);
  user.createdAt = new Date();

  // TODO
  const randomCode = "123456";
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  user.verificationCode = randomCode;
  user.save();

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    createdByIp: req.ip,
  });
  const answer = {
    userData: {
      email: user.email,
      status: user.status,
      role: user.role,
    },
    accessToken: accessToken,
    refreshToken: refreshToken,
  };

  res.status(200).json(answer);
}

// TODO: middleware para restar trys y bloquear al usuario si llega a 0
export async function doubleStepVerification(req, res) {
  const user_id = req.user._id;

  const user = await User.findById(user_id);

  if (req.body.code == user.verificationCode) {
    await User.findByIdAndUpdate(user_id, { status: "verified" });
    return res.status(200).json({ code: req.body.code });
  }
  //throw ApiError.badRequest("Código de verificación incorrecto");
}

// TODO: Hacer ApiError para badRequest
export async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  const checkPass = await compare(password, user.password);
  if (user && checkPass) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      createdByIp: req.ip,
    });

    const answer = {
      userData: {
        email: user.email,
        status: user.status,
        role: user.role,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    res.status(200).json(answer);
  } else {
    //throw ApiError.badRequest("Email o contraseña incorrectos");
  }
}

export async function updateUserData(req, res) {
  const { _id } = req.user;
  const { name, lastName, nif } = req.body;

  // Actualizar usuario con nuevos datos
  const user = await User.findByIdAndUpdate(
    _id,
    {
      name: name,
      lastName: lastName,
      nif: nif,
    },
    { new: true },
  );
  // Para que devuelva el usuario ya actualizado);
  res.status(200).json(user);
}

export async function updateCompanyData(req, res) {
  const { _id } = req.user;

  const { name, cif, address, isFreelance } = req.body;
  const user = await User.findById(_id);

  if (isFreelance) {
    const company = await Company.create({
      owner: user._id,
      name: user.name,
      cif: user.nif,
      address: user.address,
      isFreelance: isFreelance,
    });
    user.company = company._id;
    await user.save();

    return res.status(200).json(company);
  }
  const company = await Company.findOne({ cif: cif });

  if (!company) {
    const new_company = await Company.create({
      owner: _id,
      name: name,
      cif: cif,
      address: address,
      isFreelance: isFreelance,
    });
    user.company = new_company._id;
    await user.save();

    return res.status(200).json(new_company);
  } else {
    const user = await User.findByIdAndUpdate(_id, {
      company: company,
      role: "guest",
    });
    return res.status(200).json(user);
  }
}

export async function updateCompanyLogo(req, res) {
  if (!req.file) {
    // return handleHttpError(res, "No se subió ningún archivo", 400);
    return console.log("fck");
  }

  const { filename, originalname, mimetype, size } = req.file;

  const fileData = await Storage.create({
    filename,
    originalName: originalname,
    url: `${PUBLIC_URL}/uploads/${filename}`,
    mimetype,
    size,
  });

  await Company.findByIdAndUpdate(req.user.company, { logo: fileData.url }, { new: true});

  res.status(201).json({ data: fileData });
}

export async function refreshUserSession(req, res) {
  const { refreshToken } = req.body;

  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (storedToken && storedToken.isActive()) {
    refreshTokens(req, res);
  } else {
    // TODO
    // ApiError.unauthorized("Token no válido");
  }
}

export async function logOutUser(req, res) {
  await RefreshToken.updateMany(
    { user: req.user._id, revokedAt: null },
    { revokedAt: new Date(), revokedByIp: req.ip },
  );

  res.json({ message: "Todas las sesiones cerradas" });
}

export async function deleteUser(req, res) {
  const { _id } = req.user;
  const { soft } = req.query;

  if (soft) {
    await User.softDeleteById(_id);
    res.status(200).json({ message: "Usuario eliminado (soft delete)" });
  } else {
    await User.hardDelete(_id);
    res.status(200).json({ message: "Usuario eliminado" });
  }
}
export async function changePassword(req, res) {
  const { _id } = req.user;
  const { currentPassword, newPassword } = req.body;

  // Verificar contraseña actual
  const user = await User.findById(_id);
  const checkPass = compare(currentPassword, user.password);

  if (checkPass) {
    // Usar Zod .refine() para validar que la nueva contraseña sea diferente de la actual.
    const HashedNewPassword = await encrypt(newPassword);
    await User.findByIdAndUpdate(_id, { password: HashedNewPassword });
    res.status(200).json({ message: "Contraseña actualizada" });
  }
}

export async function inviteUser(req, res) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Solo administradores." });
  }
  const { email, name, lastName } = req.body;
  const password = 123456; // Generar contraseña temporal o código de verificación
  const newUser = await User.create({
    name,
    password: await encrypt(password.toString()),
    lastName,
    email,
    company: req.user.company,
    role: "guest",
    status: "pending", // Opcional: para saber que no ha activado su cuenta
  });

  eventEmitter.emit("user:invited", newUser);

  res.status(201).json({
    message: "Usuario invitado con éxito",
    user: newUser,
  });
}
