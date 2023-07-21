import { User } from 'src/models/user.model';

export class FirstAccessSetupResponse {
  user: User;
  token: string;
}
