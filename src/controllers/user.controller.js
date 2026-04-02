import { ApiError } from "../middleware/error-handler.middleware";
import User from "../models/user.models";
import { generateAccessToken, generateRefreshToken } from "../utils/handleJWT";
import { compare, encrypt } from "../utils/handlePassword";
import Company from "../models/company.models";

export async function getUsers(req, res) {
  const user_id = req.user._id;

  const user = await User.findById(user_id).populate("company");

  res.status(200).json(user);
}

// TODO: El encrypt puede ser un middleware.
// TODO: Gestión de ZOD

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

  const answer = {
    userData: {
      email: user.email,
      status: user.status,
      role: user.role,
    },
    accessToken: accessToken,
    refreshToken: refreshToken,
  };

  res.status(200).send(answer).json(answer);
}

// TODO: esquemas de Zod
// TODO: middleware para restar trys y bloquear al usuario si llega a 0
export async function doubleStepVerification(req, res) {
  const user_id = req.user._id;

  const user = await User.findById(user_id);

  if (req.body.code == user.verificationCode) {
    await User.findByIdAndUpdate(user_id, { status: "verified" });
    return res.status(200).json(user.req.body.code);
  }
  ApiError.badRequest("Código de verificación incorrecto");
}

// TODO: esquemas de Zod
// TODO: Hacer ApiError para badRequest
// ASK: Si no ha iniciado sesión. Tiene token?
export async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await User.find({ email: email });
  const checkPass = compare(password, user.password);
  if (user && checkPass) {
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
    ApiError.badRequest("Email o contraseña incorrectos");
  }
}

// TODO: validación Zod
export async function updateUserData(req, res) {
  const { _id } = req.user;
  // ASK: estos datos no deberian estar ya en User según lo que he hecho en register???
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

// TODO: validación de Zod
export async function updateCompanyData(req, res) {
  const { _id } = req.user;

  const { name, cif, address, isFreelance } = req.body;

  if (isFreelance) {
    const user = await User.findById(_id);
    const company = await Company.create({
      owner: user._id,
      name: user.name,
      cif: user.nif,
      address: user.address,
      isFreelance: isFreelance,
    });

    return res.status(200).json(company);
  }

  if ((await !Company.find({ cif: cif }))) {
    await Company.create({
      owner: _id,
      name: name,
      cif: cif,
      address: address,
      isFreelance: isFreelance,
    });
    return res.status(200).json(company);
  } else {
    let user = await User.findByIdAndUpdate(_id, {
      company: company._id,
      role: "guest",
    });
    return res.status(200).json(user);
  }
}

export async function updateCompanyLogo(req, res){
  const {_id} = req.user;

}