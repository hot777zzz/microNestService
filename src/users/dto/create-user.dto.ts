import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 100)
  username: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 100)
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
