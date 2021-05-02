export default interface ValidateJoinResult {
  valid: boolean;
  errorMessage: string; // will be empty if valid is true
}
