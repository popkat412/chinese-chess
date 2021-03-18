export default function validateNickname(username: string): true | string {
  const notEmpty = username.trim().length != 0;
  const matchesRegex = /^\w+$/.test(username);
  const withinLengthLimit = username.length < 32;

  if (!notEmpty) return "Nickname can't be empty";
  if (!matchesRegex) return "Nickname has to be alphanumeric";
  if (!withinLengthLimit) return "Nickname has to be below 32 characters";

  return true;
}
