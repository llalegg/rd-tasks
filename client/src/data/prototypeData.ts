// Prototype data matching what's in your Neon database
export const prototypePeople = [
  // Coaches (can be assignees)
  { id: "coach1", name: "Coach Sarah Johnson", type: "coach", sport: "General", position: "Head Coach", role: "coach" },
  { id: "coach2", name: "Coach Mike Davis", type: "coach", sport: "Strength", position: "Strength Coach", role: "coach" },
  { id: "coach3", name: "Dr. Emily Rodriguez", type: "coach", sport: "Medical", position: "Sports Medicine", role: "coach" },
  
  // Athletes (can be related to tasks)
  { id: "athlete1", name: "John Smith", type: "athlete", sport: "Football", position: "Quarterback" },
  { id: "athlete2", name: "Maria Garcia", type: "athlete", sport: "Basketball", position: "Point Guard" },
  { id: "athlete3", name: "James Brown", type: "athlete", sport: "Baseball", position: "Pitcher" },
  { id: "athlete4", name: "Lisa Wang", type: "athlete", sport: "Soccer", position: "Midfielder" },
  { id: "athlete5", name: "Robert Taylor", type: "athlete", sport: "Track", position: "Sprinter" },
];

export const prototypeTasks = [
  {
    id: "task1",
    name: "Knee Injury Assessment",
    description: "Complete assessment for athlete knee injury",
    type: "injury",
    status: "new",
    priority: "high",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    assigneeId: "coach3",
    creatorId: "coach3",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete1"]
  },
  {
    id: "task2", 
    name: "Training Plan Review",
    description: "Review and update weekly training plan",
    type: "training",
    status: "in_progress", 
    priority: "medium",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    assigneeId: "coach1",
    creatorId: "coach1",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete2", "athlete3"]
  },
  {
    id: "task3",
    name: "Performance Analysis",
    description: "Analyze last game performance metrics", 
    type: "analysis",
    status: "pending",
    priority: "medium",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assigneeId: "coach1",
    creatorId: "coach1", 
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete1"]
  },
  {
    id: "task4",
    name: "Strength Training Program",
    description: "Design new strength training program",
    type: "training", 
    status: "new",
    priority: "high",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    assigneeId: "coach2",
    creatorId: "coach2",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete4", "athlete5"]
  },
  {
    id: "task5",
    name: "Team Meeting Preparation", 
    description: "Prepare agenda for team meeting",
    type: "meeting",
    status: "new",
    priority: "low",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    assigneeId: "coach1",
    creatorId: "coach1",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: []
  },
  {
    id: "task6",
    name: "Recovery Protocol Review",
    description: "Review recovery protocols", 
    type: "medical",
    status: "completed",
    priority: "medium",
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assigneeId: "coach3",
    creatorId: "coach3",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete1"]
  },
  {
    id: "task7",
    name: "Equipment Inventory",
    description: "Check equipment inventory",
    type: "admin",
    status: "in_progress",
    priority: "low", 
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    assigneeId: "coach2",
    creatorId: "coach2",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: []
  },
  {
    id: "task8",
    name: "Nutrition Plan Update",
    description: "Update nutrition plans",
    type: "nutrition",
    status: "new",
    priority: "medium",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    assigneeId: "coach3", 
    creatorId: "coach3",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete1"]
  },
  {
    id: "task9",
    name: "Season Planning Meeting",
    description: "Plan upcoming season",
    type: "planning",
    status: "pending",
    priority: "high",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    assigneeId: "coach1",
    creatorId: "coach1",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: []
  },
  {
    id: "task10",
    name: "Injury Prevention Workshop",
    description: "Conduct injury prevention workshop",
    type: "education", 
    status: "new",
    priority: "medium",
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    assigneeId: "coach3",
    creatorId: "coach3",
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedAthleteIds: ["athlete2", "athlete3"]
  }
];

// Helper functions
export const getCoaches = () => prototypePeople.filter(p => p.type === 'coach');
export const getAthletes = () => prototypePeople.filter(p => p.type === 'athlete');
export const getPerson = (id: string) => prototypePeople.find(p => p.id === id);
export const getTask = (id: string) => prototypeTasks.find(t => t.id === id);
