import { UserDocument } from 'src/user/user.schema';

export interface SanitizedUser {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
}

export function UserSanitizer(user: UserDocument): SanitizedUser {
  return {
    id: user._id.toString(),
    name: user.name,
    userName: user.userName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    isActive: user.isActive,
  };
}
