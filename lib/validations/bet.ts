import { BetResult } from "@prisma/client";
import { z } from "zod";

import { calculateProfitLoss, normalizeLegs, roundToCents } from "@/lib/calculations/betting";
import { classifySport } from "@/lib/utils/basketball-sport";

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

const dateField = z
  .string()
  .trim()
  .min(1, "Date is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

const moneyField = z.coerce
  .number({
    invalid_type_error: "Must be a number",
  })
  .finite("Must be a valid number")
  .nonnegative("Must be zero or greater");

const positiveMoneyField = z.coerce
  .number({
    invalid_type_error: "Must be a number",
  })
  .finite("Must be a valid number")
  .positive("Must be greater than zero");

const oddsField = z.coerce
  .number({
    invalid_type_error: "Odds must be a number",
  })
  .int("Odds must be a whole number")
  .refine((value) => value !== 0, "Odds cannot be zero");

export const betInputSchema = z
  .object({
    datePlaced: dateField,
    dateSettled: z.string().trim().optional().or(z.literal("")),
    sport: z.string().trim().min(1, "Sport is required"),
    league: z.string().trim().min(1, "League is required"),
    event: z.string().trim().min(1, "Event is required"),
    betType: z.string().trim().min(1, "Bet type is required"),
    selection: z.string().trim().min(1, "Selection is required"),
    americanOdds: oddsField,
    stake: positiveMoneyField,
    result: z.nativeEnum(BetResult, {
      errorMap: () => ({ message: "Invalid result" }),
    }),
    payout: moneyField,
    isLive: z.coerce.boolean(),
    isParlay: z.coerce.boolean(),
    legs: z.coerce.number().int().positive().optional(),
    notes: z.string().trim().max(500, "Notes must be 500 characters or fewer").optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    const normalizedLegs = normalizeLegs(value.isParlay, value.legs);

    if (value.isParlay && normalizedLegs <= 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parlays must have more than one leg",
        path: ["legs"],
      });
    }

    if (!value.isParlay && value.legs && value.legs !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Straight bets must have exactly one leg",
        path: ["legs"],
      });
    }

    if ((value.result === BetResult.PUSH || value.result === BetResult.VOID) && value.payout !== value.stake) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Push and void bets must return the original stake as payout",
        path: ["payout"],
      });
    }

    if (value.result === BetResult.LOSS && value.payout !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Losing bets must have a payout of 0",
        path: ["payout"],
      });
    }

    if (value.result === BetResult.WIN && value.payout < value.stake) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Winning bets must have payout greater than or equal to stake",
        path: ["payout"],
      });
    }

    if (value.dateSettled && new Date(value.dateSettled) < new Date(value.datePlaced)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Settled date cannot be earlier than placed date",
        path: ["dateSettled"],
      });
    }
  });

export type BetInput = z.infer<typeof betInputSchema>;

export function parseBetInput(payload: unknown) {
  const parsed = betInputSchema.parse(payload);
  const normalizedSport = classifySport(parsed.sport, parsed.selection);
  const profitLoss = roundToCents(
    calculateProfitLoss({
      result: parsed.result,
      payout: parsed.payout,
      stake: parsed.stake,
    }),
  );

  return {
    datePlaced: parseDateOnly(parsed.datePlaced),
    dateSettled: parsed.dateSettled ? parseDateOnly(parsed.dateSettled) : null,
    sport: normalizedSport,
    league: normalizedSport,
    event: parsed.event,
    betType: parsed.betType,
    selection: parsed.selection,
    americanOdds: parsed.americanOdds,
    stake: roundToCents(parsed.stake),
    result: parsed.result,
    payout: roundToCents(parsed.payout),
    profitLoss,
    isLive: parsed.isLive,
    isParlay: parsed.isParlay,
    legs: normalizeLegs(parsed.isParlay, parsed.legs),
    notes: parsed.notes || null,
  };
}
