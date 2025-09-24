import { Task, User, Athlete, MediaFile, TaskMedia, TaskAthlete, TaskHistory } from "@shared/schema";

// Extended Task type for UI compatibility
export interface TaskWithRelations extends Task {
  relatedAthleteIds?: string[];
}

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
  { id: '6', name: 'Riley Garcia', sport: 'Baseball', team: 'Tigers', position: 'Pitcher' },
  { id: '7', name: 'Sam Johnson', sport: 'Football', team: 'Hawks', position: 'Quarterback' },
  { id: '8', name: 'Blake Wilson', sport: 'Hockey', team: 'Wolves', position: 'Center' },
  { id: '9', name: 'Avery Davis', sport: 'Volleyball', team: 'Storms', position: 'Setter' },
  { id: '10', name: 'Dakota Miller', sport: 'Golf', team: null, position: null }
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

export const mockTasks: TaskWithRelations[] = [
  {
    id: '1',
    name: 'Review Q4 Performance Assessment',
    description: 'Complete comprehensive review of athlete performance metrics for Q4',
    type: 'datareporting',
    assigneeId: '1',
    deadline: today,
    priority: 'high',
    status: 'new',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z'),
    creatorId: '3',
    comment: null,
    relatedAthleteIds: ['1', '2']
  },
  {
    id: '2',
    name: 'Schedule Injury Call',
    description: 'Schedule call with athlete regarding injury recovery progress',
    type: 'injury_call',
    assigneeId: '2',
    deadline: yesterday,
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date('2024-01-12T10:30:00Z'),
    updatedAt: new Date('2024-01-16T14:20:00Z'),
    creatorId: '1',
    comment: null,
    relatedAthleteIds: ['3']
  },
  {
    id: '3',
    name: 'Injury Recovery Assessment',
    description: 'Evaluate recovery progress and adjust rehabilitation protocol',
    type: 'injury',
    assigneeId: '3',
    deadline: tomorrow,
    priority: 'high',
    status: 'pending',
    createdAt: new Date('2024-01-10T09:15:00Z'),
    updatedAt: new Date('2024-01-17T11:45:00Z'),
    creatorId: '2',
    comment: 'Patient showing good progress with mobility exercises',
    relatedAthleteIds: ['4']
  },
  {
    id: '4',
    name: 'Schedule Onboarding Call',
    description: 'Schedule initial onboarding call with new athlete',
    type: 'onboarding_call',
    assigneeId: '4',
    deadline: inTwoDays,
    priority: 'medium',
    status: 'completed',
    createdAt: new Date('2024-01-08T13:00:00Z'),
    updatedAt: new Date('2024-01-18T16:30:00Z'),
    creatorId: '1',
    comment: null,
    relatedAthleteIds: ['5']
  },
  {
    id: '5',
    name: 'Payment Processing Issue',
    description: 'Resolve failed payment transaction for monthly subscription',
    type: 'generaltodo',
    assigneeId: '5',
    deadline: inFiveDays,
    priority: 'high',
    status: 'new',
    createdAt: new Date('2024-01-14T07:45:00Z'),
    updatedAt: new Date('2024-01-14T07:45:00Z'),
    creatorId: '3',
    comment: null,
    relatedAthleteIds: ['6']
  },
  {
    id: '6',
    name: 'Review Flagged Assessment',
    description: 'Investigate assessment results that were automatically flagged by the system',
    type: 'assessment_review',
    assigneeId: '1',
    deadline: threeDaysAgo,
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date('2024-01-16T12:20:00Z'),
    updatedAt: new Date('2024-01-17T09:10:00Z'),
    creatorId: '4',
    comment: null,
    relatedAthleteIds: ['2', '3']
  },
  {
    id: '7',
    name: 'Team Meeting Preparation',
    description: 'Prepare presentation materials for quarterly team meeting',
    type: 'generaltodo',
    assigneeId: '3',
    deadline: null,
    priority: 'low',
    status: 'new',
    createdAt: new Date('2024-01-18T08:00:00Z'),
    updatedAt: new Date('2024-01-18T08:00:00Z'),
    creatorId: '2',
    comment: null,
    relatedAthleteIds: ['1']
  },
  {
    id: '8',
    name: 'Coach Assignment Document',
    description: 'Review and complete coach assignment documentation for new athlete',
    type: 'coach_assignment',
    assigneeId: '1',
    deadline: tomorrow,
    priority: 'high',
    status: 'new',
    createdAt: new Date('2024-01-19T09:00:00Z'),
    updatedAt: new Date('2024-01-19T09:00:00Z'),
    creatorId: '4',
    comment: null,
    relatedAthleteIds: ['7']
  }
];

