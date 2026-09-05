/**
 * The four stages of a STAR answer, in the order a candidate should reach them.
 */
export enum StarStage {
  SITUATION = 'SITUATION',
  TASK = 'TASK',
  ACTION = 'ACTION',
  RESULT = 'RESULT',
}

export const STAR_STAGE_ORDER: StarStage[] = [
  StarStage.SITUATION,
  StarStage.TASK,
  StarStage.ACTION,
  StarStage.RESULT,
];
