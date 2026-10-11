import { IsIn } from 'class-validator';
import { PLAN_LIMITS } from '../../common/utils/plans.js';

export class UpdatePlanDto {
  @IsIn(Object.keys(PLAN_LIMITS))
  plan!: string;
}