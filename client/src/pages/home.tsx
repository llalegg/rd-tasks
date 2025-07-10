import TaskManager from "@/components/TaskManager";
import { PageTransition } from "@/components/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <TaskManager />
    </PageTransition>
  );
}
