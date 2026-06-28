import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'usersNew', autoIndex: true })
export class User {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String, unique: true, index: true, trim: true })
  userName!: string;

  @Prop({ required: true, type: String })
  password!: string;

  @Prop({ required: true, type: String, unique: true })
  email!: string;

  @Prop({ required: true, unique: true, type: String })
  phoneNumber!: string;
  @Prop({ required: true, type: String })
  pinCode!: string;
  @Prop({ type: Number, default: 0 })
  loginRetryCount!: number;

  @Prop({ type: Date, default: null })
  loginLockedUntil!: Date | null;
  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', function () {
  this.isActive = this.deletedAt === null;

  if (this.loginLockedUntil && this.loginLockedUntil < new Date()) {
    this.loginLockedUntil = null;
    this.loginRetryCount = 0;
  }
});