// Mock media files for testing attachments
export const mockMediaFiles: MediaFile[] = [
  {
    id: 'media_1',
    filename: 'injury_report_alex.pdf',
    originalName: 'Alex Thompson Injury Report.pdf',
    mimeType: 'application/pdf',
    fileSize: 2048576,
    filePath: '/uploads/media_1.pdf',
    uploadedAt: new Date('2024-01-10T09:00:00Z')
  },
  {
    id: 'media_2',
    filename: 'movement_analysis_video.mp4',
    originalName: 'Jordan Martinez Movement Analysis.mp4',
    mimeType: 'video/mp4',
    fileSize: 15728640,
    filePath: '/uploads/media_2.mp4',
    uploadedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 'media_3',
    filename: 'exercise_form_image.jpg',
    originalName: 'Proper Exercise Form Example.jpg',
    mimeType: 'image/jpeg',
    fileSize: 512000,
    filePath: '/uploads/media_3.jpg',
    uploadedAt: new Date('2024-01-17T14:15:00Z')
  }
];

// Mock task-media relationships
export const mockTaskMedia: TaskMedia[] = [
  {
    id: 'tm_1',
    taskId: '1',
    mediaId: 'media_2',
    mediaType: 'description',
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 'tm_2',
    taskId: '3',
    mediaId: 'media_1',
    mediaType: 'description',
    createdAt: new Date('2024-01-10T09:00:00Z')
  },
  {
    id: 'tm_3',
    taskId: '3',
    mediaId: 'media_3',
    mediaType: 'comment',
    createdAt: new Date('2024-01-17T14:15:00Z')
  }
];

// Mock task-athlete relationships
export const mockTaskAthletes: TaskAthlete[] = [
  { taskId: '1', athleteId: '1' },
  { taskId: '1', athleteId: '2' },
  { taskId: '2', athleteId: '3' },
  { taskId: '3', athleteId: '4' },
  { taskId: '4', athleteId: '5' },
  { taskId: '5', athleteId: '6' },
  { taskId: '6', athleteId: '2' },
  { taskId: '6', athleteId: '3' },
  { taskId: '7', athleteId: '1' }
];

// Mock task history
export const mockTaskHistory: TaskHistory[] = [
  {
    id: 'th_1',
    taskId: '1',
    action: 'created',
    oldValue: null,
    newValue: 'Task created',
    userId: '3',
    createdAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    id: 'th_2',
    taskId: '2',
    action: 'created',
    oldValue: null,
    newValue: 'Task created',
    userId: '1',
    createdAt: new Date('2024-01-12T10:30:00Z')
  },
  {
    id: 'th_3',
    taskId: '2',
    action: 'status_changed',
    oldValue: 'new',
    newValue: 'in_progress',
    userId: '2',
    createdAt: new Date('2024-01-16T14:20:00Z')
  },
  {
    id: 'th_4',
    taskId: '3',
    action: 'created',
    oldValue: null,
    newValue: 'Task created',
    userId: '2',
    createdAt: new Date('2024-01-10T09:15:00Z')
  },
  {
    id: 'th_5',
    taskId: '3',
    action: 'comment_added',
    oldValue: null,
    newValue: 'Patient showing good progress with mobility exercises',
    userId: '3',
    createdAt: new Date('2024-01-17T11:45:00Z')
  },
  {
    id: 'th_6',
    taskId: '3',
    action: 'media_added',
    oldValue: null,
    newValue: 'Added exercise form image',
    userId: '3',
    createdAt: new Date('2024-01-17T14:15:00Z')
  },
  {
    id: 'th_7',
    taskId: '4',
    action: 'created',
    oldValue: null,
    newValue: 'Task created',
    userId: '1',
    createdAt: new Date('2024-01-08T13:00:00Z')
  },
  {
    id: 'th_8',
    taskId: '4',
    action: 'status_changed',
    oldValue: 'new',
    newValue: 'completed',
    userId: '4',
    createdAt: new Date('2024-01-18T16:30:00Z')
  }
];

export const taskTypes = [
  { value: 'mechanicalanalysis', label: 'Mechanical Analysis' },
  { value: 'datareporting', label: 'Data Reporting' },
  { value: 'injury', label: 'Injury' },
  { value: 'generaltodo', label: 'General Task' },
  { value: 'injury_call', label: 'Injury Call' },
  { value: 'onboarding_call', label: 'Onboarding Call' },
  { value: 'coach_assignment', label: 'Coach Assignment' },
  { value: 'assessment_review', label: 'Assessment Review' }
];
