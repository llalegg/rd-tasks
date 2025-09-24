import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskGenerator } from '@/lib/taskGenerator';
import { useToast } from '@/hooks/use-toast';

interface TaskGeneratorDemoProps {
  onTasksGenerated?: (tasks: any[]) => void;
}

export function TaskGeneratorDemo({ onTasksGenerated }: TaskGeneratorDemoProps) {
  const { toast } = useToast();

  const generateOnboardingTasks = () => {
    const tasks = TaskGenerator.generateOnboardingTasks('athlete_123', 'coach_456');
    console.log('Generated onboarding tasks:', tasks);
    
    toast({
      title: "Onboarding Tasks Generated",
      description: `Created ${tasks.length} tasks for athlete onboarding`,
    });
    
    if (onTasksGenerated) {
      onTasksGenerated(tasks);
    }
  };

  const generateInjuryTasks = () => {
    const tasks = TaskGenerator.generateInjuryTasks('athlete_789', 'therapist_101');
    console.log('Generated injury tasks:', tasks);
    
    toast({
      title: "Injury Tasks Generated",
      description: `Created ${tasks.length} tasks for injury management`,
    });
    
    if (onTasksGenerated) {
      onTasksGenerated(tasks);
    }
  };

  const generateAssessmentTasks = () => {
    const tasks = TaskGenerator.generateAssessmentTasks('athlete_456', 'analyst_202');
    console.log('Generated assessment tasks:', tasks);
    
    toast({
      title: "Assessment Tasks Generated",
      description: `Created ${tasks.length} tasks for assessment review`,
    });
    
    if (onTasksGenerated) {
      onTasksGenerated(tasks);
    }
  };

  const generateCustomTasks = () => {
    const tasks = TaskGenerator.generateAutomaticTasks([
      {
        type: 'injury_call',
        athleteId: 'athlete_123',
        assigneeId: 'coach_456',
        priority: 'high',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        description: 'Urgent call needed for recent injury'
      },
      {
        type: 'coach_assignment',
        athleteId: 'athlete_123',
        assigneeId: 'coach_456',
        priority: 'medium',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        description: 'Complete coach assignment documentation'
      }
    ]);
    
    console.log('Generated custom tasks:', tasks);
    
    toast({
      title: "Custom Tasks Generated",
      description: `Created ${tasks.length} custom tasks`,
    });
    
    if (onTasksGenerated) {
      onTasksGenerated(tasks);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Automatic Task Generator Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={generateOnboardingTasks}
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="font-semibold">Generate Onboarding Tasks</span>
            <span className="text-sm opacity-80">For new athlete</span>
          </Button>
          
          <Button 
            onClick={generateInjuryTasks}
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="font-semibold">Generate Injury Tasks</span>
            <span className="text-sm opacity-80">For injury management</span>
          </Button>
          
          <Button 
            onClick={generateAssessmentTasks}
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="font-semibold">Generate Assessment Tasks</span>
            <span className="text-sm opacity-80">For assessment review</span>
          </Button>
          
          <Button 
            onClick={generateCustomTasks}
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="font-semibold">Generate Custom Tasks</span>
            <span className="text-sm opacity-80">Custom configuration</span>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground mt-4">
          <p>Click any button to generate automatic tasks. Check the console for the generated task data.</p>
          <p className="mt-2">
            <strong>Task Types:</strong> injury_call, onboarding_call, coach_assignment, assessment_review
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
