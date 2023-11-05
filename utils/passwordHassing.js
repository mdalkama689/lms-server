import bcrypt from "bcrypt";

async function passwordHashing(password, saltRounds) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export default passwordHashing;
