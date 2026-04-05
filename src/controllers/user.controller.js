import { AppError } from "../utils/AppError.js";
import User from "../models/user.models.js";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshTokens,
} from "../utils/handleJWT.js";
import { compare, encrypt } from "../utils/handlePassword.js";
import Company from "../models/company.models.js";
import Storage from "../models/storage.models.js";
import { EventEmitter } from "node:events";
import RefreshToken from "../models/refreshToken.models.js";

const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3000";

export async function getUser(req, res, next) {
  try {
    const user_id = req.user._id;

    const user = await User.findById(user_id).populate("company");

    if (!user) {
      throw AppError.notFound("Usuario");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}


export async function registerUser(req, res, next) {
  try {
    const { password } = req.body;

    req.body.password = await encrypt(password);

    const user = await User.create(req.body);
    user.createdAt = new Date();

    const randomCode = "123456";
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.verificationCode = randomCode;

    await user.save();

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
  } catch (error) {
    next(error);
  }
}

export async function doubleStepVerification(req, res, next) {
  try {
    const user_id = req.user._id;
    const user = await User.findById(user_id);
    
    if (!user) {
      throw AppError.notFound("Usuario");
    }
    if (user.verificationAttempts <= 0) {
      await user.deleteOne();
      throw AppError.tooManyRequests("Demasiados intentos de verificación");
    }

    if (req.body.code == user.verificationCode) {
      const updatedUser = await User.findByIdAndUpdate(user_id, { status: "verified" }, { new: true});
      return res.status(200).json({ message: "Usuario verificado", user: updatedUser });
    }

    user.verificationAttempts -= 1;
    await user.save();

    throw AppError.badRequest("Código de verificación incorrecto");
  } catch (error) {

    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw AppError.badRequest("Email o contraseña incorrectos");
    }

    const checkPass = await compare(password, user.password);

    if (!checkPass) {
      throw AppError.badRequest("Email o contraseña incorrectos");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
  } catch (error) {

    next(error);
  }
}

export async function updateUserData(req, res, next) {
  try {
    const { _id } = req.user;
    const { name, lastName, nif } = req.body;

    const user = await User.findByIdAndUpdate(
      _id,
      {
        name: name,
        lastName: lastName,
        nif: nif,
      },
      { new: true },
    );

    if (!user) {
      throw AppError.notFound("Usuario");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateCompanyData(req, res, next) {
  try {
    const { _id } = req.user;

    const { name, cif, address, isFreelance } = req.body;
    const user = await User.findById(_id);

    if (!user) {
      throw AppError.notFound("Usuario");
    }

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
      const updatedUser = await User.findByIdAndUpdate(_id, {
        company: company,
        role: "guest",
      });
      return res.status(200).json(updatedUser);
    }
  } catch (error) {

    next(error);
  }
}

export async function updateCompanyLogo(req, res, next) {
  try {
    if (!req.file) {
      throw AppError.badRequest("No se subió ningún archivo");
    }

    const { filename, originalname, mimetype, size } = req.file;

    const fileData = await Storage.create({
      filename,
      originalName: originalname,
      url: `${PUBLIC_URL}/uploads/${filename}`,
      mimetype,
      size,
    });

    const company = await Company.findByIdAndUpdate(
      req.user.company,
      { logo: fileData.url },
      { new: true }
    );

    if (!company) {
      throw AppError.notFound("Compañía");
    }

    res.status(201).json({ data: fileData });
  } catch (error) {

    next(error);
  }
}

export async function refreshUserSession(req, res, next) {
  try {
    const { refreshToken } = req.body;

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || !storedToken.isActive()) {
      throw AppError.unauthorized("Token no válido");
    }

    refreshTokens(req, res);
  } catch (error) {

    next(error);
  }
}

export async function logOutUser(req, res, next) {
  try {
    await RefreshToken.updateMany(
      { user: req.user._id, revokedAt: null },
      { revokedAt: new Date(), revokedByIp: req.ip },
    );

    res.json({ message: "Todas las sesiones cerradas" });
  } catch (error) {

    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { _id } = req.user;
    const { soft } = req.query;

    if (soft) {
      await User.softDeleteById(_id);
      res.status(200).json({ message: "Usuario eliminado (soft delete)" });
    } else {
      await User.hardDelete(_id);
      res.status(200).json({ message: "Usuario eliminado" });
    }
  } catch (error) {

    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { _id } = req.user;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      throw AppError.notFound("Usuario");
    }

    const checkPass = await compare(currentPassword, user.password);


    if (!checkPass) {
      throw AppError.badRequest("Contraseña actual incorrecta");
    }

    const HashedNewPassword = await encrypt(newPassword);
    await User.findByIdAndUpdate(_id, { password: HashedNewPassword });

    res.status(200).json({ message: "Contraseña actualizada" });
  } catch (error) {

    next(error);
  }
}

export async function inviteUser(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      throw AppError.forbidden("Acceso denegado. Solo administradores.");
    }

    const eventEmitter = new EventEmitter();
    const { email, name, lastName } = req.body;
    const password = 123456;

    const newUser = await User.create({
      name,
      password: await encrypt(password.toString()),
      lastName,
      email,
      company: req.user.company,
      role: "guest",
      status: "pending",
    });

    eventEmitter.emit("user:invited", newUser);

    res.status(201).json({
      message: "Usuario invitado con éxito",
      user: newUser,
    });
  } catch (error) {

    next(error);
  }
}

export async function cleanDB(req, res, next) {
  try {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Storage.deleteMany({});
    await RefreshToken.deleteMany({});

    res.status(200).json({ message: "Base de datos limpiada" });
  } catch (error) {

    next(error);
  }
}
