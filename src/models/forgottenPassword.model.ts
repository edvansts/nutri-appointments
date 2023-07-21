import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class ForgottenPassword extends Model<ForgottenPassword> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
