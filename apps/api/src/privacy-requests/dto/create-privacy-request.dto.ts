import { Transform } from "class-transformer";
import { Equals, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { LeadLocale, PrivacyRequestType } from "@prisma/client";

const CONTROL = /^[^\u0000-\u001F\u007F]*$/u;
const trim = (value: unknown) => typeof value === "string" ? value.trim() : value;
const optional = (value: unknown) => { const result = trim(value); return result === "" ? undefined : result; };

export class CreatePrivacyRequestDto {
  @Transform(({ value }) => typeof trim(value) === "string" ? (trim(value) as string).toLowerCase() : value)
  @IsString() @MaxLength(320) @IsEmail() @Matches(CONTROL) email!: string;
  @Transform(({ value }) => trim(value)) @IsEnum(PrivacyRequestType) requestType!: PrivacyRequestType;
  @Transform(({ value }) => optional(value)) @IsOptional() @IsString() @MaxLength(1000) @Matches(CONTROL) message?: string;
  @Transform(({ value }) => trim(value)) @IsEnum(LeadLocale) locale!: LeadLocale;
  @Equals(true) privacyAccepted!: boolean;
  @Transform(({ value }) => optional(value)) @IsOptional() @IsString() @MaxLength(255) @Matches(CONTROL) website?: string;
}
