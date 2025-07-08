import { Task, User, Athlete } from "@shared/schema";

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Michael Chen' },
  { id: '3', name: 'Emma Davis' },
  { id: '4', name: 'James Wilson' },
  { id: '5', name: 'Lisa Rodriguez' }
];

export const mockAthletes: Athlete[] = [
  { id: '1', name: 'Alex Thompson' },
  { id: '2', name: 'Jordan Martinez' },
  { id: '3', name: 'Taylor Kim' },
  { id: '4', name: 'Casey Brown' },
  { id: '5', name: 'Morgan Lee' },
  { id: '6', name: 'Riley Garcia' }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Review Q4 Performance Assessment',
    description: 'Complete comprehensive review of athlete performance metrics for Q4',
    type: 'manual.assessment.review',
    assigneeId: '1',
    relatedAthleteIds: ['1', '2'],
    deadline: '2024-02-15',
    priority: 'high',
    status: 'new',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    creatorId: '3'
  },
  {
    id: '2',
    name: 'Schedule Follow-up Call',
    description: 'Arrange follow-up call with athlete regarding training plan adjustments',
    type: 'manual.communication.schedule_call',
    assigneeId: '2',
    relatedAthleteIds: ['3'],
    deadline: '2024-02-10',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    creatorId: '1'
  },
  {
    id: '3',
    name: 'Injury Recovery Assessment',
    description: 'Evaluate recovery progress and adjust rehabilitation protocol',
    type: 'manual.injury.followup',
    assigneeId: '3',
    relatedAthleteIds: ['4'],
    deadline: '2024-02-08',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-17T11:45:00Z',
    creatorId: '2'
  },
  {
    id: '4',
    name: 'Complete Onboarding Process',
    description: 'Finish setting up new athlete profile and initial assessments',
    type: 'system.admin.onboarding',
    assigneeId: '4',
    relatedAthleteIds: ['5'],
    deadline: '2024-02-05',
    priority: 'medium',
    status: 'completed',
    createdAt: '2024-01-08T13:00:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
    creatorId: '1'
  },
  {
    id: '5',
    name: 'Payment Processing Issue',
    description: 'Resolve failed payment transaction for monthly subscription',
    type: 'system.payment.failed',
    assigneeId: '5',
    relatedAthleteIds: ['6'],
    deadline: '2024-02-12',
    priority: 'high',
    status: 'new',
    createdAt: '2024-01-14T07:45:00Z',
    updatedAt: '2024-01-14T07:45:00Z',
    creatorId: '3'
  },
  {
    id: '6',
    name: 'Review Flagged Assessment',
    description: 'Investigate assessment results that were automatically flagged by the system',
    type: 'system.assessment.flagged',
    assigneeId: '1',
    relatedAthleteIds: ['2', '3'],
    deadline: '2024-02-18',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2024-01-16T12:20:00Z',
    updatedAt: '2024-01-17T09:10:00Z',
    creatorId: '4'
  }
];

export const taskTypes = [
  { value: 'manual.assessment.review', label: 'Manual Assessment Review' },
  { value: 'manual.communication.schedule_call', label: 'Manual Communication Schedule Call' },
  { value: 'manual.injury.followup', label: 'Manual Injury Followup' },
  { value: 'system.admin.onboarding', label: 'System Admin Onboarding' },
  { value: 'system.payment.failed', label: 'System Payment Failed' },
  { value: 'system.assessment.flagged', label: 'System Assessment Flagged' }
];
