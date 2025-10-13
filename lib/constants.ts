// lib/utils/constants.ts
export const DEPARTMENTS = ['Science', 'Art', 'Commercial'] as const;
export const SUBJECTS = {
  General: ['Mathematics', 'English Language'],
  Science: ['Physics', 'Chemistry', 'Biology', 'Further Mathematics'],
  Art: ['Literature', 'Government', 'History', 'Geography'],
  Commercial: ['Economics', 'Commerce', 'Accounting', 'Business Studies']
} as const;

export const EXAM_DURATION = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 120
} as const;

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;

