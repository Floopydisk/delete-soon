import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  churchZone?: string;
  membershipLevel: string;
  role: 'superAdmin' | 'admin' | 'pastorate';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name must be less than 100 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [100, 'Last name must be less than 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number must be less than 20 characters']
  },
  churchZone: {
    type: String,
    trim: true,
    maxlength: [100, 'Church zone must be less than 100 characters']
  },
  membershipLevel: {
    type: String,
    enum: ['Member', 'Leader', 'Pastor', 'Elder'],
    default: 'Member'
  },
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'pastorate'],
    default: 'pastorate'
  },
  
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);