import { IsString, IsOptional, MaxLength, IsInt, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  genderId?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  nationalityCountryCode?: string;

  @IsOptional()
  @IsString()
  preferredCurrency?: string;

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  /**
   * The `countries.id` integer FK that identifies which country's dial prefix
   * (`phonecode`) applies to this phone number.
   * Replaces the old free-text `phoneCode` string field.
   */
  @IsOptional()
  @IsInt()
  phoneCountryId?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}