import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import {
  ALCOHOLIC_STATUS,
  CLINICAL_HISTORY,
  EATING_BEHAVIOR,
  EATING_PLACE,
  ENVIRONMENT,
  FAMILIAR_BACKGROUND,
  SMOKER_STATUS,
  SYMPTOM,
  WEIGHT_GAIN_REASON,
} from 'src/constants/enum';
import { Patient } from './patient.model';

@Table
export class ClinicalEvaluation extends Model<ClinicalEvaluation> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    autoIncrement: false,
  })
  id: string;

  @Column({ type: DataType.STRING })
  medicationsAndSupplementsUsed: string;

  @Column({ type: DataType.STRING })
  weightLossTreatmentsPerformed: string;

  @Column({ type: DataType.ENUM, values: Object.values(SMOKER_STATUS) })
  smokerStatus: SMOKER_STATUS;

  @Column({ type: DataType.STRING })
  smokerDescription?: string;

  @Column({ type: DataType.ENUM, values: Object.values(ALCOHOLIC_STATUS) })
  alcoholicStatus: ALCOHOLIC_STATUS;

  @Column({ type: DataType.STRING })
  alcoholicDescription?: string;

  @Column({ type: DataType.STRING })
  physicalActivityDescription: string;

  @Column({ type: DataType.STRING })
  spareTimeDescription: string;

  @Column({ type: DataType.ENUM, values: Object.values(EATING_BEHAVIOR) })
  eatingBehavior: EATING_BEHAVIOR;

  @Column({
    type: DataType.ENUM,
    values: Object.values(EATING_PLACE),
    allowNull: false,
  })
  breakfastPlace: EATING_PLACE;
  @Column({
    type: DataType.ENUM,
    values: Object.values(EATING_PLACE),
    allowNull: false,
  })
  snackPlace: EATING_PLACE;
  @Column({
    type: DataType.ENUM,
    values: Object.values(EATING_PLACE),
    allowNull: false,
  })
  lunchPlace: EATING_PLACE;
  @Column({
    type: DataType.ENUM,
    values: Object.values(EATING_PLACE),
    allowNull: false,
  })
  afternoonSnackPlace: EATING_PLACE;
  @Column({
    type: DataType.ENUM,
    values: Object.values(EATING_PLACE),
    allowNull: false,
  })
  dinnerPlace: EATING_PLACE;
  @Column({
    type: DataType.ENUM,
    values: Object.values(EATING_PLACE),
    allowNull: false,
  })
  supperPlace: EATING_PLACE;

  @Column({ type: DataType.ENUM, values: Object.values(ENVIRONMENT) })
  mainMealsEnvironment: ENVIRONMENT;

  @Column({
    type: DataType.ARRAY(
      DataType.ENUM({ values: Object.values(FAMILIAR_BACKGROUND) }),
    ),
    allowNull: false,
    defaultValue: [],
  })
  familiarBackground: FAMILIAR_BACKGROUND[];

  @Column({ type: DataType.STRING })
  otherFamiliarBackgrounds?: string;

  @Column({
    type: DataType.ARRAY(
      DataType.ENUM({ values: Object.values(WEIGHT_GAIN_REASON) }),
    ),
    defaultValue: [],
  })
  weightGainReasons: WEIGHT_GAIN_REASON[];

  @Column({
    type: DataType.ARRAY(
      DataType.ENUM({ values: Object.values(CLINICAL_HISTORY) }),
    ),
    defaultValue: [],
  })
  clinicalHistory: CLINICAL_HISTORY[];

  @Column({ type: DataType.STRING })
  otherClinicalHistories?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  examDate: Date;

  @Column({
    type: DataType.ARRAY(DataType.ENUM({ values: Object.values(SYMPTOM) })),
    defaultValue: [],
  })
  reportedSymptoms: SYMPTOM[];

  @Column({ type: DataType.STRING })
  otherReportedSymptoms?: string;

  @ForeignKey(() => Patient)
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  patientId: string;

  @BelongsTo(() => Patient)
  patient: Patient;
}
