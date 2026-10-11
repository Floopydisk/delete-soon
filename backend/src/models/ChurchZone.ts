import mongoose, { Schema, Document } from 'mongoose';

export interface IChurchZone extends Document {
  zoneName: string;
  /** @deprecated Use regionalPastorName. Kept for existing zone records. */
  districtPastorName?: string;
  /** @deprecated Use regionalPastorEmail. Kept for existing zone records. */
  districtPastorEmail?: string;
  regionalPastorName?: string;
  regionalPastorEmail?: string;
  zonalCoordinatorName?: string;
  zonalCoordinatorEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const churchZoneSchema = new Schema<IChurchZone>({
  zoneName: {
    type: String,
    required: [true, 'Zone name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Zone name must be less than 100 characters']
  },
  districtPastorName: {
    type: String,
    trim: true,
    maxlength: [100, 'District pastor name must be less than 100 characters']
  },
  districtPastorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  regionalPastorName: {
    type: String,
    trim: true,
    maxlength: [100, 'Regional pastor name must be less than 100 characters']
  },
  regionalPastorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  zonalCoordinatorName: {
    type: String,
    trim: true,
    maxlength: [100, 'Zonal coordinator name must be less than 100 characters']
  },
  zonalCoordinatorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
}, {
  timestamps: true
});

export default mongoose.model<IChurchZone>('ChurchZone', churchZoneSchema);
