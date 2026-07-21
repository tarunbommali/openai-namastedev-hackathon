import { User, IUser, UserRole } from "../models/User";

export const userRepository = {
  findByEmail(email: string) {
    if (!email) return null;
    return User.findOne({ email: email.toLowerCase().trim() });
  },
  findById(id: string) {
    return User.findById(id);
  },
  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    organizationId?: unknown;
    mustChangePassword?: boolean;
  }) {
    return User.create(data);
  },
  list() {
    return User.find().select("-passwordHash").sort({ createdAt: -1 });
  },
  async bumpTokenVersion(userId: string) {
    return User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true });
  }
};

export type { IUser };
