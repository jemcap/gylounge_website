import crypto from "crypto";

export type BankTransferDetails = {
  membershipFeeGhs: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  instructions: string;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const parseMembershipFee = (raw: string | undefined) => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

export const getBankTransferDetails = (): BankTransferDetails => {
  const membershipFeeGhs = parseMembershipFee(process.env.MEMBERSHIP_FEE_GHS);
  const accountName = process.env.BANK_TRANSFER_ACCOUNT_NAME?.trim();
  const accountNumber = process.env.BANK_TRANSFER_ACCOUNT_NUMBER?.trim();
  const bankName = process.env.BANK_TRANSFER_BANK_NAME?.trim();
  const instructions = process.env.BANK_TRANSFER_INSTRUCTIONS?.trim();

  if (
    !membershipFeeGhs ||
    !accountName ||
    !accountNumber ||
    !bankName ||
    !instructions
  ) {
    throw new Error(
      "Bank transfer env vars missing. Set MEMBERSHIP_FEE_GHS, BANK_TRANSFER_ACCOUNT_NAME, BANK_TRANSFER_ACCOUNT_NUMBER, BANK_TRANSFER_BANK_NAME, BANK_TRANSFER_INSTRUCTIONS.",
    );
  }

  return {
    membershipFeeGhs,
    accountName,
    accountNumber,
    bankName,
    instructions,
  };
};

export const generateBankTransferReference = () => {
  // Short, human-copyable, safe for statements.
  const token = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
  return `GYL-MEM-${token}`;
};

