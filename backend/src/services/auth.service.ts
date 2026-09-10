import bcrypt from "bcrypt";
import User from "../models/user.model";
import AppError from "../utils/appError";

interface RegisterData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

const registerUser = async (data: RegisterData) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }],
  }).select("+passwordHash");

  if (existingUser) {
  if (existingUser.email === data.email) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "Email is already registered"
    );
  }

  throw new AppError(
    409,
    "USERNAME_ALREADY_EXISTS",
    "Username is already taken"
  );
}

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    email: data.email,
    username: data.username,
    displayName: data.displayName,
    passwordHash,
    authProviders: ["password"],
  });

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    authProviders: user.authProviders,
  };
};

export { registerUser };