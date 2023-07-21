import { User } from 'src/models/user.model';

export class SetupPatientAccessDataResponse {
  user: User;
  token: string;
}
