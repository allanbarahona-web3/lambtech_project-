import { Transform } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { LeadInterest, LeadLocale, LeadSourceSite } from "@prisma/client";

const MAX_FULL_NAME_LENGTH = 160;
const MAX_EMAIL_LENGTH = 320;
const MAX_PHONE_LENGTH = 40;
const MAX_COUNTRY_LENGTH = 100;
const MAX_COMPANY_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 2_000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_CAMPAIGN_LENGTH = 255;
const MAX_WEBSITE_LENGTH = 255;

const NO_CONTROL_CHARACTERS = /^[^\u0000-\u001F\u007F]*$/u;
const NO_UNSAFE_MESSAGE_CONTROL_CHARACTERS = /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/u;

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function trimOptionalString(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return trimmedValue === "" ? undefined : trimmedValue;
}

function normalizeEmail(value: unknown): unknown {
  const trimmedValue = trimString(value);
  return typeof trimmedValue === "string" ? trimmedValue.toLowerCase() : trimmedValue;
}

function normalizeHoneypot(value: unknown): unknown {
  const trimmedValue = trimOptionalString(value);
  return typeof trimmedValue === "string"
    ? trimmedValue.slice(0, MAX_WEBSITE_LENGTH)
    : trimmedValue;
}

export class CreatePublicLeadDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_FULL_NAME_LENGTH)
  @Matches(NO_CONTROL_CHARACTERS)
  fullName!: string;

  @Transform(({ value }) => normalizeEmail(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_EMAIL_LENGTH)
  @IsEmail()
  @Matches(NO_CONTROL_CHARACTERS)
  email!: string;

  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PHONE_LENGTH)
  @Matches(NO_CONTROL_CHARACTERS)
  phone?: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_COUNTRY_LENGTH)
  @Matches(NO_CONTROL_CHARACTERS)
  country!: string;

  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(MAX_COMPANY_LENGTH)
  @Matches(NO_CONTROL_CHARACTERS)
  company?: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsEnum(LeadInterest)
  interest!: LeadInterest;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_MESSAGE_LENGTH)
  @MaxLength(MAX_MESSAGE_LENGTH)
  @Matches(NO_UNSAFE_MESSAGE_CONTROL_CHARACTERS)
  message!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @IsEnum(LeadLocale)
  locale!: LeadLocale;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @IsEnum(LeadSourceSite)
  sourceSite!: LeadSourceSite;

  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(MAX_CAMPAIGN_LENGTH)
  @Matches(NO_CONTROL_CHARACTERS)
  campaign?: string;

  @IsBoolean()
  @Equals(true)
  privacyAccepted!: boolean;

  @Transform(({ value }) => normalizeHoneypot(value))
  @IsOptional()
  @IsString()
  @MaxLength(MAX_WEBSITE_LENGTH)
  website?: string;
}
