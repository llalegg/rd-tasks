import { Task, User, Athlete } from "@shared/schema";

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'coach' },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', role: 'analyst' },
  { id: '3', name: 'Emma Davis', email: 'emma@example.com', role: 'therapist' },
  { id: '4', name: 'James Wilson', email: 'james@example.com', role: 'admin' },
  { id: '5', name: 'Lisa Rodriguez', email: 'lisa@example.com', role: 'coach' }
];

export const mockAthletes: Athlete[] = [
  { id: '1', name: 'Alex Thompson', sport: 'Basketball', team: 'Lakers', position: 'Point Guard' },
  { id: '2', name: 'Jordan Martinez', sport: 'Soccer', team: 'United', position: 'Forward' },
  { id: '3', name: 'Taylor Kim', sport: 'Tennis', team: null, position: null },
  { id: '4', name: 'Casey Brown', sport: 'Swimming', team: 'Sharks', position: 'Freestyle' },
  { id: '5', name: 'Morgan Lee', sport: 'Track', team: 'Eagles', position: 'Sprinter' },
  { id: '6', name: 'Riley Garcia', sport: 'Baseball', team: 'Tigers', position: 'Pitcher' }
];

// Generate dates relative to today for testing deadline badges
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const inTwoDays = new Date(today);
inTwoDays.setDate(inTwoDays.getDate() + 2);
const inFiveDays = new Date(today);
inFiveDays.setDate(inFiveDays.getDate() + 5);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Review Q4 Performance Assessment',
    description: 'Complete comprehensive review of athlete performance metrics for Q4',
    type: 'data_reporting',
    assigneeId: '1',
    relatedAthleteIds: ['1', '2'],
    deadline: today,
    priority: 'high',
    status: 'new',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z'),
    creatorId: '3',
    comment: null,
    historyLog: []
  },
  {
    id: '2',
    name: 'Schedule Follow-up Call',
    description: 'Arrange follow-up call with athlete regarding training plan adjustments',
    type: 'schedule_call_onboarding',
    assigneeId: '2',
    relatedAthleteIds: ['3'],
    deadline: yesterday,
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date('2024-01-12T10:30:00Z'),
    updatedAt: new Date('2024-01-16T14:20:00Z'),
    creatorId: '1',
    comment: null,
    historyLog: []
  },
  {
    id: '3',
    name: 'Injury Recovery Assessment',
    description: 'Evaluate recovery progress and adjust rehabilitation protocol',
    type: 'injury',
    assigneeId: '3',
    relatedAthleteIds: ['4'],
    deadline: tomorrow,
    priority: 'high',
    status: 'pending',
    createdAt: new Date('2024-01-10T09:15:00Z'),
    updatedAt: new Date('2024-01-17T11:45:00Z'),
    creatorId: '2',
    comment: null,
    historyLog: []
  },
  {
    id: '4',
    name: 'Complete Onboarding Process',
    description: 'Finish setting up new athlete profile and initial assessments',
    type: 'coach_assignment',
    assigneeId: '4',
    relatedAthleteIds: ['5'],
    deadline: inTwoDays,
    priority: 'medium',
    status: 'completed',
    createdAt: new Date('2024-01-08T13:00:00Z'),
    updatedAt: new Date('2024-01-18T16:30:00Z'),
    creatorId: '1',
    comment: null,
    historyLog: []
  },
  {
    id: '5',
    name: 'Payment Processing Issue',
    description: 'Resolve failed payment transaction for monthly subscription',
    type: 'general_to_do',
    assigneeId: '5',
    relatedAthleteIds: ['6'],
    deadline: inFiveDays,
    priority: 'high',
    status: 'new',
    createdAt: new Date('2024-01-14T07:45:00Z'),
    updatedAt: new Date('2024-01-14T07:45:00Z'),
    creatorId: '3',
    comment: null,
    historyLog: []
  },
  {
    id: '6',
    name: 'Review Flagged Assessment',
    description: 'Investigate assessment results that were automatically flagged by the system',
    type: 'assessment_review',
    assigneeId: '1',
    relatedAthleteIds: ['2', '3'],
    deadline: threeDaysAgo,
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date('2024-01-16T12:20:00Z'),
    updatedAt: new Date('2024-01-17T09:10:00Z'),
    creatorId: '4',
    comment: null,
    historyLog: []
  },
  {
    id: '7',
    name: 'Team Meeting Preparation',
    description: 'Prepare presentation materials for quarterly team meeting',
    type: 'general_to_do',
    assigneeId: '3',
    relatedAthleteIds: ['1'],
    deadline: null,
    priority: 'low',
    status: 'new',
    createdAt: new Date('2024-01-18T08:00:00Z'),
    updatedAt: new Date('2024-01-18T08:00:00Z'),
    creatorId: '2',
    comment: null,
    historyLog: []
  }
];

export const taskTypes = [
  { value: 'mechanical_analysis', label: 'Mechanical Analysis' },
  { value: 'data_reporting', label: 'Data Reporting' },
  { value: 'injury', label: 'Injury' },
  { value: 'general_to_do', label: 'General To-Do' },
  { value: 'schedule_call_injury', label: 'Schedule Call (Injury)' },
  { value: 'schedule_call_onboarding', label: 'Schedule Call (Onboarding)' },
  { value: 'coach_assignment', label: 'Coach Assignment' },
  { value: 'create_program', label: 'Create Program' },
  { value: 'assessment_review', label: 'Assessment Review' }
];
